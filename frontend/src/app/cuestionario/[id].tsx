import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, ProgressBar } from '@/components/ui';
import { useCuestionario } from '@/hooks/useCuestionario';

export default function CuestionarioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cuestionario, loading, error, responder, resultado, setResultado } = useCuestionario();
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  const preguntas = cuestionario?.preguntas ?? [];
  const pregunta = preguntas[indice];
  const enviada = Boolean(resultado);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#55147C" />
        <Text style={styles.cargando}>Cargando cuestionario...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Volver" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  if (!cuestionario || !pregunta) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No encontramos el cuestionario.</Text>
        <Button title="Volver" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  function handleResponder(opcionId: string) {
    setRespuestas((prev) => ({ ...prev, [pregunta!.id]: opcionId }));
  }

  function handleSiguiente() {
    const nueva = { ...respuestas };
    if (indice < preguntas.length - 1) {
      setIndice(indice + 1);
    } else {
      void enviarCuestionario(nueva);
    }
  }

  async function enviarCuestionario(respuestasFinales: Record<string, string>) {
    setEnviando(true);
    const respuestasArray = preguntas.map((p) => ({
      pregunta_id: p.id,
      opcion_id: respuestasFinales[p.id] ?? '',
    }));
    await responder(String(id), respuestasArray);
    setEnviando(false);
  }

  if (enviada && resultado) {
    const porcentaje = resultado.porcentaje;
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Resultado</Text>
        <Card style={styles.resultCard}>
          <View style={styles.scoreWrap}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{porcentaje}</Text>
              <Text style={styles.scoreLabel}>% correcto</Text>
            </View>
          </View>
          <Text style={styles.resultText}>
            Obtuviste {resultado.puntaje} de {resultado.total} respuestas correctas.
          </Text>
        </Card>
        {resultado.detalle.map((d, i) => (
          <Card key={i} style={styles.questionCard}>
            <Text style={styles.questionText}>{d.enunciado}</Text>
            <Text style={styles.correcto}>Correcta: {String(d.opcion_correcta_id)}</Text>
            {d.explicacion ? <Text style={styles.explicacion}>{d.explicacion}</Text> : null}
          </Card>
        ))}
        <Button title="Reintentar" size="lg" fullWidth onPress={() => { setIndice(0); setRespuestas({}); setResultado(null); }} />
        <View style={{ height: 12 }} />
        <Button title="Volver" variant="outline" size="lg" fullWidth onPress={() => router.back()} />
      </ScrollView>
    );
  }

  const respondida = Boolean(respuestas[pregunta.id]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>{cuestionario.titulo}</Text>
        <Text style={styles.progressCount}>
          {indice + 1} / {preguntas.length}
        </Text>
      </View>
      <ProgressBar value={preguntas.filter((p) => respuestas[p.id]).length} max={preguntas.length} />
      <Card style={styles.questionCard}>
        <Text style={styles.questionText}>{pregunta.enunciado}</Text>
        {pregunta.explicacion ? <Text style={styles.explicacion}>{pregunta.explicacion}</Text> : null}
      </Card>
      <View style={styles.opciones}>
        {pregunta.opciones?.map((o) => (
          <Pressable
            key={o.id}
            onPress={() => handleResponder(o.id)}
            style={({ pressed }) => [
              styles.opcion,
              respuestas[pregunta.id] === o.id ? styles.opcionSelected : null,
              pressed && { opacity: 0.9 },
            ]}>
            <Text style={styles.opcionText}>{o.texto}</Text>
            {respuestas[pregunta.id] === o.id ? <Ionicons name="checkmark" size={18} color="#55147C" /> : null}
          </Pressable>
        ))}
      </View>
      <Button title={indice < preguntas.length - 1 ? 'Siguiente' : 'Finalizar'} onPress={handleSiguiente} disabled={!respondida || enviando} fullWidth size="lg" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  content: { padding: 24, paddingTop: 64, paddingBottom: 40 },
  cargando: { textAlign: 'center', marginTop: 12, fontWeight: '700', color: '#6B5C7C' },
  error: { textAlign: 'center', marginTop: 20, fontWeight: '700', color: '#E5484D' },
  title: { fontSize: 24, fontWeight: '800', color: '#22147C', marginBottom: 16 },
  progressHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  progressTitle: { fontSize: 17, fontWeight: '800', color: '#22147C' },
  progressCount: { fontSize: 13, fontWeight: '800', color: '#55147C' },
  questionCard: { marginTop: 14, alignItems: 'flex-start' },
  questionText: { fontSize: 17, fontWeight: '800', color: '#22147C', lineHeight: 24 },
  explicacion: { fontSize: 13, fontWeight: '600', color: '#6B5C7C', marginTop: 8, lineHeight: 19 },
  opciones: { marginTop: 16, gap: 10 },
  opcion: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1.5, borderColor: '#E7DDF2', padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  opcionSelected: { borderColor: '#55147C', backgroundColor: '#EFE7F8' },
  opcionText: { fontSize: 14, fontWeight: '700', color: '#22147C', flex: 1, paddingRight: 10 },
  resultCard: { alignItems: 'center', paddingVertical: 20 },
  scoreWrap: { alignSelf: 'stretch', alignItems: 'center' },
  scoreCircle: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#55147C', alignItems: 'center', justifyContent: 'center' },
  scoreValue: { color: '#FFFFFF', fontSize: 40, fontWeight: '800' },
  scoreLabel: { color: '#BCA8D0', fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  resultText: { marginTop: 16, fontSize: 14, fontWeight: '700', color: '#22147C', textAlign: 'center' },
  correcto: { marginTop: 8, fontSize: 13, fontWeight: '800', color: '#0E9F66' },
});
