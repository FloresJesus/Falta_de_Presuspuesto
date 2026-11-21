import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña');
      return;
    }
    setLoading(true);
    const res = await signIn(email.trim(), password);
    setLoading(false);
    if (res.error) {
      setError('No pudimos iniciar sesión. Revisa tu correo y contraseña.');
      return;
    }
    router.replace('/inicio');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bienvenida de vuelta</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar con tu red de apoyo.</Text>
      <View style={styles.form}>
        <TextInput placeholder="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Entrar" onPress={handleSubmit} loading={loading} size="lg" fullWidth />
      </View>
      <Pressable onPress={() => router.push('/register')}>
        <Text style={styles.link}>¿No tienes cuenta? Crear una</Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/')}>
        <Text style={styles.link}>Volver</Text>
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
