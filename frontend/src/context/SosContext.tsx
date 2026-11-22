import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { supabase } from '@/lib/supabase';
import { useAlertas } from '@/hooks/useAlertas';
import { useContactos } from '@/hooks/useContactos';
import { useSesion } from '@/hooks/useSesion';
import { useUbicacion, type Ubicacion } from '@/hooks/useUbicacion';

export interface EstadoSos {
  activo: boolean;
  sesionId: string | null;
  token: string | null;
  alertaId: string | null;
  mensaje: string | null;
}

const VACIO: EstadoSos = {
  activo: false,
  sesionId: null,
  token: null,
  alertaId: null,
  mensaje: null,
};

interface SosContextValue {
  estado: EstadoSos;
  enviarSos: () => Promise<{ error: string | null; token?: string | null }>;
  cancelarSos: () => Promise<void>;
}

const SosContext = createContext<SosContextValue | null>(null);

/** Orquesta la alerta SOS: sesión de acompañamiento + ubicación en vivo. */
export function SosProvider({ children }: { children: ReactNode }) {
  const { contactos } = useContactos();
  const { sesion, iniciar, finalizar, registrarUbicacion } = useSesion();
  const {
    obtenerPosicion,
    iniciarSeguimiento,
    detenerSeguimiento,
    iniciarSeguimientoBackground,
    detenerSeguimientoBackground,
  } = useUbicacion();
  const { enviar, actualizarEstado } = useAlertas();
  const [estado, setEstado] = useState<EstadoSos>(VACIO);
  const sesionIdRef = useRef<string | null>(null);

  const enviarSos = useCallback(async () => {
    if (estado.activo && estado.token) {
      return { error: null, token: estado.token };
    }

    const principal = contactos.find((c) => c.es_principal && c.activo) ?? contactos[0];
    if (!principal) {
      return { error: 'Agrega un contacto de confianza antes de enviar un SOS.' };
    }

    let sesionId = sesion?.id ?? null;
    let token = sesion?.token_seguimiento ?? null;

    if (!sesionId) {
      const res = await iniciar(principal.id, 'Alerta SOS', true);
      if (res.error || !res.sesionId) {
        return { error: res.error ?? 'No se pudo iniciar el acompañamiento.' };
      }
      sesionId = res.sesionId;
      token = res.token ?? null;
    }

    const pos = await obtenerPosicion();
    const ubicacion = pos.location;
    const res = await enviar(
      ubicacion?.latitude ?? null,
      ubicacion?.longitude ?? null,
      sesionId,
      'Alerta SOS desde la app',
    );
    if (res.error) {
      return { error: res.error };
    }

    // El aviso sonoro lo envía la Edge Function (push con canal de alarma).
    void supabase.functions.invoke('sos-notify', { body: { alertaId: res.alertaId } });

    sesionIdRef.current = sesionId;
    const fondo = await iniciarSeguimientoBackground(sesionId);
    if (fondo.error) {
      // Sin permiso de fondo seguimos con la ubicación en primer plano.
      await iniciarSeguimiento((loc: Ubicacion) => {
        const id = sesionIdRef.current;
        if (id) void registrarUbicacion(id, loc.latitude, loc.longitude);
      });
    }

    setEstado({
      activo: true,
      sesionId,
      token,
      alertaId: res.alertaId ?? null,
      mensaje: 'Alerta SOS enviada',
    });
    return { error: null, token };
  }, [contactos, enviar, estado.activo, estado.token, iniciar, iniciarSeguimiento, iniciarSeguimientoBackground, obtenerPosicion, registrarUbicacion, sesion]);

  const cancelarSos = useCallback(async () => {
    detenerSeguimiento();
    await detenerSeguimientoBackground();
    sesionIdRef.current = null;
    if (estado.alertaId) {
      await actualizarEstado(estado.alertaId, 'cancelada');
    }
    if (estado.sesionId) {
      await finalizar(estado.sesionId);
    }
    setEstado(VACIO);
  }, [actualizarEstado, detenerSeguimiento, detenerSeguimientoBackground, finalizar, estado]);

  const value = useMemo<SosContextValue>(() => ({ estado, enviarSos, cancelarSos }), [estado, enviarSos, cancelarSos]);

  return <SosContext.Provider value={value}>{children}</SosContext.Provider>;
}

export function useSos() {
  const ctx = useContext(SosContext);
  if (!ctx) throw new Error('useSos debe usarse dentro de SosProvider');
  return ctx;
}
