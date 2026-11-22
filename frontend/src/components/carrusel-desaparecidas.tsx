import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/text';
import { useDesaparecidas } from '@/hooks/useDesaparecidas';
import { formatearFecha } from '@/lib/utils';
import { Palette, Radius, Shadows } from '@/constants/theme';

export function CarruselDesaparecidas() {
  const { personas, loading } = useDesaparecidas();
  const [activa, setActiva] = useState(0);

  if (loading || personas.length === 0) return null;

  return (
    <View style={styles.bloque}>
      <View style={styles.header}>
        <Ionicons name="alert-circle-outline" size={18} color={Palette.pink} />
        <Text style={styles.titulo}>Desaparecidas recientemente</Text>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setActiva(Math.round(e.nativeEvent.contentOffset.x / 300))}>
        {personas.map((p) => (
          <View key={p.id} style={styles.card}>
            <Image source={p.foto_url ?? ''} style={styles.foto} contentFit="cover" />
            <View style={styles.info}>
              <Text style={styles.nombre}>
                {p.nombre}
                {p.edad != null ? `, ${p.edad}` : ''}
              </Text>
              <Text style={styles.lugar}>{p.lugar}</Text>
              <Text style={styles.descripcion} numberOfLines={2}>
                {p.descripcion ?? 'Sin descripción'}
              </Text>
              <Text style={styles.fecha}>Vista: {formatearFecha(p.fecha_desaparicion)}</Text>
              {p.contacto_familiar ? (
                <Pressable
                  onPress={() => {
                    const tel = p.contacto_familiar?.match(/\d{7,}/)?.[0];
                    if (tel) void Linking.openURL(`tel:${tel}`);
                  }}
                  style={styles.llamar}>
                  <Ionicons name="call-outline" size={14} color={Palette.pink} />
                  <Text style={styles.llamarText}>Llamar a familia</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {personas.map((p, i) => (
          <View key={p.id} style={[styles.dot, i === activa && styles.dotOn]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bloque: { marginTop: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  titulo: { fontSize: 15, fontWeight: '800', color: Palette.purple },
  card: {
    width: 300,
    flexDirection: 'row',
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginRight: 10,
    ...(Shadows.card ?? {}),
  },
  foto: { width: 100, height: '100%', minHeight: 130, backgroundColor: Palette.lilac },
  info: { flex: 1, padding: 12, gap: 3 },
  nombre: { fontSize: 16, fontWeight: '800', color: Palette.purpleDeep },
  lugar: { fontSize: 11, fontWeight: '800', color: Palette.pink },
  descripcion: { fontSize: 11, fontWeight: '600', color: Palette.mutedStrong, marginTop: 2 },
  fecha: { fontSize: 10, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  llamar: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, alignSelf: 'flex-start' },
  llamarText: { fontSize: 11, fontWeight: '800', color: Palette.pink },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Palette.border },
  dotOn: { width: 16, backgroundColor: Palette.pink },
});
