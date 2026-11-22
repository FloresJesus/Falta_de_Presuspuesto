import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { AlertaRecibida } from '@/hooks/useAlertasRecibidas';

/**
 * Mientras la app esté abierta, revisa si llegó una alerta SOS y lanza una
 * notificación local con sonido. El push remoto (app cerrada) necesita el
 * projectId de EAS.
 */
export function useSosNotifications() {
  const { user } = useAuth();
  const vistos = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    void Notifications.requestPermissionsAsync();

    async function revisar() {
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
            body: `${alerta.mensaje}. Abre LÍA para ver su ubicación.`,
            sound: 'default',
            data: { type: 'sos', alertaId: alerta.id, token: alerta.token_seguimiento },
          },
          trigger: null,
        });
      }
    }

    void revisar();
    const timer = setInterval(() => void revisar(), 5000);
    return () => {
      cancelado = true;
      clearInterval(timer);
    };
  }, [user]);
}
