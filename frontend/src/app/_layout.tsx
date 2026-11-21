import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FAF9FF' },
        }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen
          name="sos"
          options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen name="contactos" options={{ headerShown: false }} />
        <Stack.Screen name="instituciones" options={{ headerShown: false }} />
        <Stack.Screen name="institucion/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="contenido/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="cuestionario/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="asistente" options={{ headerShown: false }} />
        <Stack.Screen name="ajustes" options={{ headerShown: false }} />
        <Stack.Screen name="compartir" options={{ headerShown: false }} />
        <Stack.Screen name="seguimiento/[token]" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
