import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/text';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, Toggle } from '@/components/ui';
import { useContactos } from '@/hooks/useContactos';
import { Palette, Radius, Shadows } from '@/constants/theme';

export default function ContactoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contactos, actualizar, eliminar } = useContactos();
  const contacto = contactos.find((c) => c.id === id);

  const [nombre, setNombre] = useState(contacto?.nombre ?? '');
  const [telefono, setTelefono] = useState(contacto?.telefono ?? '');
  const [correo, setCorreo] = useState(contacto?.correo ?? '');
  const [relacion, setRelacion] = useState(contacto?.relacion ?? '');
  const [esPrincipal, setEsPrincipal] = useState(Boolean(contacto?.es_principal));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    if (!contacto) return;
    setSaving(true);
    const res = await actualizar(contacto.id, { nombre, telefono, correo, relacion, es_principal: esPrincipal });
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.back();
  }

  async function handleDelete() {
    if (!contacto) return;
    Alert.alert('Eliminar contacto', `¿Seguro que quieres eliminar a ${contacto.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => void eliminar(contacto.id) },
    ]);
  }

  if (!contacto) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={Palette.purple} />
          </Pressable>
          <Text style={styles.title}>Contacto no encontrado</Text>
        </View>
        <Button title="Volver" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={20} color={Palette.purple} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Editar contacto</Text>
          <Text style={styles.subtitle}>{contacto.nombre}</Text>
        </View>
      </View>

      <Card>
        <View style={styles.form}>
          <Field icon="person-outline" placeholder="Nombre" value={nombre} onChangeText={setNombre} />
          <Field icon="call-outline" placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
          <Field icon="mail-outline" placeholder="Correo (opcional)" value={correo} onChangeText={setCorreo} autoCapitalize="none" keyboardType="email-address" />
          <Field icon="heart-outline" placeholder="Relación" value={relacion} onChangeText={setRelacion} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleText}>Es mi contacto principal</Text>
              <Text style={styles.toggleDesc}>Será el primero en recibir tus alertas.</Text>
            </View>
            <Toggle value={esPrincipal} onChange={setEsPrincipal} />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Guardar cambios" onPress={handleSave} loading={saving} size="lg" fullWidth />
        </View>
      </Card>

      <View style={{ height: 12 }} />
      <Button title="Eliminar contacto" variant="danger" onPress={() => void handleDelete()} fullWidth />
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
});
