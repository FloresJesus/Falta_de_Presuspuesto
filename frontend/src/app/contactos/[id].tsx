import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui';
import { useContactos } from '@/hooks/useContactos';

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
        <Text style={styles.title}>Contacto no encontrado</Text>
        <Button title="Volver" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Editar contacto</Text>
      <View style={styles.form}>
        <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre" style={styles.input} />
        <TextInput value={telefono} onChangeText={setTelefono} placeholder="Teléfono" keyboardType="phone-pad" style={styles.input} />
        <TextInput value={correo} onChangeText={setCorreo} placeholder="Correo (opcional)" autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <TextInput value={relacion} onChangeText={setRelacion} placeholder="Relación" style={styles.input} />
        <Pressable style={styles.toggleRow} onPress={() => setEsPrincipal(!esPrincipal)}>
          <Text style={styles.toggleText}>Es mi contacto principal</Text>
          <View style={[styles.toggle, esPrincipal && styles.toggleOn]}>
            <View style={[styles.toggleKnob, esPrincipal && { transform: 'translateX(20px)' }]} />
          </View>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Guardar cambios" onPress={handleSave} loading={saving} size="lg" fullWidth />
        <Button title="Eliminar contacto" variant="danger" onPress={() => void handleDelete()} fullWidth />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  content: { padding: 24, paddingTop: 64, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#22147C', marginBottom: 16 },
  form: { gap: 12 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7DDF2', paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#22147C' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7DDF2', padding: 14 },
  toggleText: { color: '#22147C', fontSize: 14, fontWeight: '700' },
  toggle: { width: 46, height: 28, borderRadius: 999, borderWidth: 1.5, justifyContent: 'center', paddingHorizontal: 3, backgroundColor: '#EFE7F8' },
  toggleOn: { backgroundColor: '#55147C', borderColor: '#55147C' },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  error: { color: '#E5484D', fontWeight: '700', fontSize: 13 },
});
