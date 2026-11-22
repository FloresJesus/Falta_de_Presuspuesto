import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSolicitudes } from '@/hooks/useSolicitudes';
import { Palette, Shadows } from '@/constants/theme';

const META: Record<
  string,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap; label: string }
> = {
  inicio: { active: 'home', inactive: 'home-outline', label: 'Inicio' },
  mapa: { active: 'location', inactive: 'location-outline', label: 'Mapa' },
  educacion: { active: 'book', inactive: 'book-outline', label: 'Educación' },
  mas: { active: 'grid', inactive: 'grid-outline', label: 'Más' },
};

export function AppTabBar({ state, emitter, navigateToTab, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { pendientesEntrantes } = useSolicitudes();

  function irA(route: any, focused: boolean) {
    if (emitter && navigateToTab) {
      const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigateToTab(route.key);
      return;
    }
    if (navigation) {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    }
  }

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const meta = META[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline', label: route.name };
        return (
          <Pressable
            key={route.key}
            onPress={() => irA(route, focused)}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}>
            <View style={styles.iconWrap}>
              <Ionicons name={focused ? meta.active : meta.inactive} size={24} color={focused ? Palette.pink : Palette.muted} />
              {route.name === 'inicio' && pendientesEntrantes > 0 ? (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {pendientesEntrantes > 9 ? '9+' : pendientesEntrantes}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, focused && styles.labelActive]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    backgroundColor: Palette.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 9,
    ...(Shadows.floating ?? {}),
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 3 },
  iconWrap: { position: 'relative' },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Palette.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  tabBadgeText: { color: Palette.surface, fontSize: 9, fontWeight: '800' },
  label: { fontSize: 10.5, fontWeight: '600', color: Palette.muted },
  labelActive: { color: Palette.pink, fontWeight: '700' },
});
