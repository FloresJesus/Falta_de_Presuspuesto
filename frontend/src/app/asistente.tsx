import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Avatar, Button } from '@/components/ui';
import { useAsistente } from '@/hooks/useAsistente';
import { formatearFecha } from '@/lib/utils';
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
    const res = await enviar(t);
    if (res.error) {
      // noop
    }
    setTexto('');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar name="LÍA" size={42} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Asistente LÍA</Text>
          <Text style={styles.subtitle}>Orientación personalizada, siempre disponible.</Text>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content}>
        {mensajes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="sparkles" size={30} color="#55147C" />
            <Text style={styles.emptyTitle}>Hola, soy LÍA</Text>
            <Text style={styles.emptyText}>Estoy aquí para orientarte sobre señales, ubicación, denuncias y autocuidado.</Text>
            <View style={styles.sugerencias}>
              {SUGERENCIAS.map((s) => (
                <Pressable key={s} onPress={() => void handleSend(s)} style={styles.sugerenciaChip}>
                  <Text style={styles.sugerenciaText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          mensajes.map((m) => (
            <View key={m.id} style={[styles.bubbleRow, m.autor === 'usuaria' && styles.bubbleRowUser]}>
              <View style={[styles.bubble, m.autor === 'usuaria' && styles.bubbleUser]}>
                <Text style={[styles.bubbleText, m.autor === 'usuaria' && styles.bubbleTextUser]}>{m.contenido}</Text>
              </View>
              <Text style={styles.bubbleTime}>{formatearFecha(m.creada_en, false)}</Text>
            </View>
          ))
        )}
        {enviando ? (
          <View style={styles.bubbleRow}>
            <View style={[styles.bubble, styles.bubbleTyping]}>
              <ActivityIndicator size="small" color="#55147C" />
            </View>
          </View>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput placeholder="Escribe tu consulta..." value={texto} onChangeText={setTexto} style={styles.input} />
        <Pressable onPress={() => void handleSend(texto)} style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.85 }]}>
          <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
      <Button title="Salir" variant="ghost" size="sm" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 90 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '800', color: '#22147C' },
  subtitle: { fontSize: 12, fontWeight: '600', color: '#6B5C7C' },
  scroll: { flex: 1 },
  content: { paddingTop: 8, paddingBottom: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#22147C', marginTop: 10 },
  emptyText: { fontSize: 13, fontWeight: '600', color: '#6B5C7C', textAlign: 'center', marginTop: 6 },
  sugerencias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' },
  sugerenciaChip: { backgroundColor: '#FFFFFF', borderRadius: 999, borderWidth: 1, borderColor: '#E7DDF2', paddingHorizontal: 12, paddingVertical: 8 },
  sugerenciaText: { fontSize: 12, fontWeight: '700', color: '#55147C' },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', backgroundColor: '#FFFFFF', borderRadius: 16, borderTopLeftRadius: 6, padding: 12, borderWidth: 1, borderColor: '#E7DDF2' },
  bubbleUser: { backgroundColor: '#55147C', borderColor: '#55147C' },
  bubbleTyping: { padding: 14 },
  bubbleText: { fontSize: 14, fontWeight: '600', color: '#22147C', lineHeight: 20 },
  bubbleTextUser: { color: '#FFFFFF' },
  bubbleTime: { fontSize: 10, fontWeight: '700', color: '#6B5C7C', marginBottom: 2 },
  error: { color: '#E5484D', fontWeight: '700', fontSize: 12, marginTop: 8 },
  inputBar: { position: 'absolute', bottom: 76, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7DDF2', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#22147C' },
  sendBtn: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#55147C', alignItems: 'center', justifyContent: 'center' },
});
