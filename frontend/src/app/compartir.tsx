import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Avatar, Button, Card, Hero, Toggle } from '@/components/ui';
import { useContactos } from '@/hooks/useContactos';
import { useSesion } from '@/hooks/useSesion';
import { Palette, Radius, Shadows } from '@/constants/theme';

export default function CompartirScreen() {
  const { contactos, loading, error } = useContactos();
  const { sesion, iniciar, finalizar } = useSesion();
  const [contactoId, setContactoId] = useState<string>('');
  const [destino, setDestino] = useState('');
  const [compartir, setCompartir] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const principal = contactos.find((c) => c.es_principal) ?? contactos[0];
  const contactoSeleccionado = contactoId || principal?.id || '';

  async function handleIniciar() {
    setSaving(true);
    setMsg(null);
    const res = await iniciar(contactoSeleccionado, destino, compartir);
    setSaving(false);
    if (res.error) setMsg(res.error);
  }

  async function handleFinalizar() {
    if (!sesion) return;
    const res = await finalizar(sesion.id);
    if (res.error) setMsg(res.error);
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={20} color={Palette.purple} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Acompáñame</Text>
          <Text style={styles.subtitle}>Comparte tu ubicación con una persona de confianza.</Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {msg ? <Text style={styles.error}>{msg}</Text> : null}

      {!sesion ? (
        <>
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>1. Elige a tu contacto</Text>
            {loading ? <Text style={styles.body}>Cargando contactos...</Text> : null}
            {!loading && contactos.length === 0 ? (
              <Text style={styles.body}>Necesitas registrar al menos un contacto de confianza.</Text>
            ) : null}
            {contactos.map((c) => {
              const selected = contactoSeleccionado === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setContactoId(c.id)}
                  style={({ pressed }) => [styles.contactRow, selected && styles.contactRowOn, pressed && { opacity: 0.9 }]}>
                  <Avatar name={c.nombre} size={42} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>{c.nombre}</Text>
                    <Text style={styles.contactMeta}>{c.telefono}</Text>
                  </View>
                  <View style={[styles.radio, selected && styles.radioOn]}>
                    {selected ? <Ionicons name="checkmark" size={14} color={Palette.surface} /> : null}
                  </View>
                </Pressable>
              );
            })}
            {contactos.length === 0 ? (
              <Button title="Crear contacto" size="sm" variant="soft" onPress={() => router.push('/contactos/nuevo')} />
            ) : null}
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>2. Destino (opcional)</Text>
            <View style={styles.field}>
              <Ionicons name="navigate-outline" size={18} color={Palette.muted} />
              <TextInput
                placeholder="¿A dónde vas?"
                placeholderTextColor="#9A8BA8"
                value={destino}
                onChangeText={setDestino}
                style={styles.input}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleText}>Compartir mi ubicación</Text>
                <Text style={styles.toggleDesc}>Solo con tu autorización explícita.</Text>
              </View>
              <Toggle value={compartir} onChange={setCompartir} />
            </View>

            <Button
              title="Iniciar acompañamiento"
              onPress={() => void handleIniciar()}
              loading={saving}
              size="lg"
              fullWidth
              disabled={!contactoSeleccionado}
            />
          </Card>
        </>
      ) : (
        <>
          <Hero style={styles.activeHero}>
            <View style={styles.activeTop}>
              <View style={styles.activeIcon}>
                <Ionicons name="shield-checkmark" size={26} color={Palette.surface} />
              </View>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Activo</Text>
              </View>
            </View>
            <Text style={styles.activeTitle}>Acompañamiento activo</Text>
            <View style={styles.activeRow}>
              <Avatar name={contactos.find((c) => c.id === sesion.contacto_id)?.nombre ?? 'amiga'} size={42} />
              <View style={{ flex: 1 }}>
                <Text style={styles.activeContact}>
                  {contactos.find((c) => c.id === sesion.contacto_id)?.nombre ?? 'Contacto'}
                </Text>
                <Text style={styles.activeMeta}>{sesion.destino ?? 'Sin destino'}</Text>
              </View>
            </View>
            <Text style={styles.activeSharing}>
              {sesion.compartir_ubicacion ? 'Compartiendo ubicación en tiempo real' : 'Ubicación no compartida'}
            </Text>
          </Hero>

          {sesion.token_seguimiento ? (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Enlace de seguimiento</Text>
              <Text style={styles.token}>{sesion.token_seguimiento}</Text>
              <Text style={styles.body}>Compártelo con tu contacto para que vea tu ubicación.</Text>
            </Card>
          ) : null}

          <Button title="Finalizar acompañamiento" variant="outline" size="lg" fullWidth onPress={() => void handleFinalizar()} />
          <View style={{ height: 10 }} />
          <Button title="Enviar SOS" onPress={() => router.push('/sos')} variant="accent" size="lg" fullWidth />
        </>
      )}

      <View style={{ height: 12 }} />
      <Button title="Volver" variant="ghost" size="lg" fullWidth onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Palette.background, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
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
  subtitle: { fontSize: 12, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  error: { color: Palette.danger, fontWeight: '700', fontSize: 13, marginBottom: 10 },
  card: { marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Palette.ink, marginBottom: 10 },
  body: { fontSize: 13, fontWeight: '600', color: Palette.muted, marginBottom: 8 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  contactRowOn: { backgroundColor: Palette.purpleSoft, borderRadius: Radius.md, paddingHorizontal: 10 },
  contactName: { fontSize: 14, fontWeight: '800', color: Palette.ink },
  contactMeta: { fontSize: 12, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: Palette.purple, borderColor: Palette.purple },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: 14, color: Palette.ink },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 14,
    marginBottom: 14,
    gap: 12,
  },
  toggleText: { fontSize: 14, fontWeight: '800', color: Palette.ink },
  toggleDesc: { fontSize: 11, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  activeHero: { borderRadius: Radius.xl, marginBottom: 12 },
  activeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activeIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#6EF0B8' },
  liveText: { color: Palette.surface, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  activeTitle: { color: Palette.surface, fontSize: 20, fontWeight: '800', marginTop: 12 },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  activeContact: { color: Palette.surface, fontSize: 14, fontWeight: '800' },
  activeMeta: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  activeSharing: { color: Palette.lilac, fontSize: 11, fontWeight: '700', marginTop: 12 },
  token: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.purple,
    backgroundColor: Palette.purpleSoft,
    borderRadius: Radius.sm,
    padding: 10,
    marginBottom: 8,
  },
});
