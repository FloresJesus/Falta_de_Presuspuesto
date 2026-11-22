import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ZonaPeligro } from '@/lib/types';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('zonas_peligro')
      .select('*')
      .eq('activo', true)
      .order('indice_peligro', { ascending: false });
    if (err) setError(err.message);
    else {
      setError(null);
      setZonas((data ?? []) as ZonaPeligro[]);
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

  return { zonas, loading, error, cargar, crear, desactivar };
}
