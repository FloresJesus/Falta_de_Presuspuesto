import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { ContactoConfianza } from '@/lib/types';

export interface ContactoInput {
  nombre: string;
  telefono: string;
  correo?: string | null;
  relacion?: string | null;
  es_principal?: boolean;
}

export function useContactos() {
  const { user } = useAuth();
  const [contactos, setContactos] = useState<ContactoConfianza[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!user) {
      setContactos([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('contactos_confianza')
      .select('*')
      .eq('usuaria_id', user.id)
      .order('creado_en', { ascending: false });
    if (err) setError(err.message);
    else setContactos((data ?? []) as ContactoConfianza[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // La carga inicial de datos es asíncrona: se despacha dentro del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  const crear = useCallback(
    async (input: ContactoInput) => {
      if (!user) return { error: 'No hay sesión activa' };
      const { data, error } = await supabase.from('contactos_confianza').insert({
        usuaria_id: user.id,
        nombre: input.nombre.trim(),
        telefono: input.telefono.trim(),
        correo: input.correo?.trim() || null,
        relacion: input.relacion?.trim() || null,
        es_principal: input.es_principal ?? false,
      }).select('*').single();
      if (error) return { error: error.message };
      await cargar();
      return { data: data as ContactoConfianza };
    },
    [cargar, user],
  );

  const actualizar = useCallback(
    async (id: string, input: ContactoInput) => {
      if (!user) return { error: 'No hay sesión activa' };
      // Al marcar a alguien como principal se desmarca el resto en una sola operación.
      if (input.es_principal) {
        await supabase
          .from('contactos_confianza')
          .update({ es_principal: false })
          .eq('usuaria_id', user.id)
          .eq('activo', true);
      }
      const { data, error } = await supabase
        .from('contactos_confianza')
        .update({
          nombre: input.nombre.trim(),
          telefono: input.telefono.trim(),
          correo: input.correo?.trim() || null,
          relacion: input.relacion?.trim() || null,
          es_principal: input.es_principal ?? false,
        })
        .eq('id', id)
        .select('*')
        .single();
      if (error) return { error: error.message };
      await cargar();
      return { data: data as ContactoConfianza };
    },
    [cargar, user],
  );

  const eliminar = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('contactos_confianza').delete().eq('id', id);
      if (error) return { error: error.message };
      await cargar();
      return { error: null };
    },
    [cargar],
  );

  const marcarPrincipal = useCallback(
    async (id: string) => {
      if (!user) return { error: 'No hay sesión activa' };
      if (!contactos.some((c) => c.id === id && c.activo)) {
        return { error: 'El contacto no existe o está inactivo' };
      }
      const { error } = await supabase
        .from('contactos_confianza')
        .update({ es_principal: false })
        .eq('usuaria_id', user.id)
        .eq('activo', true);
      if (error) return { error: error.message };
      const { error: err2 } = await supabase
        .from('contactos_confianza')
        .update({ es_principal: true })
        .eq('id', id);
      if (err2) return { error: err2.message };
      await cargar();
      return { error: null };
    },
    [cargar, contactos, user],
  );

  return { contactos, loading, error, cargar, crear, actualizar, eliminar, marcarPrincipal };
}
