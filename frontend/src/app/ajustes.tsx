import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Avatar, Button, Card } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export default function AjustesScreen() {
  const { profile, signOut, updateProfile } = useAuth();
  const [nombre, setNombre] = useState(profile?.nombre ?? '');
  const [telefono, setTelefono] = useState(profile?.telefono ?? '');
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSave() {
    setMsg(null);
    const res = await updateProfile({ nombre, telefono });
    if (res.error) {
      setMsg(res.error);
      return;
    }
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card style={styles.profileCard}>
        <Avatar name={profile?.nombre ?? 'amiga'} size={60} />
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{profile?.nombre ?? 'Amiga LÍA'}</Text>
          <Text style={styles.profileEmail}>{profile?.correo ?? 'Sin correo registrado'}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Mi perfil</Text>
        <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre" style={styles.input} />
        <TextInput value={telefono} onChangeText={setTelefono} placeholder="Teléfono" keyboardType="phone-pad" style={styles.input} />
        {msg ? <Text style={styles.error}>{msg}</Text> : null}
        <Button title="Guardar cambios" size="sm" fullWidth onPress={() => void handleSave()} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Preferencias</Text>
        <Pressable style={styles.menuItem} onPress={() => router.push('/compartir')}>
          <Ionicons name="location-outline" size={20} color="#55147C" />
          <View style={{ flex: 1 }}>
            <Text style={styles.menuLabel}>Compartir ubicación</Text>
            <Text style={styles.menuDesc}>Acompañamiento con autorización explícita.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B5C7C" />
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => router.push('/asistente')}>
          <Ionicons name="sparkles-outline" size={20} color="#55147C" />
          <View style={{ flex: 1 }}>
            <Text style={styles.menuLabel}>Asistente LÍA</Text>
            <Text style={styles.menuDesc}>Orientación personalizada.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B5C7C" />
        </Pressable>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Ayuda y seguridad</Text>
        <Pressable style={styles.menuItem} onPress={() => router.push('/instituciones')}>
          <Ionicons name="shield-outline" size={20} color="#55147C" />
          <View style={{ flex: 1 }}>
            <Text style={styles.menuLabel}>Directorio de apoyo</Text>
            <Text style={styles.menuDesc}>Instituciones y rutas de ayuda.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B5C7C" />
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => router.push('/contactos')}>
          <Ionicons name="people-outline" size={20} color="#55147C" />
          <View style={{ flex: 1 }}>
            <Text style={styles.menuLabel}>Mis contactos</Text>
            <Text style={styles.menuDesc}>Red de apoyo de confianza.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B5C7C" />
        </Pressable>
      </Card>

      <Button title="Cerrar sesión" variant="danger" size="lg" fullWidth onPress={() => void signOut()} />

      <Text style={styles.version}>LÍA · Versión 1.0.0 · Una red que te acompaña.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 70, paddingBottom: 40 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileName: { color: '#22147C', fontSize: 17, fontWeight: '800' },
  profileEmail: { color: '#6B5C7C', fontSize: 12, fontWeight: '600', marginTop: 2 },
  card: { marginTop: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#22147C', marginBottom: 10 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7DDF2', paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#22147C', marginBottom: 10 },
  error: { color: '#E5484D', fontWeight: '700', fontSize: 12, marginBottom: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  menuLabel: { color: '#22147C', fontSize: 14, fontWeight: '800' },
  menuDesc: { color: '#6B5C7C', fontSize: 12, fontWeight: '600', marginTop: 2 },
  version: { textAlign: 'center', color: '#6B5C7C', fontSize: 11, fontWeight: '700', marginTop: 18, letterSpacing: 0.8 },
});
