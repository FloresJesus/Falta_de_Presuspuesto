import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card } from '@/components/ui';
import { Markdown } from '@/components/Markdown';
import { useContenidosEducativos } from '@/hooks/useInstituciones';
import { useCuestionario } from '@/hooks/useCuestionario';

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
      <View style={styles.container}>
        <Text style={styles.title}>Cargando contenido...</Text>
      </View>
    );
  }

  if (!contenido) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Contenido no encontrado</Text>
        <Button title="Volver" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.category}>{contenido.tipo}</Text>
      <Text style={styles.title}>{contenido.titulo}</Text>
      <Text style={styles.resumen}>{contenido.resumen}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{TIPOS_LABEL[contenido.tipo] ?? contenido.tipo}</Text>
        {contenido.tiempo_lectura_min ? <Text style={styles.metaText}>{contenido.tiempo_lectura_min} min de lectura</Text> : null}
        {contenido.fecha_revision ? <Text style={styles.metaText}>Revisado: {contenido.fecha_revision}</Text> : null}
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
              <Ionicons name="open-outline" size={16} color="#55147C" />
              <Text style={styles.linkText}>{contenido.url_fuente}</Text>
            </Pressable>
          ) : null}
        </Card>
      ) : null}

      {cuestionario ? (        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Refuerza lo aprendido</Text>
          <Text style={styles.body}>{cuestionario.descripcion ?? 'Pon a prueba lo aprendido.'}</Text>
          <Button title="Ir al cuestionario" size="sm" fullWidth onPress={() => router.push({ pathname: '/cuestionario/[id]', params: { id: cuestionario.id } })} />
        </Card>
      ) : null}

      <Button title="Volver" variant="outline" size="lg" fullWidth onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  content: { padding: 24, paddingTop: 64, paddingBottom: 40 },
  category: { color: '#55147C', fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '800', color: '#22147C', marginTop: 8 },
  resumen: { color: '#6B5C7C', fontSize: 14, fontWeight: '600', marginTop: 10, lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  metaText: { color: '#6B5C7C', fontSize: 12, fontWeight: '700' },
  card: { marginTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#22147C', marginBottom: 8 },
  body: { fontSize: 14, fontWeight: '500', color: '#22147C', lineHeight: 22 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  linkText: { color: '#55147C', fontWeight: '800', fontSize: 14 },
});
