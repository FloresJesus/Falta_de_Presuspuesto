import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Circle } from 'react-native-svg';

import { Button } from '@/components/ui';
import { useSos } from '@/context/SosContext';
import { Gradients, Palette, Radius, Shadows } from '@/constants/theme';

const TOTAL = 10;
const RADIO = 88;
const CIRC = 2 * Math.PI * RADIO;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SosScreen() {
  const { estado: sos, enviarSos, cancelarSos } = useSos();
  const { auto } = useLocalSearchParams<{ auto?: string }>();
  const [fase, setFase] = useState<'idle' | 'contando' | 'enviando' | 'enviada'>(sos.activo ? 'enviada' : 'idle');
  const [segundos, setSegundos] = useState(TOTAL);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoEnviado = useRef(false);
  const progreso = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(progreso, {
      toValue: CIRC * (1 - segundos / TOTAL),
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [segundos, progreso]);

  function iniciarCuenta() {
    if (fase === 'contando' || fase === 'enviando') return;
    setError(null);
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
  }

  function cancelarCuenta() {
    if (timerRef.current) clearInterval(timerRef.current);
    setFase('idle');
    setSegundos(TOTAL);
  }

  async function enviar() {
    setFase('enviando');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const res = await enviarSos();
    if (res.error) {
      setError(res.error);
      setFase('idle');
      return;
    }
    setFase('enviada');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  useEffect(() => {
    if (segundos === 0 && fase === 'contando') {
      if (timerRef.current) clearInterval(timerRef.current);
      void Promise.resolve().then(() => enviar());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segundos]);

  useEffect(() => {
    if (auto === '1' && !autoEnviado.current && !sos.activo) {
      autoEnviado.current = true;
      void enviar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  return (
    <LinearGradient colors={Gradients.hero} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.root}>
      <View style={styles.glow} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
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
              <Pressable onPress={iniciarCuenta} style={({ pressed }) => [styles.sosCircle, pressed && { transform: [{ scale: 0.98 }] }]}>
                <LinearGradient colors={Gradients.accent} style={StyleSheet.absoluteFill} />
                <Svg width={196} height={196} style={StyleSheet.absoluteFill}>
                  <Circle cx={98} cy={98} r={RADIO} stroke="rgba(255,255,255,0.25)" strokeWidth={6} fill="none" />
                  <AnimatedCircle
                    cx={98}
                    cy={98}
                    r={RADIO}
                    stroke={Palette.surface}
                    strokeWidth={6}
                    fill="none"
                    strokeDasharray={`${CIRC} ${CIRC}`}
                    strokeDashoffset={progreso}
                    strokeLinecap="round"
                    transform="rotate(-90 98 98)"
                  />
                </Svg>
                {fase === 'contando' ? (
                  <View style={styles.countdownText}>
                    <Text style={styles.countValue}>{segundos}</Text>
                    <Text style={styles.countUnit}>s</Text>
                  </View>
                ) : (
                  <Ionicons name="warning" size={104} color={Palette.surface} />
                )}
              </Pressable>
            </View>

            <Text style={styles.title}>Alerta SOS</Text>
            <Text style={styles.subtitle}>Tu señal de emergencia será enviada a tu contacto principal.</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.bottom}>
              <Pressable onPress={fase === 'contando' ? cancelarCuenta : () => router.back()} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>{fase === 'contando' ? 'Cancelar cuenta' : 'Cancelar'}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {fase === 'enviada' ? (
          <View style={styles.sentBox}>
            <View style={styles.sentIcon}>
              <Ionicons name="checkmark" size={48} color={Palette.surface} />
            </View>
            <Text style={styles.sentTitle}>Alerta SOS enviada</Text>
            <Text style={styles.sentText}>Tu contacto principal ya puede ver tu ubicación en vivo.</Text>
            {sos.token ? (
              <Pressable
                onPress={() => router.push({ pathname: '/seguimiento/[token]', params: { token: sos.token as string } })}
                style={styles.tokenBtn}>
                <Ionicons name="location-outline" size={18} color={Palette.purple} />
                <Text style={styles.tokenText}>Ver enlace de seguimiento</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => void cancelarSos().then(() => router.back())} style={styles.cancelarSosLink}>
              <Text style={styles.cancelarSosText}>Cancelar SOS y dejar de compartir</Text>
            </Pressable>
            <View style={styles.bottom}>
              <Button title="Listo" onPress={() => router.back()} fullWidth size="lg" />
            </View>
          </View>
        ) : null}
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
  countdownText: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  countValue: { color: Palette.surface, fontSize: 64, fontWeight: '800', lineHeight: 68 },
  countUnit: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '800', marginTop: -2 },
  error: { color: '#FFB3C6', fontWeight: '700', marginTop: 6, textAlign: 'center' },
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
  sentText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },
  tokenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 18,
  },
  tokenText: { color: Palette.purple, fontSize: 14, fontWeight: '800' },
  cancelarSosLink: { marginTop: 16, paddingVertical: 8 },
  cancelarSosText: { color: '#FFB3C6', fontSize: 13, fontWeight: '800', textAlign: 'center' },
});
