import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

import { MascotAvatar } from '@/components/ui';
import { useContactos } from '@/hooks/useContactos';
import { Palette, Radius, Shadows } from '@/constants/theme';

export default function ContactosScreen() {
  const { contactos, loading, error, eliminar } = useContactos();

  function abrirMenu(id: string, nombre: string, telefono: string) {
    Alert.alert(nombre, '¿Qué quieres hacer?', [
      { text: 'Llamar', onPress: () => void Linking.openURL(`tel:${telefono}`) },
      { text: 'Editar', onPress: () => router.push({ pathname: '/contactos/[id]', params: { id } }) },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Eliminar contacto', `¿Seguro que quieres eliminar a ${nombre}?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', style: 'destructive', onPress: () => void eliminar(id) },
          ]),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Palette.purple} />
        </Pressable>
        <Text style={styles.title}>Contactos de confianza</Text>
        <Pressable onPress={() => router.push('/contactos/nuevo')} style={styles.headerBtn}>
          <Ionicons name="add" size={28} color={Palette.purple} />
        </Pressable>
      </View>

      <Text style={styles.subtitle}>Ellas recibirán tu ubicación y tus alertas SOS.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <Text style={styles.loading}>Cargando contactos...</Text> : null}

      <View style={styles.card}>
        {contactos.length === 0 && !loading ? (
          <View style={styles.emptyWrap}>
            <MascotAvatar size={78} />
            <Text style={styles.emptyTitle}>Aún no tienes contactos</Text>
            <Text style={styles.emptyText}>Añade a una persona de confianza para que reciba tus alertas SOS.</Text>
          </View>
        ) : null}

        {contactos.map((c, i) => (
          <View key={c.id} style={[styles.row, i > 0 && styles.rowBorder]}>
            <Pressable onPress={() => router.push({ pathname: '/contactos/[id]', params: { id: c.id } })} style={styles.rowMain}>
              <MascotAvatar size={44} variant={i} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{c.nombre}</Text>
                <Text style={styles.relation}>{c.relacion ?? 'Persona de confianza'}</Text>
              </View>
            </Pressable>

            {c.es_principal ? (
              <View style={styles.principal}>
                <Text style={styles.principalText}>Principal</Text>
              </View>
            ) : (
              <Pressable onPress={() => void Linking.openURL(`tel:${c.telefono}`)} style={styles.phoneBtn}>
                <Ionicons name="call-outline" size={22} color={Palette.purple} />
              </Pressable>
            )}

            <Pressable onPress={() => abrirMenu(c.id, c.nombre, c.telefono)} style={styles.menuBtn}>
              <Ionicons name="ellipsis-vertical" size={20} color={Palette.purple} />
            </Pressable>
          </View>
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <Pressable onPress={() => router.push('/contactos/nuevo')} style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.9 }]}>
        <Ionicons name="person-add-outline" size={22} color={Palette.purple} />
        <Text style={styles.addText}>Agregar contacto</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Palette.background, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 130 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: Palette.purple, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, fontWeight: '600', color: Palette.muted, marginBottom: 14, marginTop: 2 },
  error: { color: Palette.danger, fontWeight: '700', marginBottom: 10 },
  loading: { color: Palette.muted, fontWeight: '600', marginBottom: 10 },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xxl,
    paddingHorizontal: 14,
    ...(Shadows.card ?? {}),
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 6 },
  rowBorder: { borderTopWidth: 1, borderTopColor: Palette.border },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 18, fontWeight: '800', color: Palette.purple, letterSpacing: -0.2 },
  relation: { fontSize: 13, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  principal: {
    backgroundColor: '#7B2E9E',
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  principalText: { color: Palette.surface, fontSize: 12, fontWeight: '800' },
  phoneBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  menuBtn: { width: 26, height: 36, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: Palette.purple },
  emptyText: { fontSize: 12, fontWeight: '600', color: Palette.muted, textAlign: 'center', lineHeight: 17, paddingHorizontal: 10 },
  addBtn: {
    marginTop: 20,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Palette.lilac,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addText: { color: Palette.purple, fontSize: 16, fontWeight: '800' },
});
