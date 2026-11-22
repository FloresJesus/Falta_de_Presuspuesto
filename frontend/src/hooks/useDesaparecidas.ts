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

  return { personas, loading, error, cargar };
}
