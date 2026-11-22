import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { SolicitudContacto } from '@/lib/types';

export interface EnviarSolicitudInput {
  destinatarioId: string;
  nombre: string;
  telefono: string;
  correo?: string | null;
  relacion?: string | null;
}

type Resultado = { error: string | null; id?: string };

/** Solicitudes para convertirse en contactos de confianza (dentro de la app). */
export function useSolicitudes() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<SolicitudContacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!user) {
      setSolicitudes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('solicitudes_contacto')
      .select('*')
      .or(`solicitante_id.eq.${user.id},destinatario_id.eq.${user.id}`)
      .order('creado_en', { ascending: false });
    if (err) setError(err.message);
    else setSolicitudes((data ?? []) as SolicitudContacto[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // La carga inicial es asíncrona: se despacha dentro del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  const entrantes = useMemo(
    () => solicitudes.filter((s) => s.destinatario_id === user?.id && s.estado === 'pendiente'),
    [solicitudes, user],
  );

  const salientes = useMemo(
    () => solicitudes.filter((s) => s.solicitante_id === user?.id),
    [solicitudes, user],
  );

  const enviar = useCallback(
    async (input: EnviarSolicitudInput): Promise<Resultado> => {
      const { data, error: err } = await supabase.rpc('enviar_solicitud_contacto', {
        p_destinatario_id: input.destinatarioId,
        p_nombre: input.nombre.trim(),
        p_telefono: input.telefono.trim() || null,
        p_correo: input.correo?.trim() || null,
        p_relacion: input.relacion?.trim() || null,
      });
      if (err) return { error: err.message };
      await cargar();
      return { error: null, id: data as string };
    },
    [cargar],
  );

  const responder = useCallback(
    async (id: string, aceptar: boolean): Promise<Resultado> => {
      const { error: err } = await supabase.rpc('responder_solicitud_contacto', {
        p_solicitud_id: id,
        p_aceptar: aceptar,
      });
      if (err) return { error: err.message };
      await cargar();
      return { error: null };
    },
    [cargar],
  );

  const cancelar = useCallback(
    async (id: string): Promise<Resultado> => {
      const { error: err } = await supabase.rpc('cancelar_solicitud_contacto', {
        p_solicitud_id: id,
      });
      if (err) return { error: err.message };
      await cargar();
      return { error: null };
    },
    [cargar],
  );

  return {
    solicitudes,
    entrantes,
    salientes,
    pendientesEntrantes: entrantes.length,
    loading,
    error,
    cargar,
    enviar,
    responder,
    cancelar,
  };
}
