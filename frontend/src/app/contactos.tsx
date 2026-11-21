import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

import { Avatar, Badge, Button, Card } from '@/components/ui';
import { useContactos } from '@/hooks/useContactos';

export default function ContactosScreen() {
  const { contactos, loading, error, eliminar } = useContactos();

  async function handleEliminar(id: string, nombre: string) {
    Alert.alert('Eliminar contacto', `¿Seguro que quieres eliminar a ${nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => void eliminar(id) },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Mis contactos</Text>
          <Text style={styles.subtitle}>Personas de confianza que pueden acompañarte.</Text>
        </View>
        <Button title="+ Nuevo" size="sm" onPress={() => router.push('/contactos/nuevo')} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? <Text style={styles.loading}>Cargando contactos...</Text> : null}

      {!loading && contactos.length === 0 ? (
        <Card>
          <Text style={styles.empty}>Aún no tienes contactos de confianza.</Text>
          <Button title="Añadir mi primer contacto" size="sm" onPress={() => router.push('/contactos/nuevo')} />
        </Card>
      ) : null}

      {contactos.map((c) => (
        <Card key={c.id}>
          <Pressable onPress={() => router.push({ pathname: '/contactos/[id]', params: { id: c.id } })}>
            <View style={styles.contactRow}>
              <Avatar name={c.nombre} size={46} />
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.contactName}>{c.nombre}</Text>
                  {c.es_principal ? <Badge variant="accent">Principal</Badge> : null}
                </View>
                <Text style={styles.contactMeta}>{c.relacion ?? 'Persona de confianza'}</Text>
                <Text style={styles.contactMeta}>Tel: {c.telefono}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6B5C7C" />
            </View>
          </Pressable>
          <View style={styles.actionsRow}>
            <Button title="Llamar" size="sm" variant="outline" onPress={() => void Linking.openURL(`tel:${c.telefono}`)} />
            <Button title="Editar" size="sm" variant="soft" onPress={() => router.push({ pathname: '/contactos/[id]', params: { id: c.id } })} />
            <Button title="Eliminar" size="sm" variant="ghost" onPress={() => void handleEliminar(c.id, c.nombre)} />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAF9FF', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#22147C' },
  subtitle: { fontSize: 13, fontWeight: '600', color: '#6B5C7C', marginTop: 2, marginBottom: 14 },
  error: { color: '#E5484D', fontWeight: '700', marginBottom: 10 },
  loading: { color: '#6B5C7C', fontWeight: '600', marginTop: 10 },
  empty: { color: '#6B5C7C', fontWeight: '600', textAlign: 'center', marginBottom: 10 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactName: { fontSize: 15, fontWeight: '800', color: '#22147C' },
  contactMeta: { color: '#6B5C7C', fontSize: 12, fontWeight: '600', marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'flex-end' },
});
