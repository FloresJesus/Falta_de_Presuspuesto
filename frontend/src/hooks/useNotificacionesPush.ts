import { useEffect } from 'react';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { configurarCanalSos } from '@/lib/notificaciones';

/** Registra el token de Expo Push y abre la pantalla correcta al tocar la notificación. */
export function useNotificacionesPush() {
  const { user } = useAuth();

  useEffect(() => {
    void configurarCanalSos();
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    void (async () => {
      await configurarCanalSos();
      const { status: actual } = await Notifications.getPermissionsAsync();
      const status = actual === 'granted' ? actual : (await Notifications.requestPermissionsAsync()).status;
      if (status !== 'granted' || cancelado) return;

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) return; // Hasta correr `eas init` no hay token de Expo Push.

      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      if (!cancelado) {
        await supabase.from('perfiles').update({ push_token: token }).eq('id', user.id);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [user]);

  useEffect(() => {
    function abrirNotificacion(response: Notifications.NotificationResponse | null) {
      if (!response) return;
      const data = response.notification.request.content.data as Record<string, unknown>;
      if (data?.type === 'sos' && typeof data.alertaId === 'string') {
        router.push(`/alerta-sos/${data.alertaId}`);
      } else {
        router.push('/contactos/solicitudes');
      }
    }

    // Si la app estaba cerrada, el listener no alcanza a ver el toque inicial.
    void (async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (!response) return;
      abrirNotificacion(response);
      await Notifications.clearLastNotificationResponseAsync();
    })();
    const listener = Notifications.addNotificationResponseReceivedListener(abrirNotificacion);
    return () => listener.remove();
  }, []);
}
