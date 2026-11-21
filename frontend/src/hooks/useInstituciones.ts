import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { CategoriaEducativa, ContenidoEducativo } from '@/lib/types';

export function useInstituciones() {
  const [instituciones, setInstituciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('instituciones')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });
    if (err) setError(err.message);
    else setInstituciones((data ?? []) as any[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    // La carga inicial de datos es asíncrona: se despacha dentro del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  return { instituciones, loading, error, cargar };
}

export function useCategoriasEducativas() {
  const [categorias, setCategorias] = useState<CategoriaEducativa[]>([]);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categorias_educativas')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });
    if (error) return { data: [] as CategoriaEducativa[], error: error.message };
    const lista = (data ?? []) as CategoriaEducativa[];
    setCategorias(lista);
    return { data: lista, error: null };
  }, []);

  useEffect(() => {
    // La carga inicial de datos es asíncrona: se despacha dentro del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  return { categorias, loading, error: null, data: categorias };
}

export function useContenidosEducativos() {
  const [contenidos, setContenidos] = useState<ContenidoEducativo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('contenidos_educativos')
      .select('*')
      .eq('publicado', true)
      .order('orden', { ascending: true });
    if (err) setError(err.message);
    else setContenidos((data ?? []) as ContenidoEducativo[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    // La carga inicial de datos es asíncrona: se despacha dentro del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  return { contenidos, loading, error, cargar };
}
