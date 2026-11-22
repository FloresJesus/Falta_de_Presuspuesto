import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { SosProvider } from '@/context/SosContext';
import { Palette } from '@/constants/theme';

// Registra la tarea de ubicación en segundo plano antes de cualquier navegación.
import '@/tasks/ubicacion';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Mantiene la pantalla encendida en toda la app: evita el bloqueo y que se
  // apague el salvapantallas mientras la aplicación está abierta.
  useKeepAwake();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular: require('@/assets/fonts/Poppins-Regular.ttf'),
    Poppins_500Medium: require('@/assets/fonts/Poppins-Medium.ttf'),
    Poppins_600SemiBold: require('@/assets/fonts/Poppins-SemiBold.ttf'),
    Poppins_700Bold: require('@/assets/fonts/Poppins-Bold.ttf'),
    Poppins_800ExtraBold: require('@/assets/fonts/Poppins-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
    const fallo = setTimeout(() => void SplashScreen.hideAsync(), 4000);
    return () => clearTimeout(fallo);
  }, [fontsLoaded]);

  // La app solo tiene diseño claro: evita que el navegador aplique "modo
  // oscuro automático" e invierta los fondos dejando textos ilegibles.
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.colorScheme = 'light';
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <SosProvider>
          <AppShell />
        </SosProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AppShell() {
  const insets = useSafeAreaInsets();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Palette.background, paddingTop: insets.top },
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
      <Stack.Screen name="alerta-sos/[id]" options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="registro-felcc" options={{ headerShown: false }} />
    </Stack>
  );
}
