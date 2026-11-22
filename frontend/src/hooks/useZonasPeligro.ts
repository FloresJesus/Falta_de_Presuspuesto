import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RutaPeligro, ZonaPeligro } from '@/lib/types';

export interface ZonaInput {
  nombre: string;
  descripcion?: string | null;
  latitud: number;
  longitud: number;
  radio_m?: number;
  indice_peligro: number;
  tipo: ZonaPeligro['tipo'];
}

export function useZonasPeligro() {
  const [zonas, setZonas] = useState<ZonaPeligro[]>([]);
  const [rutas, setRutas] = useState<RutaPeligro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    const [zonasRes, rutasRes] = await Promise.all([
      supabase.from('zonas_peligro').select('*').eq('activo', true).order('indice_peligro', { ascending: false }),
      supabase.from('rutas_peligro').select('*').eq('activo', true).order('indice_peligro', { ascending: false }),
    ]);
    if (zonasRes.error || rutasRes.error) {
      setError(zonasRes.error?.message ?? rutasRes.error?.message ?? 'No se pudo cargar el mapa.');
    } else {
      setError(null);
      setZonas((zonasRes.data ?? []) as ZonaPeligro[]);
      setRutas((rutasRes.data ?? []) as RutaPeligro[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  const crear = useCallback(async (input: ZonaInput) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error: err } = await supabase.from('zonas_peligro').insert({
      nombre: input.nombre.trim(),
      descripcion: input.descripcion?.trim() || null,
      latitud: input.latitud,
      longitud: input.longitud,
      radio_m: input.radio_m ?? 300,
      indice_peligro: input.indice_peligro,
      tipo: input.tipo,
      creado_por: user?.id ?? null,
    });
    if (err) return { error: err.message };
    await cargar();
    return { error: null };
  }, [cargar]);

  const desactivar = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('zonas_peligro').update({ activo: false }).eq('id', id);
    if (err) return { error: err.message };
    await cargar();
    return { error: null };
  }, [cargar]);

  return { zonas, rutas, loading, error, cargar, crear, desactivar };
}
