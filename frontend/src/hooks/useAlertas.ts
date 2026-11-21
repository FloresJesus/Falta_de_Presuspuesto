import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { AlertaSOS, ContactoConfianza } from '@/lib/types';

export function useAlertas() {
  const { user } = useAuth();
  const [alertas, setAlertas] = useState<AlertaSOS[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!user) {
      setAlertas([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('alertas_sos')
      .select('*')
      .eq('usuaria_id', user.id)
      .order('creada_en', { ascending: false });
    if (err) setError(err.message);
    else setAlertas((data ?? []) as AlertaSOS[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // La carga inicial de datos es asíncrona: se despacha dentro del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  const enviar = useCallback(
    async (latitud?: number | null, longitud?: number | null, sesionId?: string | null, mensaje?: string) => {
      const { data, error } = await supabase.rpc('alertar_sos', {
        p_sesion_id: sesionId ?? null,
        p_latitud: latitud ?? null,
        p_longitud: longitud ?? null,
        p_mensaje: mensaje ?? null,
      });
      if (error) return { error: error.message };
      const d = data as Record<string, unknown> | null;
      const alerta = {
        id: String(d?.alerta_id ?? ''),
        usuaria_id: user?.id ?? '',
        sesion_id: sesionId ?? null,
        contacto_id: null,
        latitud: latitud ?? null,
        longitud: longitud ?? null,
        mensaje: String(d?.mensaje ?? 'Alerta SOS enviada'),
        estado: 'enviada' as const,
        es_simulacion: true,
        creada_en: String(d?.creada_en ?? new Date().toISOString()),
        actualizado_en: new Date().toISOString(),
        contacto: null,
      };
      void alerta;
      await cargar();
      return { data };
    },
    [cargar, user],
  );

  const actualizarEstado = useCallback(
    async (id: string, estado: AlertaSOS['estado']) => {
      const { error } = await supabase
        .from('alertas_sos')
        .update({ estado })
        .eq('id', id);
      if (error) return { error: error.message };
      await cargar();
      return { error: null };
    },
    [cargar],
  );

  const obtenerContacto = useCallback(
    async (contactoId: string | null) => {
      if (!contactoId) return { data: null, error: null as string | null };
      const { data, error } = await supabase
        .from('contactos_confianza')
        .select('*')
        .eq('id', contactoId)
        .maybeSingle();
      return { data: (data ?? null) as ContactoConfianza | null, error: error?.message ?? null };
    },
    [],
  );

  return { alertas, loading, error, cargar, enviar, actualizarEstado, obtenerContacto };
}
