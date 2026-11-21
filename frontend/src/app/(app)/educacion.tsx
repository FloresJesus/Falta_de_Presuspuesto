import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Badge, Chip } from '@/components/ui';
import { useCategoriasEducativas, useContenidosEducativos } from '@/hooks/useInstituciones';

const TIPOS_LABEL: Record<string, string> = {
  articulo: 'Artículo',
  infografia: 'Infografía',
  video: 'Video',
};

export default function EducacionScreen() {
  const { contenidos, loading } = useContenidosEducativos();
  const [query, setQuery] = useState('');
  const [categoria, setCategoria] = useState('todas');

  const lista = useMemo(() => {
    return contenidos.filter((c) => {
      const okCategoria = categoria === 'todas' || c.categoria_id === categoria;
      const q = query.trim().toLowerCase();
      const okQuery =
        !q ||
        c.titulo.toLowerCase().includes(q) ||
        c.resumen.toLowerCase().includes(q);
      return okCategoria && okQuery;
    });
  }, [contenidos, query, categoria]);

  const featured = contenidos[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Aprender</Text>
      <Text style={styles.subtitle}>Conocer los límites es el primer paso para protegerse.</Text>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#6B5C7C" />
        <TextInput placeholder="Buscar temas, señales, leyes..." value={query} onChangeText={setQuery} style={styles.searchInput} />
      </View>

      <ScrollChips value={categoria} onChange={setCategoria} />

      {featured ? (
        <Pressable onPress={() => router.push({ pathname: '/contenido/[id]', params: { id: featured.id } })} style={({ pressed }) => [styles.featuredCard, pressed && { opacity: 0.95 }]}>
          <View style={styles.featuredBadge}>
            <Ionicons name="book" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.featuredTitle}>{featured.titulo}</Text>
          <Text style={styles.featuredText}>{featured.resumen}</Text>
          <View style={styles.featuredMetaRow}>
            <Badge variant="accent">{TIPOS_LABEL[featured.tipo] ?? featured.tipo}</Badge>
            {featured.tiempo_lectura_min ? <Text style={styles.featuredMeta}>{featured.tiempo_lectura_min} min de lectura</Text> : null}
          </View>
        </Pressable>
      ) : null}

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Temas destacados</Text>
        <Text style={styles.listCount}>{lista.length}</Text>
      </View>

      {loading ? <Text style={styles.loading}>Cargando contenido...</Text> : null}

      {lista.map((c) => (
        <Pressable key={c.id} onPress={() => router.push({ pathname: '/contenido/[id]', params: { id: c.id } })} style={({ pressed }) => [styles.contentCard, pressed && { opacity: 0.95 }]}>
          <View style={styles.contentRow}>
            <View style={styles.contentIcon}>
              <Ionicons name={c.tipo === 'infografia' ? 'document' : 'book'} size={20} color="#55147C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contentTitle}>{c.titulo}</Text>
              <Text style={styles.contentSummary} numberOfLines={2}>{c.resumen}</Text>
              <View style={styles.contentMeta}>
                <Badge variant="primary">{TIPOS_LABEL[c.tipo] ?? c.tipo}</Badge>
                {c.tiempo_lectura_min ? <Text style={styles.contentMetaText}>{c.tiempo_lectura_min} min</Text> : null}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6B5C7C" />
          </View>
        </Pressable>
      ))}

      {!loading && lista.length === 0 ? <Text style={styles.empty}>No encontramos contenido para tu búsqueda.</Text> : null}
    </ScrollView>
  );
}

function ScrollChips({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { categorias } = useCategoriasEducativas();
  const todas = [{ id: 'todas', nombre: 'Todas' } as const];
  return (
    <View style={styles.chipsWrap}>
      {[...todas, ...categorias.map((c) => ({ id: c.id, nombre: c.nombre }))].map((c) => (
        <Chip key={c.id} label={c.nombre} selected={value === c.id} onPress={() => onChange(c.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAF9FF', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '800', color: '#22147C' },
  subtitle: { fontSize: 13, fontWeight: '600', color: '#6B5C7C', marginTop: 2, marginBottom: 14 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7DDF2', paddingHorizontal: 14, paddingVertical: 12 },
  searchInput: { flex: 1, fontSize: 14, color: '#22147C' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  featuredCard: { marginTop: 16, backgroundColor: '#22147C', borderRadius: 20, padding: 18, borderWidth: 0 },
  featuredBadge: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#55147C', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featuredTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  featuredText: { color: '#E6DDF2', fontSize: 13, fontWeight: '600', marginTop: 6 },
  featuredMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  featuredMeta: { color: '#BCA8D0', fontSize: 11, fontWeight: '700' },
  listHeader: { flexDirection: 'row', alignItems: 'baseline', marginTop: 22, marginBottom: 10 },
  listTitle: { fontSize: 17, fontWeight: '800', color: '#22147C' },
  listCount: { color: '#6B5C7C', fontSize: 12, fontWeight: '700', marginLeft: 8 },
  loading: { color: '#6B5C7C', fontWeight: '600', marginTop: 10 },
  contentCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#E7DDF2', marginBottom: 10 },
  contentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contentIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFE7F8', alignItems: 'center', justifyContent: 'center' },
  contentTitle: { color: '#22147C', fontSize: 14, fontWeight: '800' },
  contentSummary: { color: '#6B5C7C', fontSize: 12, fontWeight: '600', marginTop: 3 },
  contentMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  contentMetaText: { color: '#6B5C7C', fontSize: 11, fontWeight: '700' },
  empty: { color: '#6B5C7C', fontWeight: '600', textAlign: 'center', marginTop: 30 },
});
