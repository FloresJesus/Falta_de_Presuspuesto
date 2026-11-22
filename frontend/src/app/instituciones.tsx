import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { IconTile } from '@/components/ui';
import { ScaleIcon, CrossIcon } from '@/components/masi-icons';
import { useInstituciones } from '@/hooks/useInstituciones';
import { useUbicacion } from '@/hooks/useUbicacion';
import { Palette, Radius, Shadows } from '@/constants/theme';

const FILTROS = [
  { id: 'todas', label: 'Todas' },
  { id: 'salud', label: 'Salud' },
  { id: 'legal', label: 'Legal' },
  { id: 'social', label: 'Social' },
];

const ESTILO_CATEGORIA: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string }
> = {
  legal: { icon: 'scale-outline', bg: '#D6EFE2', color: '#2E9E6B' },
  salud: { icon: 'medkit-outline', bg: '#FAD9DE', color: '#E5484D' },
  psicologica: { icon: 'book-outline', bg: '#D6E6F7', color: '#4A90D9' },
  proteccion: { icon: 'book-outline', bg: '#FBE0CC', color: '#E07A2F' },
};

function distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function InstitucionesScreen() {
  const { instituciones, loading, error } = useInstituciones();
  const { location } = useUbicacion();
  const [filtro, setFiltro] = useState('todas');
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  const lista = useMemo(() => {
    if (filtro === 'todas') return instituciones;
    if (filtro === 'social') return instituciones.filter((i) => i.categoria === 'psicologica' || i.categoria === 'proteccion');
    return instituciones.filter((i) => i.categoria === filtro);
  }, [instituciones, filtro]);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Palette.purple} />
        </Pressable>
        <Text style={styles.title}>Instituciones de apoyo</Text>
        <Pressable onPress={() => setMostrarFiltros((v) => !v)} style={styles.headerBtn}>
          <Ionicons name="options-outline" size={24} color={Palette.purple} />
        </Pressable>
      </View>

      {mostrarFiltros ? (
        <View style={styles.chips}>
          {FILTROS.map((f) => {
            const activo = filtro === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFiltro(f.id)}
                style={({ pressed }) => [styles.chip, activo ? styles.chipOn : styles.chipOff, pressed && { opacity: 0.85 }]}>
                <Text style={[styles.chipText, activo && styles.chipTextOn]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <Text style={styles.loading}>Cargando directorio...</Text> : null}
      {!loading && lista.length === 0 ? <Text style={styles.empty}>No encontramos instituciones para esta categoría.</Text> : null}

      {lista.map((i) => {
        const dist =
          location && i.latitud != null && i.longitud != null
            ? `${distanciaKm(location.latitude, location.longitude, i.latitud, i.longitud).toFixed(1)} km`
            : i.ciudad ?? i.alcance ?? 'Bolivia';
        return (
          <Pressable
            key={i.id}
            onPress={() => router.push({ pathname: '/institucion/[id]', params: { id: i.id } })}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}>
            <CategoriaIcon categoria={i.categoria} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={2}>{i.nombre}</Text>
              <Text style={styles.cardText} numberOfLines={2}>{i.descripcion}</Text>
              <View style={styles.location}>
                <Ionicons name="location-outline" size={16} color={Palette.purple} />
                <Text style={styles.locationText}>{dist}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Palette.purple} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function CategoriaIcon({ categoria }: { categoria: string }) {
  if (categoria === 'legal') {
    return (
      <View style={[styles.iconTile, { backgroundColor: '#D6EFE2' }]}>
        <ScaleIcon size={34} color="#2E9E6B" />
      </View>
    );
  }
  if (categoria === 'salud') {
    return (
      <View style={[styles.iconTile, { backgroundColor: '#FAD9DE' }]}>
        <CrossIcon size={32} color="#E5484D" />
      </View>
    );
  }
  const estilo = ESTILO_CATEGORIA[categoria] ?? { icon: 'shield-outline' as const, bg: Palette.purpleSoft, color: Palette.purple };
  return <IconTile icon={estilo.icon} size={68} background={estilo.bg} color={estilo.color} iconSize={32} />;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Palette.background, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: Palette.purple, letterSpacing: -0.4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 9 },
  chipOn: { backgroundColor: Palette.purple },
  chipOff: { backgroundColor: Palette.lilac },
  chipText: { fontSize: 14, fontWeight: '700', color: Palette.purple },
  chipTextOn: { color: Palette.surface },
  error: { color: Palette.danger, fontWeight: '700', marginTop: 8 },
  loading: { color: Palette.muted, fontWeight: '600', marginTop: 10 },
  empty: { color: Palette.muted, fontWeight: '600', marginTop: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: 12,
    marginBottom: 12,
    ...(Shadows.card ?? {}),
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: Palette.purple, letterSpacing: -0.2, lineHeight: 22 },
  cardText: { fontSize: 13, fontWeight: '600', color: Palette.muted, marginTop: 3, lineHeight: 18 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  locationText: { fontSize: 13, fontWeight: '700', color: Palette.purple },
  iconTile: { width: 68, height: 68, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
