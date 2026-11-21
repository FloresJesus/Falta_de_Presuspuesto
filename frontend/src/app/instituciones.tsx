import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Badge } from '@/components/ui';
import { useInstituciones } from '@/hooks/useInstituciones';
const CATEGORIAS = [
  { id: 'todas', label: 'Todas' },
  { id: 'legal', label: 'Legal' },
  { id: 'psicologica', label: 'Psicológica' },
  { id: 'salud', label: 'Salud' },
  { id: 'proteccion', label: 'Protección' },
];

export default function InstitucionesScreen() {
  const { instituciones, loading, error } = useInstituciones();
  const [filtro, setFiltro] = useState('todas');

  const lista = useMemo(
    () => (filtro === 'todas' ? instituciones : instituciones.filter((i) => i.categoria === filtro)),
    [instituciones, filtro],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Directorio de apoyo</Text>
      <Text style={styles.subtitle}>Puertas de entrada y acompañamiento en Bolivia.</Text>

      <View style={styles.chipsWrap}>
        {CATEGORIAS.map((c) => (
          <Pressable key={c.id} onPress={() => setFiltro(c.id)} style={({ pressed }) => [styles.chip, filtro === c.id && styles.chipOn, pressed && { opacity: 0.85 }]}>
            <Text style={[styles.chipText, filtro === c.id && styles.chipTextOn]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <Text style={styles.loading}>Cargando directorio...</Text> : null}

      {!loading && lista.length === 0 ? <Text style={styles.empty}>No encontramos instituciones para esta categoría.</Text> : null}

      {lista.map((i) => (
        <Pressable key={i.id} onPress={() => router.push({ pathname: '/institucion/[id]', params: { id: i.id } })} style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}>
          <View style={styles.cardRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="shield" size={22} color="#55147C" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.cardTitle}>{i.nombre}</Text>
                {i.verificado ? <Badge variant="success">Verificada</Badge> : null}
              </View>
              <Text style={styles.cardText} numberOfLines={2}>{i.descripcion}</Text>
              <View style={styles.cardMeta}>
                <Badge variant="primary">{i.categoria}</Badge>
                {i.telefono ? <Text style={styles.cardMetaText}>Tel: {i.telefono}</Text> : null}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6B5C7C" />
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAF9FF', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '800', color: '#22147C' },
  subtitle: { fontSize: 13, fontWeight: '600', color: '#6B5C7C', marginTop: 2, marginBottom: 14 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1.5, borderColor: '#E7DDF2', backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8 },
  chipOn: { backgroundColor: '#55147C', borderColor: '#55147C' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#22147C' },
  chipTextOn: { color: '#FFFFFF' },
  error: { color: '#E5484D', fontWeight: '700', marginTop: 8 },
  loading: { color: '#6B5C7C', fontWeight: '600', marginTop: 10 },
  empty: { color: '#6B5C7C', fontWeight: '600', marginTop: 10 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#E7DDF2', marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#EFE7F8', alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#22147C', flex: 1 },
  cardText: { color: '#6B5C7C', fontSize: 12, fontWeight: '600', marginTop: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  cardMetaText: { color: '#6B5C7C', fontSize: 11, fontWeight: '700' },
});
