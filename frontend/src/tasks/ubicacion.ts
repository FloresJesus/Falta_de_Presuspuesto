import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';

export const UBICACION_TASK = 'lia-sos-ubicacion';
export const SESION_SOS_KEY = '@sos_sesion_id';

/** Se registra en el root layout. Reporta la ubicación aunque la app esté en background. */
// Expo Go no expone tareas de fondo; el SOS usa seguimiento en primer plano.
if (typeof TaskManager.defineTask === 'function') {
  TaskManager.defineTask(UBICACION_TASK, async ({ data, error }) => {
    if (error) return;
    const locations = (data as { locations?: Location.LocationObject[] } | null)?.locations;
    const ultima = locations?.[locations.length - 1];
    if (!ultima) return;

    const sesionId = await AsyncStorage.getItem(SESION_SOS_KEY);
    if (!sesionId) return;

    await supabase.rpc('registrar_ubicacion', {
      p_sesion_id: sesionId,
      p_latitud: ultima.coords.latitude,
      p_longitud: ultima.coords.longitude,
      p_precision_m: ultima.coords.accuracy,
    });
  });
}
