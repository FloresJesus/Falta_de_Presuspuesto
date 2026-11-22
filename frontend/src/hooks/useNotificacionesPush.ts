import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export const CANAL_SOS = 'sos-alerts';

// Valores de los enums de expo-notifications (evita el falso positivo de import/namespace).
const IMPORTANCE_MAX = 7; // AndroidImportance.MAX
const VISIBILITY_PUBLIC = 1; // AndroidNotificationVisibility.PUBLIC
const USAGE_ALARM = 4; // AndroidAudioUsage.ALARM
const CONTENT_SONIFICATION = 4; // AndroidAudioContentType.SONIFICATION

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function configurarCanalSos() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL_SOS, {
    name: 'Alertas SOS',
    description: 'Emergencias de tus contactos de confianza',
    importance: IMPORTANCE_MAX,
    vibrationPattern: [0, 500, 300, 500, 300, 800],
    lockscreenVisibility: VISIBILITY_PUBLIC,
    sound: 'default',
    audioAttributes: {
      usage: USAGE_ALARM,
      contentType: CONTENT_SONIFICATION,
    },
  });
}

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
    const listener = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;
      if (data?.type === 'sos' && typeof data.alertaId === 'string') {
        router.push(`/alerta-sos/${data.alertaId}`);
      } else {
        router.push('/contactos/solicitudes');
      }
    });
    return () => listener.remove();
  }, []);
}
