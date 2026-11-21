import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui';
import { useContactos } from '@/hooks/useContactos';

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nuevo contacto</Text>
      <Text style={styles.subtitle}>Tu persona de confianza recibirá las alertas SOS.</Text>
      <View style={styles.form}>
        <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
        <TextInput placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" style={styles.input} />
        <TextInput placeholder="Correo (opcional)" value={correo} onChangeText={setCorreo} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <TextInput placeholder="Relación (madre, pareja, amiga...)" value={relacion} onChangeText={setRelacion} style={styles.input} />
        <Pressable style={styles.toggleRow} onPress={() => setEsPrincipal(!esPrincipal)}>
          <Text style={styles.toggleText}>Es mi contacto principal</Text>
          <View style={[styles.toggle, esPrincipal && styles.toggleOn]}>
            <View style={[styles.toggleKnob, esPrincipal && { transform: 'translateX(20px)' }]} />
          </View>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Guardar" onPress={handleSave} loading={saving} size="lg" fullWidth />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAF9FF', paddingHorizontal: 24, paddingTop: 64, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: '#22147C' },
  subtitle: { color: '#6B5C7C', fontWeight: '600', marginTop: 6, marginBottom: 20 },
  form: { gap: 12 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7DDF2', paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#22147C' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7DDF2', padding: 14 },
  toggleText: { color: '#22147C', fontSize: 14, fontWeight: '700' },
  toggle: { width: 46, height: 28, borderRadius: 999, borderWidth: 1.5, justifyContent: 'center', paddingHorizontal: 3, backgroundColor: '#EFE7F8' },
  toggleOn: { backgroundColor: '#55147C', borderColor: '#55147C' },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  error: { color: '#E5484D', fontWeight: '700', fontSize: 13 },
});
