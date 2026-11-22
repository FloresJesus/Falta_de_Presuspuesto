import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/text';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, Toggle } from '@/components/ui';
import { useContactos } from '@/hooks/useContactos';
import { confirmar } from '@/lib/utils';
import { Palette, Radius, Shadows } from '@/constants/theme';

export default function ContactoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contactos, loading, actualizar, eliminar } = useContactos();
  const contacto = contactos.find((c) => c.id === id);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [relacion, setRelacion] = useState('');
  const [esPrincipal, setEsPrincipal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const hidratado = useRef<string | null>(null);

  // Los contactos llegan de forma asíncrona: recién entonces llenamos el
  // formulario (si no, los campos quedarían vacíos al abrir la pantalla).
  useEffect(() => {
    if (!contacto || hidratado.current === contacto.id) return;
    hidratado.current = contacto.id;
    setNombre(contacto.nombre);
    setTelefono(contacto.telefono ?? '');
    setCorreo(contacto.correo ?? '');
    setRelacion(contacto.relacion ?? '');
    setEsPrincipal(Boolean(contacto.es_principal));
  }, [contacto]);

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

  function handleDelete() {
    if (!contacto) return;
    confirmar({
      titulo: 'Eliminar contacto',
      mensaje: `¿Seguro que quieres eliminar a ${contacto.nombre}?`,
      onConfirmar: async () => {
        const res = await eliminar(contacto.id);
        if (res.error) {
          setError(res.error);
          return;
        }
        router.back();
      },
    });
  }

  if (loading && !contacto) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={Palette.purple} />
        <Text style={styles.subtitle}>Cargando contacto...</Text>
      </View>
    );
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
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
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
