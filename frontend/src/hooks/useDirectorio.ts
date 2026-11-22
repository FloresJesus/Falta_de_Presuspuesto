import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface PersonaDirectorio {
  id: string;
  nombre: string;
  correo: string | null;
  telefono: string | null;
}

export type TipoBusquedaContacto = 'correo' | 'telefono';

/**
 * Sugerencias de personas ya registradas en LÍA para agregar como contactos.
 * La búsqueda es únicamente por correo o teléfono exactos (nunca por nombre),
 * para no exponer el directorio de usuarias.
 */
export function useDirectorio() {
  const [personas, setPersonas] = useState<PersonaDirectorio[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async (texto: string, tipo: TipoBusquedaContacto) => {
    const q = texto.trim();
    if (!q) {
      setPersonas([]);
      setBuscando(false);
      return;
    }
    setBuscando(true);
    const { data, error: err } = await supabase.rpc('buscar_personas', {
      p_query: q,
      p_tipo: tipo,
    });
    setBuscando(false);
    if (err) {
      setError(err.message);
      setPersonas([]);
      return;
    }
    setError(null);
    setPersonas((data ?? []) as PersonaDirectorio[]);
  }, []);

  /** Resuelve una persona registrada por correo o teléfono exactos. */
  const resolver = useCallback(async (texto: string, tipo: TipoBusquedaContacto) => {
    const q = texto.trim();
    if (!q) return null;
    const { data, error: err } = await supabase.rpc('buscar_personas', {
      p_query: q,
      p_tipo: tipo,
    });
    if (err) return null; // Si falla la búsqueda, seguimos con alta manual.
    return ((data ?? []) as PersonaDirectorio[])[0] ?? null;
  }, []);

  const limpiar = useCallback(() => {
    setPersonas([]);
    setError(null);
  }, []);

  return { personas, buscando, error, buscar, resolver, limpiar };
}
