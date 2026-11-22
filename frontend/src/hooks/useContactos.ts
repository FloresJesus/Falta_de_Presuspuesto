import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { esEmailValido, esTelefonoValido } from '@/lib/utils';
import type { ContactoConfianza } from '@/lib/types';

export interface ContactoInput {
  nombre: string;
  telefono: string;
  correo?: string | null;
  relacion?: string | null;
  es_principal?: boolean;
}

/** Traduce los errores de la base de datos a mensajes entendibles. */
function mensajeError(error: PostgrestError): string {
  if (error.code === '23505') {
    return 'Ya tienes un contacto principal. Elige otro o desmárcalo antes de guardar.';
  }
  if (error.code === '23514') {
    if (error.message.includes('contactos_correo_formato')) return 'El correo no tiene un formato válido.';
    if (error.message.includes('contactos_nombre_longitud')) return 'El nombre debe tener entre 2 y 80 caracteres.';
    if (error.message.includes('contactos_telefono_longitud')) return 'El teléfono debe tener entre 6 y 25 caracteres.';
    return 'Revisa los datos del contacto.';
  }
  if (error.code === '42501') return 'No tienes permiso para modificar este contacto.';
  return 'No se pudo guardar el contacto. Intenta de nuevo.';
}

function validarContacto(input: ContactoInput): string | null {
  const nombre = input.nombre.trim();
  if (nombre.length < 2 || nombre.length > 80) {
    return 'El nombre debe tener entre 2 y 80 caracteres.';
  }
  const telefono = input.telefono?.trim() ?? '';
  if (telefono && (!esTelefonoValido(telefono) || telefono.length > 25)) {
    return 'Ingresa un teléfono válido (entre 6 y 25 caracteres).';
  }
  const correo = input.correo?.trim();
  if (correo && !esEmailValido(correo)) {
    return 'El correo no tiene un formato válido.';
  }
  if (!telefono && !correo) {
    return 'Agrega un teléfono o un correo para este contacto.';
  }
  return null;
}

export function useContactos() {
  const { user } = useAuth();
  const [contactos, setContactos] = useState<ContactoConfianza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!user) {
      setContactos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('contactos_confianza')
      .select('*')
      .eq('usuaria_id', user.id)
      .eq('activo', true)
      .order('creado_en', { ascending: false });
    if (err) setError(mensajeError(err));
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
      const invalido = validarContacto(input);
      if (invalido) return { error: invalido };

      // Solo puede haber un contacto principal activo (índice único), por eso
      // quitamos esa marca al anterior antes de insertar el nuevo.
      if (input.es_principal) {
        const { error: errPrincipal } = await supabase
          .from('contactos_confianza')
          .update({ es_principal: false })
          .eq('usuaria_id', user.id)
          .eq('activo', true);
        if (errPrincipal) return { error: mensajeError(errPrincipal) };
      }

      const { data, error } = await supabase
        .from('contactos_confianza')
        .insert({
          usuaria_id: user.id,
          nombre: input.nombre.trim(),
          telefono: input.telefono.trim() || null,
          correo: input.correo?.trim() || null,
          relacion: input.relacion?.trim() || null,
          es_principal: input.es_principal ?? false,
        })
        .select('*')
        .single();
      if (error) return { error: mensajeError(error) };
      await cargar();
      return { data: data as ContactoConfianza };
    },
    [cargar, user],
  );

  const actualizar = useCallback(
    async (id: string, input: ContactoInput) => {
      if (!user) return { error: 'No hay sesión activa' };
      const invalido = validarContacto(input);
      if (invalido) return { error: invalido };

      // Al marcar a alguien como principal se desmarca el resto en una sola operación.
      if (input.es_principal) {
        const { error: errPrincipal } = await supabase
          .from('contactos_confianza')
          .update({ es_principal: false })
          .eq('usuaria_id', user.id)
          .eq('activo', true)
          .neq('id', id);
        if (errPrincipal) return { error: mensajeError(errPrincipal) };
      }

      const { data, error } = await supabase
        .from('contactos_confianza')
        .update({
          nombre: input.nombre.trim(),
          telefono: input.telefono.trim() || null,
          correo: input.correo?.trim() || null,
          relacion: input.relacion?.trim() || null,
          es_principal: input.es_principal ?? false,
        })
        .eq('id', id)
        .select('*')
        .single();
      if (error) return { error: mensajeError(error) };
      await cargar();
      return { data: data as ContactoConfianza };
    },
    [cargar, user],
  );

  const eliminar = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('contactos_confianza').delete().eq('id', id);
      if (error) return { error: mensajeError(error) };
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
        .eq('activo', true)
        .neq('id', id);
      if (error) return { error: mensajeError(error) };
      const { error: err2 } = await supabase
        .from('contactos_confianza')
        .update({ es_principal: true })
        .eq('id', id);
      if (err2) return { error: mensajeError(err2) };
      await cargar();
      return { error: null };
    },
    [cargar, contactos, user],
  );

  return { contactos, loading, error, cargar, crear, actualizar, eliminar, marcarPrincipal };
}
