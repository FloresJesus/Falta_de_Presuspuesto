import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { ContactoConfianza, SesionAcompañamiento } from '@/lib/types';

export function useSesion() {
  const { user } = useAuth();
  const [sesion, setSesion] = useState<SesionAcompañamiento | null>(null);
  const [contacto, setContacto] = useState<ContactoConfianza | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!user) {
      setSesion(null);
      setContacto(null);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('sesiones_acompanamiento')
      .select('*')
      .eq('usuaria_id', user.id)
      .eq('estado', 'activa')
      .maybeSingle();
    if (err) {
      setError(err.message);
      setSesion(null);
      setContacto(null);
      setLoading(false);
      return;
    }
    const s = (data ?? null) as SesionAcompañamiento | null;
    setSesion(s);
    let c: ContactoConfianza | null = null;
    if (s?.contacto_id) {
      const { data: cData } = await supabase
        .from('contactos_confianza')
        .select('*')
        .eq('id', s.contacto_id)
        .maybeSingle();
      c = (cData ?? null) as ContactoConfianza | null;
    }
    setContacto(c);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // La carga inicial de datos es asíncrona: se despacha dentro del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  const iniciar = useCallback(
    async (contactoId: string, destino: string, compartirUbicacion: boolean) => {
      if (!user) return { error: 'No hay sesión activa', sesionId: null, token: null };
      const { data, error } = await supabase.rpc('iniciar_acompanamiento', {
        p_contacto_id: contactoId,
        p_destino: destino.trim() ? destino.trim() : null,
        p_compartir_ubicacion: compartirUbicacion,
      });
      if (error) return { error: error.message, sesionId: null, token: null };
      const d = data as Record<string, unknown> | null;
      const sesionId = d ? String(d.sesion_id ?? '') : null;
      const token = d ? String(d.token_seguimiento ?? '') : null;
      if (d) {
        setSesion({
          id: String(d.sesion_id ?? ''),
          usuaria_id: user.id,
          contacto_id: contactoId,
          estado: 'activa',
          compartir_ubicacion: Boolean(d.compartir_ubicacion ?? compartirUbicacion),
          token_seguimiento: String(d.token_seguimiento ?? ''),
          destino: (d.destino as string | null) ?? (destino.trim() || null),
          iniciada_en: String(d.iniciada_en ?? new Date().toISOString()),
          finalizada_en: null,
          creado_en: new Date().toISOString(),
          actualizado_en: new Date().toISOString(),
          contacto: null,
        });
        setContacto(null);
        await cargar();
      }
      return { data, sesionId, token };
    },
    [cargar, user],
  );

  const finalizar = useCallback(async (sesionId: string) => {
    const { data, error } = await supabase.rpc('finalizar_acompanamiento', {
      p_sesion_id: sesionId,
    });
    if (error) return { error: error.message };
    setSesion(null);
    setContacto(null);
    return { data };
  }, []);

  const registrarUbicacion = useCallback(
    async (sesionId: string, latitud: number, longitud: number) => {
      const { error } = await supabase.rpc('registrar_ubicacion', {
        p_sesion_id: sesionId,
        p_latitud: latitud,
        p_longitud: longitud,
      });
      if (error) return { error: error.message };
      return { error: null };
    },
    [],
  );

  return { sesion, contacto, loading, error, cargar, iniciar, finalizar, registrarUbicacion };
}
