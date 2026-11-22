import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, Toggle } from '@/components/ui';
import { useContactos } from '@/hooks/useContactos';
import { Palette, Radius, Shadows } from '@/constants/theme';

export default function ContactoNuevoScreen() {
  const { crear } = useContactos();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [relacion, setRelacion] = useState('');
  const [esPrincipal, setEsPrincipal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    if (nombre.trim().length < 2) {
      setError('Ingresa el nombre de la persona');
      return;
    }
    if (telefono.trim().length < 6) {
      setError('Ingresa un teléfono válido');
      return;
    }
    setSaving(true);
    const res = await crear({ nombre, telefono, correo, relacion, es_principal: esPrincipal });
    setSaving(false);
    if (res.error) {
      setError(res.error);
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
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Nuevo contacto</Text>
          <Text style={styles.subtitle}>Recibirá tus alertas SOS.</Text>
        </View>
      </View>

      <Card>
        <View style={styles.form}>
          <Field icon="person-outline" placeholder="Nombre" value={nombre} onChangeText={setNombre} />
          <Field icon="call-outline" placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
          <Field icon="mail-outline" placeholder="Correo (opcional)" value={correo} onChangeText={setCorreo} autoCapitalize="none" keyboardType="email-address" />
          <Field icon="heart-outline" placeholder="Relación (madre, pareja, amiga...)" value={relacion} onChangeText={setRelacion} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleText}>Es mi contacto principal</Text>
              <Text style={styles.toggleDesc}>Será el primero en recibir tus alertas.</Text>
            </View>
            <Toggle value={esPrincipal} onChange={setEsPrincipal} />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Guardar contacto" onPress={handleSave} loading={saving} size="lg" fullWidth />
        </View>
      </Card>

      <Text style={styles.note}>
        Solo tú puedes ver y administrar tus contactos de confianza.
      </Text>
    </ScrollView>
  );
}

function Field({
  icon,
  ...props
}: React.ComponentProps<typeof TextInput> & { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.field}>
      <Ionicons name={icon} size={18} color={Palette.muted} />
      <TextInput placeholderTextColor="#9A8BA8" {...props} style={styles.input} />
    </View>
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
  form: { gap: 12 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 14, color: Palette.ink },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 14,
    gap: 12,
  },
  toggleText: { color: Palette.ink, fontSize: 14, fontWeight: '800' },
  toggleDesc: { color: Palette.muted, fontSize: 11, fontWeight: '600', marginTop: 2 },
  error: { color: Palette.danger, fontWeight: '700', fontSize: 13 },
  note: { color: Palette.muted, fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 16, lineHeight: 16 },
});
