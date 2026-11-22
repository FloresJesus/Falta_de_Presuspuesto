import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { useAlertasRecibidas } from '@/hooks/useAlertasRecibidas';
import { supabase } from '@/lib/supabase';
import { formatearFecha } from '@/lib/utils';
import { Gradients, Palette } from '@/constants/theme';

type AlertaDetalle = {
  id: string;
  nombre_usuaria: string;
  telefono_usuaria: string | null;
  latitud: number | null;
  longitud: number | null;
  mensaje: string;
  creada_en: string;
  token_seguimiento: string | null;
};

export default function AlertaSosRecibidaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { descartar } = useAlertasRecibidas();
  const [alerta, setAlerta] = useState<AlertaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descartando, setDescartando] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const { data, error: err } = await supabase.rpc('alerta_sos_recibida', { p_id: id });
      if (!mounted) return;
      if (err) setError(err.message);
      else setAlerta(((data ?? []) as AlertaDetalle[])[0] ?? null);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function descartarAlerta() {
    setDescartando(true);
    setError(null);
    const res = await descartar(id);
    setDescartando(false);
    if (res.error) setError(res.error);
    else router.back();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Palette.purple} />
      </View>
    );
  }

  if (error || !alerta) {
    return (
      <LinearGradient colors={Gradients.hero} style={styles.center}>
        <Ionicons name="warning-outline" size={56} color={Palette.surface} />
        <Text style={styles.errorTitle}>No pudimos abrir la alerta</Text>
        <Text style={styles.errorText}>{error ?? 'La alerta ya no está disponible.'}</Text>
        <Button title="Volver" variant="light" onPress={() => router.back()} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Gradients.hero} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.root}>
      <View style={styles.glow} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color={Palette.surface} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.rings}>
            <View style={styles.ringOuter} />
            <View style={styles.ringMiddle} />
            <View style={styles.sosCircle}>
              <Ionicons name="warning" size={96} color={Palette.surface} />
            </View>
          </View>

          <Text style={styles.kicker}>ALERTA SOS RECIBIDA</Text>
          <Text style={styles.title}>{alerta.nombre_usuaria}</Text>
          <Text style={styles.subtitle}>{alerta.mensaje}</Text>
          <Text style={styles.date}>{formatearFecha(alerta.creada_en)}</Text>

          {alerta.latitud != null && alerta.longitud != null ? (
            <View style={styles.coords}>
              <Ionicons name="location-outline" size={16} color={Palette.surface} />
              <Text style={styles.coordsText}>
                Lat {alerta.latitud.toFixed(4)} · Lng {alerta.longitud.toFixed(4)}
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            {alerta.token_seguimiento ? (
              <Button
                title="Ver ubicación en vivo"
                variant="light"
                fullWidth
                onPress={() =>
                  router.push({
                    pathname: '/seguimiento/[token]',
                    params: { token: alerta.token_seguimiento as string },
                  })
                }
              />
            ) : null}
            {alerta.telefono_usuaria ? (
              <Button
                title="Llamar"
                variant="light"
                fullWidth
                onPress={() => void Linking.openURL(`tel:${alerta.telefono_usuaria}`)}
              />
            ) : null}
            <Button
              title="Ya la atendí / Descartar alerta"
              variant="light"
              fullWidth
              loading={descartando}
              onPress={() => void descartarAlerta()}
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
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
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
  rings: { alignItems: 'center', justifyContent: 'center', width: 300, height: 300 },
  ringOuter: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(242,41,105,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(242,41,105,0.18)',
  },
  ringMiddle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(242,41,105,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(242,41,105,0.28)',
  },
  sosCircle: {
    width: 176,
    height: 176,
    borderRadius: 88,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242,41,105,0.95)',
  },
  kicker: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 8 },
  title: { color: Palette.surface, fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 6 },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  date: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '600', marginTop: 8 },
  coords: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  coordsText: { color: Palette.surface, fontSize: 13, fontWeight: '700' },
  actions: { alignSelf: 'stretch', gap: 10, marginTop: 28 },
  errorTitle: { color: Palette.surface, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  errorText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  error: { color: '#FFB3C6', fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 8 },
});
