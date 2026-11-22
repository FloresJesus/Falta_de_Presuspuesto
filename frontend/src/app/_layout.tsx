import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { AuthProvider } from '@/context/AuthContext';
import { Palette } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular: require('@/assets/fonts/Poppins-Regular.ttf'),
    Poppins_500Medium: require('@/assets/fonts/Poppins-Medium.ttf'),
    Poppins_600SemiBold: require('@/assets/fonts/Poppins-SemiBold.ttf'),
    Poppins_700Bold: require('@/assets/fonts/Poppins-Bold.ttf'),
    Poppins_800ExtraBold: require('@/assets/fonts/Poppins-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Palette.background },
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
