import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { LogoWordmark } from '@/components/logo';
import { useAuth } from '@/context/AuthContext';
import { Gradients, Palette, Radius, Shadows } from '@/constants/theme';

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
    <View style={styles.root}>
      <LinearGradient colors={Gradients.soft} style={styles.topBand} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.replace('/')} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={Palette.purple} />
          </Pressable>

          <View style={styles.brand}>
            <LogoWordmark size={54} color={Palette.purple} />
          </View>

          <Text style={styles.title}>Bienvenida de vuelta</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar con tu red de apoyo.</Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Ionicons name="mail-outline" size={18} color={Palette.muted} />
              <TextInput
                placeholder="Correo electrónico"
                placeholderTextColor="#9A8BA8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
            <View style={styles.field}>
              <Ionicons name="lock-closed-outline" size={18} color={Palette.muted} />
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#9A8BA8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Entrar" onPress={handleSubmit} loading={loading} size="lg" fullWidth />
          </View>

          <Pressable onPress={() => router.push('/register')} style={styles.linkRow}>
            <Text style={styles.linkMuted}>¿No tienes cuenta? </Text>
            <Text style={styles.link}>Crear una</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
  safe: { flex: 1 },
  topBand: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.card ?? {}),
  },
  brand: { alignItems: 'center', marginTop: 28, marginBottom: 26 },
  title: { fontSize: 26, fontWeight: '700', color: Palette.ink, letterSpacing: -0.5 },
  subtitle: { color: Palette.muted, fontWeight: '600', marginTop: 6, marginBottom: 24, lineHeight: 20 },
  form: { gap: 12 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 16,
    ...(Shadows.card ?? {}),
  },
  input: { flex: 1, paddingVertical: 15, fontSize: 15, color: Palette.ink },
  error: { color: Palette.danger, fontWeight: '700', fontSize: 13 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkMuted: { color: Palette.muted, fontWeight: '600' },
  link: { color: Palette.purple, fontWeight: '800' },
});
