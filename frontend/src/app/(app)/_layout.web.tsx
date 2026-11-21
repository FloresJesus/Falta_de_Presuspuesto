import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { Colors } from '@/constants/theme';

const theme = Colors.light;

/** En web se usan JavaScript tabs: NativeTabs rasteriza iconos con
 * expo-font.renderToImageAsync, API no disponible en web. */
export default function AppGroupWebLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}>
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={typeof color === 'string' ? color : theme.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={size} color={typeof color === 'string' ? color : theme.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="educacion"
        options={{
          title: 'Aprender',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={size} color={typeof color === 'string' ? color : theme.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="mas"
        options={{
          title: 'Más',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'apps' : 'apps-outline'} size={size} color={typeof color === 'string' ? color : theme.primary} />
          ),
        }}
      />
    </Tabs>
  );
}
