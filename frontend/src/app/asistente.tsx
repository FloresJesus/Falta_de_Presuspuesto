import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, IconBubble } from '@/components/ui';
import { useAsistente } from '@/hooks/useAsistente';
import { formatearFecha } from '@/lib/utils';
import { Palette, Radius, Shadows } from '@/constants/theme';
import type { ScrollViewInstance } from 'react-native';

const SUGERENCIAS = ['¿Qué hago si estoy en peligro?', '¿Cómo comparto mi ubicación?', '¿Dónde denuncio?', '¿Qué derechos tengo?'];

export default function AsistenteScreen() {
  const { mensajes, enviando, error, enviar } = useAsistente();
  const [texto, setTexto] = useState('');
  const scrollRef = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [mensajes.length, enviando]);

  async function handleSend(textoMensaje: string) {
    const t = textoMensaje.trim();
    if (!t) return;
    await enviar(t);
    setTexto('');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={Palette.purple} />
          </Pressable>
          <Avatar name="LÍA" size={42} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Asistente LÍA</Text>
            <Text style={styles.subtitle}>Orientación personalizada, siempre disponible.</Text>
          </View>
          <View style={styles.onlineDot} />
        </View>

        <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {mensajes.length === 0 ? (
            <View style={styles.emptyBox}>
              <IconBubble size={68} background={Palette.purpleSoft}>
                <Ionicons name="sparkles" size={30} color={Palette.purple} />
              </IconBubble>
              <Text style={styles.emptyTitle}>Hola, soy LÍA</Text>
              <Text style={styles.emptyText}>
                Estoy aquí para orientarte sobre señales, ubicación, denuncias y autocuidado.
              </Text>
              <View style={styles.sugerencias}>
                {SUGERENCIAS.map((s) => (
                  <Pressable key={s} onPress={() => void handleSend(s)} style={({ pressed }) => [styles.sugerenciaChip, pressed && { opacity: 0.85 }]}>
                    <Text style={styles.sugerenciaText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            mensajes.map((m) => (
              <View key={m.id} style={[styles.bubbleRow, m.autor === 'usuaria' && styles.bubbleRowUser]}>
                {m.autor !== 'usuaria' ? (
                  <View style={styles.smallAvatar}>
                    <Ionicons name="sparkles" size={14} color={Palette.purple} />
                  </View>
                ) : null}
                <View style={{ maxWidth: '80%' }}>
                  <View style={[styles.bubble, m.autor === 'usuaria' && styles.bubbleUser]}>
                    <Text style={[styles.bubbleText, m.autor === 'usuaria' && styles.bubbleTextUser]}>{m.contenido}</Text>
                  </View>
                  <Text style={[styles.bubbleTime, m.autor === 'usuaria' && { textAlign: 'right' }]}>
                    {formatearFecha(m.creada_en, false)}
                  </Text>
                </View>
              </View>
            ))
          )}
          {enviando ? (
            <View style={styles.bubbleRow}>
              <View style={styles.smallAvatar}>
                <Ionicons name="sparkles" size={14} color={Palette.purple} />
              </View>
              <View style={[styles.bubble, styles.bubbleTyping]}>
                <ActivityIndicator size="small" color={Palette.purple} />
              </View>
            </View>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            placeholder="Escribe tu consulta..."
            placeholderTextColor="#9A8BA8"
            value={texto}
            onChangeText={setTexto}
            style={styles.input}
            multiline
          />
          <Pressable onPress={() => void handleSend(texto)} style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}>
            <Ionicons name="paper-plane" size={20} color={Palette.surface} />
          </Pressable>
        </View>

        <View style={{ height: 10 }} />
        <Button title="Salir" variant="ghost" size="sm" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.card ?? {}),
  },
  title: { fontSize: 18, fontWeight: '800', color: Palette.ink },
  subtitle: { fontSize: 11, fontWeight: '600', color: Palette.muted },
  onlineDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Palette.success },
  scroll: { flex: 1 },
  content: { paddingTop: 10, paddingBottom: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16 },
  emptyTitle: { fontSize: 19, fontWeight: '800', color: Palette.ink, marginTop: 12 },
  emptyText: { fontSize: 13, fontWeight: '600', color: Palette.muted, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  sugerencias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18, justifyContent: 'center' },
  sugerenciaChip: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 13,
    paddingVertical: 9,
    ...(Shadows.card ?? {}),
  },
  sugerenciaText: { fontSize: 12, fontWeight: '700', color: Palette.purple },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  bubbleRowUser: { justifyContent: 'flex-end' },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: Palette.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    backgroundColor: Palette.surface,
    borderRadius: 18,
    borderTopLeftRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    ...(Shadows.card ?? {}),
  },
  bubbleUser: { backgroundColor: Palette.purple, borderColor: Palette.purple, borderTopLeftRadius: 18, borderTopRightRadius: 6 },
  bubbleTyping: { padding: 14 },
  bubbleText: { fontSize: 14, fontWeight: '600', color: Palette.ink, lineHeight: 20 },
  bubbleTextUser: { color: Palette.surface },
  bubbleTime: { fontSize: 10, fontWeight: '700', color: Palette.muted, marginTop: 3, marginHorizontal: 4 },
  error: { color: Palette.danger, fontWeight: '700', fontSize: 12, marginTop: 8 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingTop: 8 },
  input: {
    flex: 1,
    maxHeight: 110,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Palette.ink,
    ...(Shadows.card ?? {}),
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Palette.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
