import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (nombre.trim().length < 2) {
      setError('Ingresa tu nombre (mínimo 2 caracteres)');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Ingresa un correo válido');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    const res = await signUp(nombre.trim(), email.trim(), password);
    setLoading(false);
    if (res.error) {
      setError('No pudimos crear tu cuenta. Inténtalo de nuevo.');
      return;
    }
    router.replace('/inicio');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crea tu cuenta</Text>
      <Text style={styles.subtitle}>Para protegerte y acompañarte, necesitamos saber quién eres.</Text>
      <View style={styles.form}>
        <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} autoCapitalize="words" style={styles.input} />
        <TextInput placeholder="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <TextInput placeholder="Confirmar contraseña" value={confirm} onChangeText={setConfirm} secureTextEntry style={styles.input} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Crear cuenta" onPress={handleSubmit} loading={loading} size="lg" fullWidth />
      </View>
      <Pressable onPress={() => router.replace('/login')}>
        <Text style={styles.link}>Ya tengo cuenta: iniciar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAF9FF', paddingHorizontal: 24, paddingTop: 64, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#22147C' },
  subtitle: { color: '#6B5C7C', fontWeight: '600', marginTop: 6, marginBottom: 24 },
  form: { gap: 12 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7DDF2', paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#22147C' },
  error: { color: '#E5484D', fontWeight: '700', fontSize: 13 },
  link: { color: '#55147C', fontWeight: '800', textAlign: 'center', marginTop: 14 },
});
