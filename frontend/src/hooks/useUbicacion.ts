import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SESION_SOS_KEY, UBICACION_TASK } from '@/tasks/ubicacion';

export type Ubicacion = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

export function useUbicacion() {
  const [status, setStatus] = useState<Location.PermissionStatus | 'unknown'>('unknown');
  const [location, setLocation] = useState<Ubicacion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const solicitarPermiso = useCallback(async () => {
    const { status: st } = await Location.requestForegroundPermissionsAsync();
    setStatus(st);
    return st;
  }, []);

  const obtenerPosicion = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy };
      setLocation(loc);
      return { location: loc, error: null };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo obtener la ubicación';
      setError(msg);
      return { location: null, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (!mounted) return;
      setStatus(status);
      if (status === 'granted') {
        void obtenerPosicion();
      }
    })();
    return () => {
      mounted = false;
    };
     
  }, [obtenerPosicion]);

  const iniciarSeguimiento = useCallback(
    async (onUpdate: (loc: Ubicacion) => void) => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const res = await Location.requestForegroundPermissionsAsync();
        if (res.status !== 'granted') {
          setStatus(res.status);
          return { error: 'Permiso de ubicación denegado' };
        }
      }
      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
        (loc) => {
          const nueva: Ubicacion = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
          };
          setLocation(nueva);
          onUpdate(nueva);
        },
      );
      watchRef.current = sub;
      return { error: null };
    },
    [],
  );

  const detenerSeguimiento = useCallback(() => {
    watchRef.current?.remove();
    watchRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, []);

  const iniciarSeguimientoBackground = useCallback(async (sesionId: string) => {
    const foreground = await Location.requestForegroundPermissionsAsync();
    if (foreground.status !== 'granted') return { error: 'Permiso de ubicación denegado' };

    const background = await Location.requestBackgroundPermissionsAsync();
    if (background.status !== 'granted') {
      return { error: 'Activa el acceso a la ubicación en segundo plano para compartir tu SOS.' };
    }

    const start = (Location as unknown as { startLocationUpdatesAsync?: (...args: unknown[]) => Promise<void> })
      .startLocationUpdatesAsync;
    if (typeof start !== 'function') {
      return { error: 'La ubicación en segundo plano requiere un development build.' };
    }

    await AsyncStorage.setItem(SESION_SOS_KEY, sesionId);
    try {
      await start(UBICACION_TASK, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
        timeInterval: 5000,
        showsBackgroundLocationIndicator: true,
        pausesUpdatesAutomatically: false,
        foregroundService: {
          notificationTitle: 'LÍA · SOS activo',
          notificationBody: 'Compartiendo tu ubicación con tu contacto de emergencia.',
        },
      });
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'No se pudo iniciar la ubicación en segundo plano.' };
    }
  }, []);

  const detenerSeguimientoBackground = useCallback(async () => {
    await AsyncStorage.removeItem(SESION_SOS_KEY);
    const stop = (Location as unknown as { stopLocationUpdatesAsync?: (name: string) => Promise<void> })
      .stopLocationUpdatesAsync;
    if (typeof stop !== 'function') return;
    try {
      const registrada = await TaskManager.isTaskRegisteredAsync(UBICACION_TASK);
      if (registrada) await stop(UBICACION_TASK);
    } catch {
      // Expo Go no registra tareas de fondo; no hay nada que detener.
    }
  }, []);

  return {
    status,
    location,
    loading,
    error,
    solicitarPermiso,
    obtenerPosicion,
    iniciarSeguimiento,
    detenerSeguimiento,
    iniciarSeguimientoBackground,
    detenerSeguimientoBackground,
  };
}
