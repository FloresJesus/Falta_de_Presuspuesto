import { Redirect, Tabs } from 'expo-router';

import { AppTabBar } from '@/components/app-tab-bar';
import { useAuth } from '@/context/AuthContext';

export default function AppGroupLayout() {
  const { session, loading } = useAuth();

  if (!loading && !session) {
    return <Redirect href="/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AppTabBar {...props} />}>
      <Tabs.Screen name="inicio" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="mapa" options={{ title: 'Mapa' }} />
      <Tabs.Screen name="educacion" options={{ title: 'Educación' }} />
      <Tabs.Screen name="mas" options={{ title: 'Más' }} />
    </Tabs>
  );
}
