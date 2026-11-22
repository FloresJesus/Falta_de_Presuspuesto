import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { ConversacionAsistente, MensajeAsistente } from '@/lib/types';

export function useAsistente() {
  const { user } = useAuth();
  const [conversacion, setConversacion] = useState<ConversacionAsistente | null>(null);
  const [mensajes, setMensajes] = useState<MensajeAsistente[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversacionIdRef = useRef<string | null>(null);

  const cargar = useCallback(async () => {
    if (!user) {
      setConversacion(null);
      setMensajes([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data: convs } = await supabase
      .from('conversaciones_asistente')
      .select('*')
      .eq('usuaria_id', user.id)
      .order('actualizada_en', { ascending: false });
    const lista = (convs ?? []) as ConversacionAsistente[];
    const conv = lista[0] ?? null;
    if (!conv) {
      const { data: created } = await supabase
        .from('conversaciones_asistente')
        .insert({ usuaria_id: user.id, titulo: 'Conversación con MASI' })
        .select('*')
        .single();
      const nueva = (created ?? null) as ConversacionAsistente | null;
      setConversacion(nueva);
      conversacionIdRef.current = nueva?.id ?? null;
      setMensajes([]);
      setLoading(false);
      return;
    }
    setConversacion(conv);
    conversacionIdRef.current = conv.id;
    const { data: msgs } = await supabase
      .from('mensajes_asistente')
      .select('*')
      .eq('conversacion_id', conv.id)
      .order('creada_en', { ascending: true });
    setMensajes((msgs ?? []) as MensajeAsistente[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // La carga inicial de datos es asíncrona: se despacha dentro del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  const enviar = useCallback(
    async (contenido: string) => {
      const texto = contenido.trim();
      if (!texto) return { error: 'Escribe un mensaje primero' };
      if (!user) return { error: 'No hay sesión activa' };
      setEnviando(true);
      setError(null);
      let convId = conversacionIdRef.current;
      if (!convId) {
        const { data: created } = await supabase
          .from('conversaciones_asistente')
          .insert({ usuaria_id: user.id, titulo: 'Conversación con MASI' })
          .select('*')
          .single();
        convId = (created as ConversacionAsistente | null)?.id ?? null;
        conversacionIdRef.current = convId;
      }
      const { error: errInsert } = await supabase.from('mensajes_asistente').insert({
        conversacion_id: convId,
        autor: 'usuaria',
        contenido: texto,
      });
      if (errInsert) {
        setEnviando(false);
        return { error: errInsert.message };
      }
      const mensajeUsuario: MensajeAsistente = {
        id: 'tmp-usuario',
        conversacion_id: convId ?? '',
        autor: 'usuaria',
        contenido: texto,
        creada_en: new Date().toISOString(),
      };
      setMensajes((prev) => [...prev, mensajeUsuario]);
      setEnviando(false);

      const respuesta = responderComoLia(texto);
      await new Promise((r) => setTimeout(r, 700 + Math.random() * 800));
      const mensajeAsistente: MensajeAsistente = {
        id: 'tmp-asistente',
        conversacion_id: convId ?? '',
        autor: 'asistente',
        contenido: respuesta,
        creada_en: new Date().toISOString(),
      };
      const { error: errInsert2 } = await supabase.from('mensajes_asistente').insert({
        conversacion_id: convId ?? '',
        autor: 'asistente',
        contenido: respuesta,
      });
      if (errInsert2) {
        setMensajes((prev) => prev.slice(0, -1));
        setError(errInsert2.message);
        return { error: errInsert2.message };
      }
      setMensajes((prev) => [...prev, mensajeAsistente]);
      if (convId) {
        await supabase
          .from('conversaciones_asistente')
          .update({ actualizada_en: new Date().toISOString() })
          .eq('id', convId);
      }
      return { error: null };
    },
    [user],
  );

  return { conversacion, mensajes, loading, enviando, error, cargar, enviar };
}

function responderComoLia(mensaje: string): string {
  const t = mensaje.toLowerCase();
  if (/(hola|buenas|buenos días|buenas tardes|qué tal|hey)/.test(t)) {
    return '¡Hola! Soy MASI, tu acompañante en seguridad personal. Estoy aquí para ayudarte a conocer tus señales, tu red de apoyo y las rutas de ayuda. ¿Qué te gustaría saber?';
  }
  if (/(peligro|emergencia|violencia|grito|pelea|ataque|no quiero|quiero salir)/.test(t)) {
    return 'Entiendo que estás en una situación delicada. Si hay peligro inmediato, prioriza tu integridad: busca un lugar seguro y llama a la línea de emergencia policial 110. Puedes activar el botón SOS desde la pantalla principal para que registremos una alerta con tu contacto de confianza. No estás sola.';
  }
  if (/(ubicaci|gps|rastread|seguir|mapa|llego|viaje|viajar)/.test(t)) {
    return 'Puedes compartir tu ubicación con una persona de confianza mediante un acompañamiento. Activa "Acompañarme" desde la pestaña Mapa: elige a tu contacto, autoriza compartir ubicación y comparte el enlace o token. Al finalizar el acompañamiento la ubicación deja de compartirse.';
  }
  if (/(denuncia|denunciar|instituci|hospital|casa de la mujer|110|legal|fiscal)/.test(t)) {
    return 'Puedes acudir a FELCV, SLIM, Defensoría del Pueblo o servicios de salud. La app tiene el directorio completo con horarios y teléfonos. Recuerda llevar tu documento, anotar fechas y guardar evidencia si es seguro.';
  }
  if (/(ley|348|derecho|derechos|protección|marco legal)/.test(t)) {
    return 'La Ley 348 Integral garantiza a las mujeres una vida libre de violencia. Reconoce violencias física, psicológica, sexual, económica y patrimonial, entre otras. Si sufres, recuerda que tienes derechos y que denunciar no revictimiza.';
  }
  if (/(autocuidado|respirar|calma|ansiedad|estrés|estres|mente|recuperar)/.test(t)) {
    return 'El autocuidado también es parte de la protección: respira lento (inhala 4, sostén 4, exhala 6), hidrátate, come algo ligero y descansa. No tienes que superarlo rápido. Pide atención profesional cuando lo necesites.';
  }
  if (/(contacto|persona de confianza|red|apoyo|familia|amiga)/.test(t)) {
    return 'Ve a "Mis contactos" para registrar a la persona de confianza con nombre y teléfono. Solo quien esté registrado puede recibir una alerta SOS o el seguimiento de ubicación.';
  }
  if (/(gracias|me alegro|bueno|listo)/.test(t)) {
    return 'Con gusto. Si necesitas algo más, aquí estoy. Recuerda: no estás sola y si hay peligro inmediato llama al 110.';
  }
  return 'Te escucho. Puedo orientarte sobre señales de alerta, compartir de ubicación, denuncias o autocuidado. Si estás en peligro inmediato, llama al 110 o activa el SOS desde la pantalla principal.';
}
