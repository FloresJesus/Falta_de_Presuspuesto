import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, Avatar } from '@/components/ui';
import { useContactos } from '@/hooks/useContactos';
import { useSesion } from '@/hooks/useSesion';

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
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Acompáñame</Text>
      <Text style={styles.subtitle}>
        Comparte tu ubicación con una persona de confianza durante un acompañamiento.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {msg ? <Text style={styles.error}>{msg}</Text> : null}

      {!sesion ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>1. Elige a tu contacto</Text>
          {loading ? <Text style={styles.body}>Cargando contactos...</Text> : null}
          {!loading && contactos.length === 0 ? (
            <Text style={styles.body}>Necesitas registrar al menos un contacto de confianza.</Text>
          ) : null}
          {contactos.map((c) => (
            <Pressable key={c.id} onPress={() => setContactoId(c.id)} style={({ pressed }) => [styles.contactRow, contactoSeleccionado === c.id && styles.contactRowOn, pressed && { opacity: 0.9 }]}>
              <Avatar name={c.nombre} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{c.nombre}</Text>
                <Text style={styles.contactMeta}>{c.telefono}</Text>
              </View>
              {contactoSeleccionado === c.id ? <Ionicons name="checkmark-circle" size={22} color="#55147C" /> : null}
            </Pressable>
          ))}

          <Text style={styles.sectionTitle}>2. Destino (opcional)</Text>
          <TextInput placeholder="¿A dónde vas?" value={destino} onChangeText={setDestino} style={styles.input} />

          <Pressable style={styles.toggleRow} onPress={() => setCompartir(!compartir)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleText}>Compartir mi ubicación</Text>
              <Text style={styles.toggleDesc}>Solo con tu autorización explícita.</Text>
            </View>
            <View style={[styles.toggle, compartir && styles.toggleOn]}>
              <View style={[styles.toggleKnob, compartir && { transform: 'translateX(20px)' }]} />
            </View>
          </Pressable>

          <Button title="Iniciar acompañamiento" onPress={() => void handleIniciar()} loading={saving} size="lg" fullWidth disabled={!contactoSeleccionado} />
        </Card>
      ) : (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Acompañamiento activo</Text>
          <View style={styles.activeRow}>
            <Avatar name={contactos.find((c) => c.id === sesion.contacto_id)?.nombre ?? 'amiga'} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{contactos.find((c) => c.id === sesion.contacto_id)?.nombre ?? 'Contacto'}</Text>
              <Text style={styles.contactMeta}>{sesion.destino ?? 'Sin destino'}</Text>
            </View>
          </View>
          <Text style={styles.body}>Compartiendo ubicación: {sesion.compartir_ubicacion ? 'Sí' : 'No'}</Text>
          {sesion.token_seguimiento ? (
            <Text style={styles.token}>Token: {sesion.token_seguimiento}</Text>
          ) : null}
          <Button title="Finalizar acompañamiento" variant="outline" size="lg" fullWidth onPress={() => void handleFinalizar()} />
          <View style={{ height: 10 }} />
          <Button title="Enviar SOS" onPress={() => router.push('/sos')} variant="accent" size="lg" fullWidth />
        </Card>
      )}

      <View style={{ height: 12 }} />
      <Button title="Volver" variant="outline" size="lg" fullWidth onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 64, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#22147C', marginBottom: 6 },
  subtitle: { fontSize: 13, fontWeight: '600', color: '#6B5C7C', marginBottom: 14 },
  error: { color: '#E5484D', fontWeight: '700', fontSize: 13, marginBottom: 10 },
  card: { marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#22147C', marginBottom: 10 },
  body: { fontSize: 13, fontWeight: '600', color: '#6B5C7C', marginBottom: 8 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E7DDF2' },
  contactRowOn: { backgroundColor: '#F0EAF9', borderRadius: 12, paddingHorizontal: 10 },
  contactName: { fontSize: 14, fontWeight: '800', color: '#22147C' },
  contactMeta: { fontSize: 12, fontWeight: '600', color: '#6B5C7C', marginTop: 2 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7DDF2', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#22147C', marginBottom: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7DDF2', padding: 14, marginBottom: 14 },
  toggleText: { fontSize: 14, fontWeight: '800', color: '#22147C' },
  toggleDesc: { fontSize: 12, fontWeight: '600', color: '#6B5C7C', marginTop: 2 },
  toggle: { width: 46, height: 28, borderRadius: 999, borderWidth: 1.5, justifyContent: 'center', paddingHorizontal: 3, backgroundColor: '#EFE7F8' },
  toggleOn: { backgroundColor: '#55147C', borderColor: '#55147C' },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  token: { fontSize: 12, fontWeight: '700', color: '#55147C', backgroundColor: '#EFE7F8', borderRadius: 10, padding: 10, marginBottom: 12 },
});
