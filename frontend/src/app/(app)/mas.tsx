import { useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { MascotAvatar, Toggle } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useSesion } from '@/hooks/useSesion';
import { Palette, Radius, Shadows } from '@/constants/theme';

export default function MasScreen() {
  const { profile, signOut } = useAuth();
  const { sesion } = useSesion();
  const [notificaciones, setNotificaciones] = useState(true);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/inicio')} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={28} color={Palette.purple} />
        </Pressable>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.profile}>
        <View style={styles.avatarRing}>
          <MascotAvatar size={106} />
        </View>
        <Text style={styles.name}>{profile?.nombre ?? 'María López'}</Text>
        <Text style={styles.email}>{profile?.correo ?? 'maria@gmail.com'}</Text>
      </View>

      <View style={styles.card}>
        <MenuRow icon="person-outline" label="Mi perfil" onPress={() => router.push('/ajustes')} />
        <MenuRow icon="people-outline" label="Mis contactos" onPress={() => router.push('/contactos')} />
        <MenuRow
          icon="location-outline"
          label="Compartir ubicación"
          right={<Toggle value={sesion ? Boolean(sesion.compartir_ubicacion) : true} onChange={() => router.push('/compartir')} activeColor={Palette.pink} />}
        />
        <MenuRow
          icon="notifications-outline"
          label="Notificaciones"
          right={<Toggle value={notificaciones} onChange={setNotificaciones} activeColor={Palette.pink} />}
        />
        <MenuRow
          icon="lock-closed-outline"
          label="Privacidad y seguridad"
          onPress={() =>
            Alert.alert(
              'Privacidad y seguridad',
              'Tu ubicación solo se comparte durante un acompañamiento autorizado. Puedes revocar el acceso cuando quieras.',
            )
          }
        />
        {profile?.rol === 'admin' ? (
          <MenuRow icon="shield-checkmark-outline" label="Registro FELCC" onPress={() => router.push('/registro-felcc')} />
        ) : null}
        <MenuRow icon="globe-outline" label="Idioma" right={<Text style={styles.idioma}>Español</Text>} last />
      </View>

      <View style={styles.card}>
        <Pressable
          onPress={async () => {
            await signOut();
            router.replace('/welcome');
          }}
          style={({ pressed }) => [styles.logout, pressed && { opacity: 0.8 }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="log-out-outline" size={24} color={Palette.pink} />
          </View>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>MASI · Una red que te acompaña</Text>
    </ScrollView>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  right,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  right?: ReactNode;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && onPress ? { opacity: 0.85 } : null]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={24} color={Palette.purple} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {right ?? <Ionicons name="chevron-forward" size={24} color={Palette.purple} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Palette.background, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 140 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 21, fontWeight: '800', color: Palette.purple, letterSpacing: -0.4 },
  profile: { alignItems: 'center', marginTop: 4, marginBottom: 12 },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.card ?? {}),
  },
  name: { fontSize: 20, fontWeight: '800', color: Palette.purple, marginTop: 9, letterSpacing: -0.3 },
  email: { fontSize: 13, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xxl,
    paddingHorizontal: 16,
    marginBottom: 14,
    ...(Shadows.card ?? {}),
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Palette.border },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: Palette.purple },
  idioma: { fontSize: 16, fontWeight: '600', color: Palette.muted },
  logout: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  logoutText: { fontSize: 17, fontWeight: '800', color: Palette.pink },
  footer: { textAlign: 'center', fontSize: 15, fontWeight: '600', color: Palette.muted, marginTop: 2 },
});
