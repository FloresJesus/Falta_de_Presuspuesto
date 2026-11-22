import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MascotAvatar } from '@/components/ui';
import { MapCanvas } from '@/components/MapCanvas';
import { useSesion } from '@/hooks/useSesion';
import { useUbicacion } from '@/hooks/useUbicacion';
import { useAuth } from '@/context/AuthContext';
import { Palette, Radius, Shadows } from '@/constants/theme';

function horaActual() {
  try {
    return new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '14:30';
  }
}

export default function MapaScreen() {
  const { profile } = useAuth();
  const { sesion } = useSesion();
  const { location } = useUbicacion();

  const compartiendo = Boolean(sesion && sesion.compartir_ubicacion);
  const nombre = (profile?.nombre ?? 'María').trim().split(/\s+/)[0];

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        <MapCanvas
          latitude={location?.latitude ?? null}
          longitude={location?.longitude ?? null}
          status={compartiendo ? 'sharing' : 'idle'}
          markers={false}
        />
      </View>

      <View style={styles.markerWrap} pointerEvents="none">
        <View style={styles.radius} />
        <View style={styles.avatarRing}>
          <MascotAvatar size={64} />
        </View>
        <View style={styles.dot} />
      </View>

      <SafeAreaView style={styles.safe} edges={['top']} pointerEvents="box-none">
        <View style={styles.header}>
          <Pressable onPress={() => router.replace('/inicio')} style={styles.circleBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.purple} />
          </Pressable>
          <Text style={styles.headerTitle}>Mapa</Text>
          <Pressable onPress={() => router.push('/ajustes')} style={styles.circleBtn}>
            <Ionicons name="settings-outline" size={22} color={Palette.purple} />
          </Pressable>
        </View>

        <View style={styles.onlineCard}>
          <View style={styles.onlineDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.onlineTitle}>En línea</Text>
            <Text style={styles.onlineSub}>Última ubicación: {horaActual()}</Text>
          </View>
        </View>

        <View style={styles.mapButtons}>
          <Pressable style={styles.mapBtn} onPress={() => router.push('/compartir')}>
            <Ionicons name="navigate-outline" size={22} color={Palette.purple} />
          </Pressable>
          <Pressable style={styles.mapBtn} onPress={() => router.push('/mapa')}>
            <Ionicons name="locate-outline" size={22} color={Palette.purple} />
          </Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.bottomCard}>
        <View style={styles.personRow}>
          <MascotAvatar size={48} />
          <View style={{ flex: 1 }}>
            <Text style={styles.personName}>{nombre}</Text>
            <Text style={styles.personSub}>
              <Text style={{ color: Palette.pink }}>• </Text>
              {compartiendo ? 'Compartiendo ubicación' : 'Ubicación no compartida'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Palette.purple} />
        </View>
        <View style={styles.divider} />
        <Pressable style={styles.contactRow} onPress={() => router.push('/contactos')}>
          <Ionicons name="people-outline" size={22} color={Palette.purple} />
          <Text style={styles.contactText}>Tu contacto de confianza</Text>
          <Ionicons name="chevron-forward" size={20} color={Palette.purple} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EDE0F4' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  circleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.card ?? {}),
  },
  headerTitle: { fontSize: 21, fontWeight: '800', color: Palette.purple, letterSpacing: -0.3 },
  onlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginHorizontal: 20,
    marginTop: 14,
    width: 210,
    ...(Shadows.card ?? {}),
  },
  onlineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(46,191,112,0.20)',
    borderWidth: 6,
    borderColor: Palette.success,
  },
  onlineTitle: { fontSize: 15, fontWeight: '800', color: Palette.success },
  onlineSub: { fontSize: 12, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  markerWrap: {
    position: 'absolute',
    top: '27%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  radius: {
    position: 'absolute',
    top: -20,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(178,132,214,0.30)',
    borderWidth: 2,
    borderColor: '#C9A3E0',
  },
  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.card ?? {}),
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Palette.surface,
    borderWidth: 5,
    borderColor: Palette.purple,
    marginTop: 32,
  },
  mapButtons: { position: 'absolute', right: 20, top: '43%', gap: 12 },
  mapBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E4CBF0',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.card ?? {}),
  },
  bottomCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 98,
    backgroundColor: Palette.surface,
    borderRadius: Radius.xxl,
    padding: 12,
    ...(Shadows.floating ?? {}),
  },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  personName: { fontSize: 18, fontWeight: '800', color: Palette.purple },
  personSub: { fontSize: 13, fontWeight: '600', color: Palette.purple, marginTop: 3 },
  divider: { height: 1, backgroundColor: Palette.border, marginVertical: 10 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactText: { flex: 1, fontSize: 15, fontWeight: '800', color: Palette.purple },
});
