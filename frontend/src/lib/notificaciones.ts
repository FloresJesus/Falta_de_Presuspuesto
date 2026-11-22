import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// v2: Android no permite cambiar el sonido de un canal ya creado, por eso el
// canal de la bocina usa un identificador nuevo.
export const CANAL_SOS = 'sos-alerts-v2';

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

/** Canal Android de máxima importancia y audio de alarma para los SOS. */
export async function configurarCanalSos() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL_SOS, {
    name: 'Alertas SOS',
    description: 'Emergencias de tus contactos de confianza',
    importance: IMPORTANCE_MAX,
    vibrationPattern: [0, 500, 300, 500, 300, 800],
    lockscreenVisibility: VISIBILITY_PUBLIC,
    sound: 'sos_bocina.wav',
    audioAttributes: {
      usage: USAGE_ALARM,
      contentType: CONTENT_SONIFICATION,
    },
  });
}

/**
 * En Android el sonido y la importancia los define el canal, no el contenido.
 * Sin `channelId` la notificación local cae en el canal genérico de Expo y
 * suena como una notificación normal, no como alarma.
 */
export function triggerSos(): Notifications.NotificationTriggerInput {
  return Platform.OS === 'android' ? { channelId: CANAL_SOS } : null;
}
