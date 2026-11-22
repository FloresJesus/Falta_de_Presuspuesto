import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Button, Card, ProgressBar } from '@/components/ui';
import { useCuestionario } from '@/hooks/useCuestionario';
import { Gradients, Palette, Radius, Shadows } from '@/constants/theme';

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Palette.purple} />
        <Text style={styles.cargando}>Cargando cuestionario...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Volver" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  if (!cuestionario || !pregunta) {
    return (
      <View style={styles.center}>
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
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultTitle}>Resultado</Text>
        <Card style={styles.resultCard}>
          <LinearGradient colors={Gradients.primary} style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{porcentaje}</Text>
            <Text style={styles.scoreLabel}>% correcto</Text>
          </LinearGradient>
          <Text style={styles.resultText}>
            Obtuviste {resultado.puntaje} de {resultado.total} respuestas correctas.
          </Text>
          <View style={styles.resultBadge}>
            <Ionicons name={porcentaje >= 70 ? 'trophy' : 'heart'} size={16} color={porcentaje >= 70 ? Palette.success : Palette.pink} />
            <Text style={styles.resultBadgeText}>
              {porcentaje >= 70 ? '¡Muy bien! Sigue aprendiendo.' : 'Cada paso cuenta. Puedes intentarlo de nuevo.'}
            </Text>
          </View>
        </Card>

        {resultado.detalle.map((d, i) => (
          <Card key={i} style={styles.questionCard}>
            <Text style={styles.questionText}>{d.enunciado}</Text>
            <Text style={styles.correcto}>Correcta: {String(d.opcion_correcta_id)}</Text>
            {d.explicacion ? <Text style={styles.explicacion}>{d.explicacion}</Text> : null}
          </Card>
        ))}

        <Button
          title="Reintentar"
          size="lg"
          fullWidth
          onPress={() => {
            setIndice(0);
            setRespuestas({});
            setResultado(null);
          }}
        />
        <View style={{ height: 12 }} />
        <Button title="Volver" variant="outline" size="lg" fullWidth onPress={() => router.back()} />
      </ScrollView>
    );
  }

  const respondida = Boolean(respuestas[pregunta.id]);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={20} color={Palette.purple} />
        </Pressable>
        <Text style={styles.progressCount}>
          {indice + 1} / {preguntas.length}
        </Text>
      </View>

      <Text style={styles.progressTitle}>{cuestionario.titulo}</Text>
      <View style={{ marginTop: 10, marginBottom: 18 }}>
        <ProgressBar value={preguntas.filter((p) => respuestas[p.id]).length} max={preguntas.length} />
      </View>

      <Card style={styles.questionCard}>
        <Text style={styles.questionText}>{pregunta.enunciado}</Text>
        {pregunta.explicacion ? <Text style={styles.explicacion}>{pregunta.explicacion}</Text> : null}
      </Card>

      <View style={styles.opciones}>
        {pregunta.opciones?.map((o, idx) => {
          const selected = respuestas[pregunta.id] === o.id;
          return (
            <Pressable
              key={o.id}
              onPress={() => handleResponder(o.id)}
              style={({ pressed }) => [styles.opcion, selected && styles.opcionSelected, pressed && { opacity: 0.9 }]}>
              <View style={[styles.opcionLetter, selected && styles.opcionLetterSelected]}>
                <Text style={[styles.opcionLetterText, selected && { color: Palette.surface }]}>
                  {String.fromCharCode(65 + idx)}
                </Text>
              </View>
              <Text style={styles.opcionText}>{o.texto}</Text>
              {selected ? <Ionicons name="checkmark-circle" size={20} color={Palette.purple} /> : null}
            </Pressable>
          );
        })}
      </View>

      <Button
        title={indice < preguntas.length - 1 ? 'Siguiente' : 'Finalizar'}
        onPress={handleSiguiente}
        disabled={!respondida || enviando}
        fullWidth
        size="lg"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Palette.background, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  center: { flex: 1, backgroundColor: Palette.background, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  cargando: { textAlign: 'center', marginTop: 4, fontWeight: '700', color: Palette.muted },
  error: { textAlign: 'center', marginTop: 20, fontWeight: '700', color: Palette.danger },
  title: { fontSize: 22, fontWeight: '800', color: Palette.ink, marginBottom: 8 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: Palette.ink, marginBottom: 16 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
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
  progressCount: { fontSize: 13, fontWeight: '800', color: Palette.purple },
  progressTitle: { fontSize: 19, fontWeight: '800', color: Palette.ink, letterSpacing: -0.3 },
  questionCard: { alignItems: 'flex-start' },
  questionText: { fontSize: 17, fontWeight: '800', color: Palette.ink, lineHeight: 25 },
  explicacion: { fontSize: 13, fontWeight: '600', color: Palette.muted, marginTop: 8, lineHeight: 19 },
  opciones: { marginTop: 16, gap: 10, marginBottom: 18 },
  opcion: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...(Shadows.card ?? {}),
  },
  opcionSelected: { borderColor: Palette.purple, backgroundColor: Palette.purpleSoft },
  opcionLetter: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcionLetterSelected: { backgroundColor: Palette.purple, borderColor: Palette.purple },
  opcionLetterText: { fontSize: 12, fontWeight: '800', color: Palette.muted },
  opcionText: { fontSize: 14, fontWeight: '700', color: Palette.ink, flex: 1 },
  resultCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.floating ?? {}),
  },
  scoreValue: { color: Palette.surface, fontSize: 44, fontWeight: '800' },
  scoreLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  resultText: { marginTop: 16, fontSize: 14, fontWeight: '700', color: Palette.ink, textAlign: 'center' },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.purpleSoft,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 12,
  },
  resultBadgeText: { color: Palette.purple, fontSize: 11, fontWeight: '700' },
  correcto: { marginTop: 8, fontSize: 13, fontWeight: '800', color: Palette.success },
});
