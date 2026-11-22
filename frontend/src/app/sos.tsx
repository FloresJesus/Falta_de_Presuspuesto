import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Circle } from 'react-native-svg';

import { Button } from '@/components/ui';
import { useAlertas } from '@/hooks/useAlertas';
import { useUbicacion } from '@/hooks/useUbicacion';
import { Gradients, Palette, Radius, Shadows } from '@/constants/theme';

const TOTAL = 10;
const RADIO = 54;
const CIRC = 2 * Math.PI * RADIO;

export default function SosScreen() {
  const { location } = useUbicacion();
  const { enviar, error: errorEnviar } = useAlertas();
  const [fase, setFase] = useState<'idle' | 'contando' | 'enviando' | 'enviada'>('idle');
  const [segundos, setSegundos] = useState(TOTAL);
  const [resultado, setResultado] = useState<{ mensaje?: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const iniciarCuentaRegresiva = () => {
    if (fase === 'contando' || fase === 'enviando') return;
    setFase('contando');
    setSegundos(TOTAL);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    setResultado({ mensaje: 'Alerta SOS enviada' });
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
    setSegundos(TOTAL);
  };

  const contando = fase === 'contando';

  return (
    <LinearGradient colors={Gradients.hero} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.root}>
      <View style={styles.glow} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color={Palette.surface} />
          </Pressable>
        </View>

        {fase !== 'enviada' ? (
          <View style={styles.content}>
            <View style={styles.rings}>
              <View style={styles.ringOuter} />
              <View style={styles.ringMiddle} />
              <Pressable onPress={iniciarCuentaRegresiva} style={({ pressed }) => [styles.sosCircle, pressed && { transform: [{ scale: 0.98 }] }]}>
                <LinearGradient colors={Gradients.accent} style={StyleSheet.absoluteFill} />
                <Ionicons name="warning" size={104} color={Palette.surface} />
              </Pressable>
            </View>

            <Text style={styles.title}>Alerta SOS</Text>
            <Text style={styles.subtitle}>
              Tu señal de emergencia será enviada a tus contactos de confianza
            </Text>

            <View style={styles.countdown}>
              <Svg width={132} height={132}>
                <Circle cx={66} cy={66} r={RADIO} stroke="rgba(255,255,255,0.22)" strokeWidth={7} fill="none" />
                <Circle
                  cx={66}
                  cy={66}
                  r={RADIO}
                  stroke={Palette.pink}
                  strokeWidth={7}
                  fill="none"
                  strokeDasharray={`${CIRC} ${CIRC}`}
                  strokeDashoffset={fase === 'idle' ? CIRC * 0.08 : CIRC * (1 - segundos / TOTAL)}
                  strokeLinecap="round"
                  transform="rotate(-90 66 66)"
                />
              </Svg>
              <View style={styles.countdownText}>
                <Text style={styles.countValue}>{segundos}</Text>
                <Text style={styles.countUnit}>s</Text>
              </View>
            </View>

            {errorEnviar ? <Text style={styles.error}>{errorEnviar}</Text> : null}

            <View style={styles.bottom}>
              <Pressable
                onPress={contando ? cancelar : () => router.back()}
                style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.9 }]}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.sentBox}>
            <View style={styles.sentIcon}>
              <Ionicons name="checkmark" size={48} color={Palette.surface} />
            </View>
            <Text style={styles.sentTitle}>Alerta SOS enviada</Text>
            <Text style={styles.sentText}>
              Hemos registrado tu alerta. Tu contacto de confianza será notificado y podrá iniciar el acompañamiento.
            </Text>
            <Text style={styles.sentMeta}>{resultado?.mensaje ?? 'Alerta SOS de prueba enviada desde LÍA'}</Text>
            <View style={styles.bottom}>
              <Button title="Listo" onPress={() => router.back()} fullWidth size="lg" />
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  glow: {
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: 'rgba(242,41,105,0.10)',
  },
  safe: { flex: 1, paddingHorizontal: 24 },
  topBar: { paddingTop: 6 },
  backBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  content: { flex: 1, alignItems: 'center', paddingTop: 8 },
  rings: { alignItems: 'center', justifyContent: 'center', width: 340, height: 340 },
  ringOuter: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(242,41,105,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(242,41,105,0.18)',
  },
  ringMiddle: {
    position: 'absolute',
    width: 268,
    height: 268,
    borderRadius: 134,
    backgroundColor: 'rgba(242,41,105,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(242,41,105,0.28)',
  },
  sosCircle: {
    width: 196,
    height: 196,
    borderRadius: 98,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(Shadows.floating ?? {}),
  },
  title: { color: Palette.surface, fontSize: 30, fontWeight: '800', textAlign: 'center', marginTop: 6, letterSpacing: -0.4 },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 23,
    maxWidth: 330,
  },
  countdown: { width: 132, height: 132, alignItems: 'center', justifyContent: 'center', marginTop: 28 },
  countdownText: { position: 'absolute', alignItems: 'center' },
  countValue: { color: Palette.surface, fontSize: 42, fontWeight: '800', lineHeight: 46 },
  countUnit: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '800', marginTop: -2 },
  error: { color: '#FFB3C6', fontWeight: '700', marginTop: 10, textAlign: 'center' },
  bottom: { alignSelf: 'stretch', marginTop: 'auto', paddingBottom: 12 },
  cancelBtn: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.pill,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.card ?? {}),
  },
  cancelText: { color: Palette.pink, fontSize: 18, fontWeight: '800' },
  sentBox: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  sentIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Palette.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.floating ?? {}),
  },
  sentTitle: { color: Palette.surface, fontSize: 28, fontWeight: '800', marginTop: 18 },
  sentText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600', textAlign: 'center', marginTop: 10, lineHeight: 21 },
  sentMeta: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 12 },
});
