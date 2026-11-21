import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button } from '@/components/ui';
import { useAlertas } from '@/hooks/useAlertas';
import { useUbicacion } from '@/hooks/useUbicacion';

export default function SosScreen() {
  const { location } = useUbicacion();
  const { enviar, error: errorEnviar } = useAlertas();
  const [fase, setFase] = useState<'idle' | 'contando' | 'enviando' | 'enviada'>('idle');
  const [segundos, setSegundos] = useState(10);
  const [resultado, setResultado] = useState<{ mensaje?: string; contacto?: { nombre?: string; telefono?: string } | null } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const iniciarCuentaRegresiva = () => {
    setFase('contando');
    setSegundos(10);
    timerRef.current = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  async function enviarAlerta() {
    setFase('enviando');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const res = await enviar(location?.latitude ?? null, location?.longitude ?? null, null, 'Alerta SOS desde la app');
    if (res.error) {
      setFase('idle');
      return;
    }
    setResultado({ mensaje: 'Alerta SOS enviada', contacto: null });
    setFase('enviada');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  useEffect(() => {
    if (segundos === 0 && fase === 'contando') {
      if (timerRef.current) clearInterval(timerRef.current);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void enviarAlerta();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segundos]);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const cancelar = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFase('idle');
    setSegundos(10);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {fase !== 'enviada' ? (
          <>
            <Text style={styles.titulo}>¿Estás en peligro?</Text>
            <Text style={styles.subtitulo}>
              {fase === 'idle'
                ? 'Si necesitas ayuda urgente, activa el SOS. En este MVP se registra una alerta simulada con tu contacto de confianza.'
                : fase === 'contando'
                  ? 'Podemos ayudarte en segundos.'
                  : 'Enviando alerta...'}
            </Text>

            <Pressable
              onPress={() => {
                if (fase === 'idle') iniciarCuentaRegresiva();
                else cancelar();
              }}
              disabled={fase === 'enviando'}
              style={({ pressed }) => [styles.sosButton, pressed && { transform: [{ scale: 0.96 }] }]}>
              <View style={styles.sosInner}>
                <Ionicons name="warning" size={44} color="#FFFFFF" />
                <Text style={styles.sosText}>{fase === 'idle' ? 'SOS' : `${segundos}`}</Text>
              </View>
            </Pressable>

            <Text style={styles.hint}>
              {fase === 'idle' ? 'Mantén presionado. Tendremos 10 segundos para activar la alerta.' : fase === 'contando' ? 'Cancelar si ya no lo necesitas.' : 'Conectando con el protocolo de ayuda...'}
            </Text>

            {fase === 'idle' ? (
              <Button title="Cancelar" variant="ghost" onPress={cancelar} />
            ) : null}

            {errorEnviar ? <Text style={styles.error}>{errorEnviar}</Text> : null}
          </>
        ) : (
          <View style={styles.sentBox}>
            <View style={styles.sentIcon}>
              <Ionicons name="checkmark" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.sentTitulo}>Alerta SOS enviada</Text>
            <Text style={styles.sentText}>
              Hemos registrado tu alerta. Tu contacto de confianza será notificado y el equipo de apoyo podrá iniciar el acompañamiento.
            </Text>
            <Text style={styles.sentText}>Mensaje: {resultado?.mensaje ?? 'Alerta SOS de prueba enviada desde LÍA'}</Text>
            <Button title="Listo" onPress={() => router.back()} fullWidth size="lg" />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#22147C' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 60 },
  titulo: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', textAlign: 'center' },
  subtitulo: { color: '#BCA8D0', fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 10, marginBottom: 34 },
  sosButton: { width: 190, height: 190, borderRadius: 95, backgroundColor: '#55147C', alignItems: 'center', justifyContent: 'center', shadowColor: '#55147C', shadowOpacity: 0.5, shadowRadius: 30, shadowOffset: { width: 0, height: 16 }, elevation: 10 },
  sosInner: { alignItems: 'center', justifyContent: 'center' },
  sosText: { color: '#FFFFFF', fontSize: 44, fontWeight: '800' },
  hint: { color: '#BCA8D0', fontSize: 12, fontWeight: '700', marginTop: 18, textAlign: 'center' },
  error: { color: '#F2717A', fontWeight: '700', marginTop: 12, textAlign: 'center' },
  sentBox: { alignItems: 'center', marginTop: 20 },
  sentIcon: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#0E9F66', alignItems: 'center', justifyContent: 'center' },
  sentTitulo: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 16 },
  sentText: { color: '#BCA8D0', fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 8 },
});
