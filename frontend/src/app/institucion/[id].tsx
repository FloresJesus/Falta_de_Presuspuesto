import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

import { Badge, Button, Card } from '@/components/ui';
import { useInstituciones } from '@/hooks/useInstituciones';

export default function InstitucionDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { instituciones } = useInstituciones();
  const institucion = instituciones.find((i) => i.id === id);

  if (!institucion) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Institución no encontrada</Text>
      </View>
    );
  }

  const mapsUrl = institucion.latitud != null && institucion.longitud != null
    ? `https://maps.google.com/?q=${institucion.latitud},${institucion.longitud}`
    : null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{institucion.nombre}</Text>
      <View style={styles.badgesRow}>
        <Badge variant="accent">{institucion.categoria}</Badge>
        {institucion.verificado ? <Badge variant="success">Verificada</Badge> : null}
        {institucion.activo ? <Badge variant="primary">Activa</Badge> : null}
      </View>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Sobre la institución</Text>
        <Text style={styles.body}>{institucion.descripcion}</Text>
        {institucion.horario ? <Text style={styles.metaRow}>Horario: {institucion.horario}</Text> : null}
        {institucion.alcance ? <Text style={styles.metaRow}>Alcance: {institucion.alcance}</Text> : null}
        {institucion.ciudad ? <Text style={styles.metaRow}>Ciudad: {institucion.ciudad}</Text> : null}
        {institucion.direccion ? <Text style={styles.metaRow}>Dirección: {institucion.direccion}</Text> : null}
        {institucion.fecha_revision ? <Text style={styles.metaRow}>Revisión: {institucion.fecha_revision}</Text> : null}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Contacto</Text>
        {institucion.telefono ? (
          <Pressable onPress={() => void Linking.openURL(`tel:${institucion.telefono}`)} style={styles.contactRow}>
            <Ionicons name="call-outline" size={18} color="#55147C" />
            <Text style={styles.contactText}>{institucion.telefono}</Text>
          </Pressable>
        ) : null}
        {institucion.correo ? <Text style={styles.metaRow}>Correo: {institucion.correo}</Text> : null}
        {institucion.sitio_web ? (
          <Pressable onPress={() => void Linking.openURL(institucion.sitio_web!)} style={styles.contactRow}>
            <Ionicons name="globe-outline" size={18} color="#55147C" />
            <Text style={styles.contactText}>{institucion.sitio_web}</Text>
          </Pressable>
        ) : null}
      </Card>

      {institucion.latitud != null && institucion.longitud != null ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <Text style={styles.metaRow}>Lat: {institucion.latitud.toFixed(4)} · Lng: {institucion.longitud.toFixed(4)}</Text>
          {mapsUrl ? (
            <Pressable onPress={() => void Linking.openURL(mapsUrl)} style={styles.webButton}>
              <Ionicons name="map-outline" size={18} color="#55147C" />
              <Text style={styles.webButtonText}>Abrir en Google Maps</Text>
            </Pressable>
          ) : null}
        </Card>
      ) : null}

      <Button title="Llamar" size="lg" fullWidth onPress={() => institucion.telefono ? void Linking.openURL(`tel:${institucion.telefono}`) : void 0} />
      <View style={{ height: 12 }} />
      <Button title="Volver" variant="outline" size="lg" fullWidth onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  content: { padding: 24, paddingTop: 64, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#22147C', marginBottom: 12 },
  badgesRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  card: { marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#22147C', marginBottom: 8 },
  body: { fontSize: 14, fontWeight: '500', color: '#22147C', lineHeight: 22 },
  metaRow: { fontSize: 13, fontWeight: '600', color: '#6B5C7C', marginTop: 6 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  contactText: { fontSize: 14, fontWeight: '700', color: '#55147C' },
  webButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  webButtonText: { color: '#55147C', fontWeight: '800', fontSize: 14 },
});
