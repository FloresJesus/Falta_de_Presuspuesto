import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Mascot, MascotAvatar } from '@/components/ui';
import { useContactos } from '@/hooks/useContactos';
import { useSesion } from '@/hooks/useSesion';
import { useAuth } from '@/context/AuthContext';
import { Palette, Radius, Shadows } from '@/constants/theme';

export default function InicioScreen() {
  const { profile } = useAuth();
  const { sesion, contacto } = useSesion();
  const { contactos } = useContactos();

  const nombre = profile?.nombre ?? 'María';
  const primer = nombre.trim().split(/\s+/)[0] || 'María';
  const principal = contactos.find((c) => c.es_principal) ?? contactos[0];
  const acompanante = contacto?.nombre ?? principal?.nombre;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <MascotAvatar size={56} />
        <View style={styles.helloRow}>
          <Text style={styles.hello}>Hola, {primer}</Text>
          <Ionicons name="heart" size={22} color={Palette.pink} />
        </View>
        <Pressable onPress={() => router.push('/ajustes')} style={({ pressed }) => [styles.bell, pressed && { opacity: 0.75 }]}>
          <Ionicons name="notifications-outline" size={20} color={Palette.purple} />
        </Pressable>
      </View>

      <Pressable onPress={() => router.push('/mapa')} style={({ pressed }) => [styles.statusCard, pressed && { opacity: 0.94 }]}>
        <View style={styles.statusIcon}>
          <Ionicons name="checkmark" size={32} color={Palette.surface} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>Todo está bien</Text>
          <Text style={styles.statusSub}>
            {sesion && acompanante
              ? `Compartiendo con ${acompanante}`
              : 'Tu ubicación se comparte con tus contactos'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={Palette.purple} />
      </Pressable>

      <Text style={styles.sectionTitle}>Accesos rápidos</Text>

      <View style={styles.grid}>
        <QuickCard icon="location-outline" label="Compartir ubicación" color={Palette.pink} onPress={() => router.push('/compartir')} />
        <QuickCard icon="warning-outline" label="Enviar SOS" color={Palette.pink} onPress={() => router.push('/sos')} />
        <QuickCard icon="book-outline" label="Aprender" color={Palette.purple} onPress={() => router.push('/educacion')} />
        <QuickCard icon="people-outline" label="Mis contactos" color={Palette.purple} onPress={() => router.push('/contactos')} />
      </View>

      <View style={styles.reminder}>
        <Mascot height={68} />
        <View style={{ flex: 1 }}>
          <Text style={styles.reminderTitle}>Recuerda:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.reminderTitle}>No estás sola</Text>
            <Ionicons name="heart" size={16} color={Palette.pink} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function QuickCard({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && { transform: [{ scale: 0.98 }], opacity: 0.94 }]}>
      <Ionicons name={icon} size={34} color={color} />
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Palette.background, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  helloRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  hello: { fontSize: 19, fontWeight: '800', color: Palette.purple, letterSpacing: -0.3 },
  bell: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.card ?? {}),
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.lilac,
    borderRadius: Radius.xl,
    padding: 12,
  },
  statusIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: Palette.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: { fontSize: 17, fontWeight: '800', color: Palette.purple, letterSpacing: -0.2 },
  statusSub: { fontSize: 13, fontWeight: '600', color: Palette.muted, marginTop: 2, lineHeight: 18, maxWidth: 215 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Palette.purple, marginTop: 18, marginBottom: 10, letterSpacing: -0.2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 84,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 10,
    ...(Shadows.card ?? {}),
  },
  quickLabel: { fontSize: 12, fontWeight: '600', color: Palette.purple, textAlign: 'center' },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.lilac,
    borderRadius: Radius.xl,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 14,
    overflow: 'hidden',
  },
  reminderTitle: { fontSize: 16, fontWeight: '800', color: Palette.purple, letterSpacing: -0.2 },
});
