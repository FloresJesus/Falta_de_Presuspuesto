import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

import { Badge, Button, Card, Hero } from '@/components/ui';
import { Markdown } from '@/components/Markdown';
import { useContenidosEducativos } from '@/hooks/useInstituciones';
import { useCuestionario } from '@/hooks/useCuestionario';
import { Palette, Radius, Shadows } from '@/constants/theme';

const TIPOS_LABEL: Record<string, string> = {
  articulo: 'Artículo',
  infografia: 'Infografía',
  video: 'Video',
};

export default function ContenidoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contenidos, loading } = useContenidosEducativos();
  const { cuestionario, cargarPorContenido } = useCuestionario();

  const contenido = contenidos.find((c) => c.id === id);

  useEffect(() => {
    if (contenido) {
      void cargarPorContenido(contenido.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contenido?.id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Cargando contenido...</Text>
      </View>
    );
  }

  if (!contenido) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Contenido no encontrado</Text>
        <Button title="Volver" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={20} color={Palette.purple} />
        </Pressable>
        <Badge variant="accent">{TIPOS_LABEL[contenido.tipo] ?? contenido.tipo}</Badge>
      </View>

      <Text style={styles.category}>{contenido.tipo}</Text>
      <Text style={styles.title}>{contenido.titulo}</Text>
      <Text style={styles.resumen}>{contenido.resumen}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Ionicons name="time-outline" size={13} color={Palette.purple} />
          <Text style={styles.metaText}>{contenido.tiempo_lectura_min ?? 3} min</Text>
        </View>
        {contenido.fecha_revision ? (
          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={13} color={Palette.purple} />
            <Text style={styles.metaText}>Revisado: {contenido.fecha_revision}</Text>
          </View>
        ) : null}
      </View>

      <Card style={styles.card}>
        <Markdown text={contenido.cuerpo} />
      </Card>

      {contenido.fuente ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Fuente</Text>
          <Text style={styles.body}>{contenido.fuente}</Text>
          {contenido.url_fuente ? (
            <Pressable onPress={() => void Linking.openURL(contenido.url_fuente!)} style={styles.linkRow}>
              <Ionicons name="open-outline" size={16} color={Palette.purple} />
              <Text style={styles.linkText} numberOfLines={1}>{contenido.url_fuente}</Text>
            </Pressable>
          ) : null}
        </Card>
      ) : null}

      {cuestionario ? (
        <Hero style={styles.quizCard}>
          <View style={styles.quizIcon}>
            <Ionicons name="help-circle" size={24} color={Palette.surface} />
          </View>
          <Text style={styles.quizTitle}>Refuerza lo aprendido</Text>
          <Text style={styles.quizText}>
            {cuestionario.descripcion ?? 'Pon a prueba lo que aprendiste con un cuestionario breve.'}
          </Text>
          <View style={{ height: 12 }} />
          <Button
            title="Ir al cuestionario"
            size="md"
            variant="accent"
            fullWidth
            onPress={() => router.push({ pathname: '/cuestionario/[id]', params: { id: cuestionario.id } })}
          />
        </Hero>
      ) : null}

      <View style={{ height: 16 }} />
      <Button title="Volver" variant="outline" size="lg" fullWidth onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Palette.background, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  center: {
    flex: 1,
    backgroundColor: Palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loading: { color: Palette.muted, fontWeight: '700' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.card ?? {}),
  },
  category: { color: Palette.purple, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '800', color: Palette.ink, marginTop: 8, letterSpacing: -0.5, lineHeight: 32 },
  resumen: { color: Palette.mutedStrong, fontSize: 14, fontWeight: '600', marginTop: 10, lineHeight: 21 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Palette.purpleSoft,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaText: { color: Palette.purple, fontSize: 11, fontWeight: '700' },
  card: { marginTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Palette.ink, marginBottom: 8 },
  body: { fontSize: 14, fontWeight: '500', color: Palette.ink, lineHeight: 22 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  linkText: { color: Palette.purple, fontWeight: '800', fontSize: 13, flex: 1 },
  quizCard: { marginTop: 16 },
  quizIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quizTitle: { color: Palette.surface, fontSize: 19, fontWeight: '800' },
  quizText: { color: 'rgba(255,255,255,0.82)', fontSize: 13, fontWeight: '600', marginTop: 6, lineHeight: 19 },
});
