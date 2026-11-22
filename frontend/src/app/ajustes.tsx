import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Avatar, Button, Card, IconBubble } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { Palette, Radius, Shadows } from '@/constants/theme';

export default function AjustesScreen() {
  const { profile, signOut, updateProfile } = useAuth();
  const [nombre, setNombre] = useState(profile?.nombre ?? '');
  const [telefono, setTelefono] = useState(profile?.telefono ?? '');
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSave() {
    setMsg(null);
    const res = await updateProfile({ nombre, telefono });
    if (res.error) {
      setMsg(res.error);
      return;
    }
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={20} color={Palette.purple} />
        </Pressable>
        <Text style={styles.title}>Ajustes</Text>
        <View style={{ width: 44 }} />
      </View>

      <Card style={styles.profileCard}>
        <Avatar name={profile?.nombre ?? 'amiga'} size={60} />
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{profile?.nombre ?? 'Amiga MASI'}</Text>
          <Text style={styles.profileEmail}>{profile?.correo ?? 'Sin correo registrado'}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Mi perfil</Text>
        <View style={styles.field}>
          <Ionicons name="person-outline" size={18} color={Palette.muted} />
          <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre" placeholderTextColor="#9A8BA8" style={styles.input} />
        </View>
        <View style={styles.field}>
          <Ionicons name="call-outline" size={18} color={Palette.muted} />
          <TextInput value={telefono} onChangeText={setTelefono} placeholder="Teléfono" placeholderTextColor="#9A8BA8" keyboardType="phone-pad" style={styles.input} />
        </View>
        {msg ? <Text style={styles.error}>{msg}</Text> : null}
        <Button title="Guardar cambios" size="md" fullWidth onPress={() => void handleSave()} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Preferencias</Text>
        <MenuRow icon="location-outline" label="Compartir ubicación" desc="Acompañamiento con autorización explícita." onPress={() => router.push('/compartir')} />
        <MenuRow icon="sparkles-outline" label="Asistente MASI" desc="Orientación personalizada." onPress={() => router.push('/asistente')} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Ayuda y seguridad</Text>
        <MenuRow icon="shield-outline" label="Directorio de apoyo" desc="Instituciones y rutas de ayuda." onPress={() => router.push('/instituciones')} />
        <MenuRow icon="people-outline" label="Mis contactos" desc="Red de apoyo de confianza." onPress={() => router.push('/contactos')} last />
      </Card>

      <Button
        title="Cerrar sesión"
        variant="danger"
        size="lg"
        fullWidth
        onPress={async () => {
          await signOut();
          router.replace('/welcome');
        }}
      />

      <Text style={styles.version}>MASI · Versión 1.0.0 · Una red que te acompaña.</Text>
    </ScrollView>
  );
}

function MenuRow({
  icon,
  label,
  desc,
  onPress,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  desc: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, !last && styles.menuDivider, pressed && { opacity: 0.85 }]}>
      <IconBubble size={40} background={Palette.purpleSoft}>
        <Ionicons name={icon} size={18} color={Palette.purple} />
      </IconBubble>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Palette.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Palette.background, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.card ?? {}),
  },
  title: { fontSize: 22, fontWeight: '800', color: Palette.ink, letterSpacing: -0.3 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileName: { color: Palette.ink, fontSize: 17, fontWeight: '800' },
  profileEmail: { color: Palette.muted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  card: { marginTop: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Palette.ink, marginBottom: 10 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: 14, color: Palette.ink },
  error: { color: Palette.danger, fontWeight: '700', fontSize: 12, marginBottom: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: Palette.border },
  menuLabel: { color: Palette.ink, fontSize: 14, fontWeight: '800' },
  menuDesc: { color: Palette.muted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  version: { textAlign: 'center', color: Palette.muted, fontSize: 11, fontWeight: '700', marginTop: 18, letterSpacing: 0.6 },
});
