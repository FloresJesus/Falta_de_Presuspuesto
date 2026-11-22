import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { PersonaDesaparecida } from '@/lib/types';

export function useDesaparecidas() {
  const [personas, setPersonas] = useState<PersonaDesaparecida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('personas_desaparecidas')
      .select('*')
      .eq('estado', 'desaparecida')
      .order('fecha_desaparicion', { ascending: false })
      .limit(10);
    if (err) setError(err.message);
    else {
      setError(null);
      setPersonas((data ?? []) as PersonaDesaparecida[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  const crear = useCallback(async (input: Omit<PersonaDesaparecida, 'id' | 'estado' | 'creado_en'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error: err } = await supabase
      .from('personas_desaparecidas')
      .insert({
        nombre: input.nombre.trim(),
        edad: input.edad,
        descripcion: input.descripcion?.trim() || null,
        foto_url: input.foto_url?.trim() || null,
        lugar: input.lugar.trim(),
        latitud: input.latitud,
        longitud: input.longitud,
        fecha_desaparicion: input.fecha_desaparicion,
        contacto_familiar: input.contacto_familiar?.trim() || null,
        creado_por: user?.id ?? null,
      })
      .select('*')
      .single();
    if (err) return { error: err.message };
    await cargar();
    return { data: data as PersonaDesaparecida, error: null };
  }, [cargar]);

  const marcarEncontrada = useCallback(async (id: string) => {
    const { error: err } = await supabase
      .from('personas_desaparecidas')
      .update({ estado: 'encontrada' })
      .eq('id', id);
    if (err) return { error: err.message };
    await cargar();
    return { error: null };
  }, [cargar]);

  return { personas, loading, error, cargar, crear, marcarEncontrada };
}
