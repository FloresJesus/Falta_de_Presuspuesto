import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { configurarCanalSos, triggerSos } from '@/lib/notificaciones';
import type { AlertaRecibida } from '@/hooks/useAlertasRecibidas';

/**
 * Mientras la app esté abierta, revisa si llegó una alerta SOS y lanza una
 * notificación local con sonido. El push remoto (app cerrada) necesita el
 * projectId de EAS y las credenciales FCM.
 */
export function useSosNotifications() {
  const { user } = useAuth();
  const vistos = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!user) return;
    vistos.current = null;
    let cancelado = false;
    let revisando = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function revisar() {
      if (cancelado || revisando) return;
      revisando = true;
      try {
        const { data } = await supabase.rpc('alertas_recibidas');
        if (cancelado) return;
        const alertas = (data ?? []) as AlertaRecibida[];

        if (vistos.current === null) {
          // Primera carga: no notificar alertas viejas.
          vistos.current = new Set(alertas.map((a) => a.id));
          return;
        }

        for (const alerta of alertas) {
          if (vistos.current.has(alerta.id)) continue;
          vistos.current.add(alerta.id);
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `🚨 Alerta SOS de ${alerta.nombre_usuaria}`,
              body: `${alerta.mensaje}. Abre MASI para ver su ubicación.`,
              sound: 'sos_bocina.wav',
              data: { type: 'sos', alertaId: alerta.id, token: alerta.token_seguimiento },
            },
            trigger: triggerSos(),
          });
        }
      } finally {
        revisando = false;
      }
    }

    void (async () => {
      await configurarCanalSos();
      const { status: actual } = await Notifications.getPermissionsAsync();
      if (actual !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
      if (cancelado) return;
      await revisar();
      timer = setInterval(() => void revisar(), 5000);
    })();

    // Al volver del segundo plano conviene revisar de inmediato.
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') void revisar();
    });

    return () => {
      cancelado = true;
      if (timer) clearInterval(timer);
      suscripcion.remove();
    };
  }, [user]);
}
