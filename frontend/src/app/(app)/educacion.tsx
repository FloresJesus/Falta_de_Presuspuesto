import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { IconTile, Mascot } from '@/components/ui';
import { ScaleIcon } from '@/components/masi-icons';
import { useContenidosEducativos } from '@/hooks/useInstituciones';
import { Palette, Radius, Shadows } from '@/constants/theme';

const ICONOS: (keyof typeof Ionicons.glyphMap)[] = [
  'shield-outline',
  'document-text-outline',
  'lock-closed-outline',
  'heart-outline',
];

export default function EducacionScreen() {
  const { contenidos, loading } = useContenidosEducativos();
  const [query, setQuery] = useState('');
  const [buscando, setBuscando] = useState(false);

  const lista = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contenidos;
    return contenidos.filter(
      (c) => c.titulo.toLowerCase().includes(q) || c.resumen.toLowerCase().includes(q),
    );
  }, [contenidos, query]);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/inicio')} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Palette.purple} />
        </Pressable>
        <Text style={styles.title}>Educación</Text>
        <Pressable onPress={() => setBuscando((v) => !v)} style={styles.headerBtn}>
          <Ionicons name="search" size={24} color={Palette.purple} />
        </Pressable>
      </View>

      {buscando ? (
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={Palette.muted} />
          <TextInput
            placeholder="Buscar temas, señales, leyes..."
            placeholderTextColor="#A897B2"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            autoFocus
          />
          {query ? (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={Palette.muted} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.hero}>
        <Mascot height={96} style={styles.heroMascot} />
        <Text style={styles.heroTitle}>
          Aprende, cuídate y{'\n'}empodérate <Text style={{ color: Palette.pink }}>♡</Text>
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Temas destacados</Text>

      {loading ? <Text style={styles.loading}>Cargando contenido...</Text> : null}

      {lista.map((c, i) => (
        <Pressable
          key={c.id}
          onPress={() => router.push({ pathname: '/contenido/[id]', params: { id: c.id } })}
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}>
          {i % 4 === 1 ? (
            <View style={styles.cardIcon}>
              <ScaleIcon size={26} color={Palette.purple} />
            </View>
          ) : (
            <IconTile icon={ICONOS[i % ICONOS.length]} size={54} background={Palette.lilac} color={Palette.purple} iconSize={26} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={2}>{c.titulo}</Text>
            <View style={styles.meta}>
              <Ionicons name="time-outline" size={16} color={Palette.muted} />
              <Text style={styles.metaText}>{c.tiempo_lectura_min ?? 5} min</Text>
            </View>
          </View>
          <View style={styles.play}>
            <Ionicons name="play" size={18} color={Palette.purple} />
          </View>
        </Pressable>
      ))}

      {!loading && lista.length === 0 ? <Text style={styles.empty}>No encontramos contenido para tu búsqueda.</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Palette.background, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 130 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 21, fontWeight: '800', color: Palette.purple, letterSpacing: -0.4 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    marginBottom: 12,
    ...(Shadows.card ?? {}),
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: Palette.purple },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.lilac,
    borderRadius: Radius.xxl,
    paddingLeft: 14,
    paddingRight: 16,
    paddingVertical: 10,
    marginBottom: 18,
    minHeight: 128,
    overflow: 'hidden',
  },
  heroMascot: { marginRight: 4 },
  heroTitle: { flex: 1, fontSize: 19, fontWeight: '800', color: Palette.purple, lineHeight: 26, letterSpacing: -0.3 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Palette.purple, marginBottom: 12, letterSpacing: -0.3 },
  loading: { color: Palette.muted, fontWeight: '600', marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: 10,
    marginBottom: 10,
    ...(Shadows.card ?? {}),
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Palette.purple, letterSpacing: -0.2, lineHeight: 20 },
  cardIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: Palette.lilac,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  metaText: { fontSize: 12, fontWeight: '600', color: Palette.muted },
  play: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Palette.lilac,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { color: Palette.muted, fontWeight: '600', textAlign: 'center', marginTop: 20 },
});
