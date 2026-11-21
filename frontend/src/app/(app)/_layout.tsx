import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';

export default function AppGroupLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="inicio">
        <NativeTabs.Trigger.Icon src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="home" />} />
        <NativeTabs.Trigger.Label>Inicio</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="mapa">
        <NativeTabs.Trigger.Icon src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="map" />} />
        <NativeTabs.Trigger.Label>Mapa</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="educacion">
        <NativeTabs.Trigger.Icon src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="book" />} />
        <NativeTabs.Trigger.Label>Aprender</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="mas">
        <NativeTabs.Trigger.Icon src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="apps" />} />
        <NativeTabs.Trigger.Label>Más</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
