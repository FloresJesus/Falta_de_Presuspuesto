import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, IconBubble, StatusPill } from '@/components/ui';
import { MapCanvas } from '@/components/MapCanvas';
import { supabase } from '@/lib/supabase';
import { EMERGENCIA_NUMERO, formatearFecha } from '@/lib/utils';
import { Palette, Radius } from '@/constants/theme';

interface UbicacionPublica {
  valida: boolean;
  nombre_usuaria?: string | null;
  estado?: string;
  compartir_ubicacion?: boolean;
  destino?: string | null;
  iniciada_en?: string;
  finalizada_en?: string;
  ubicacion?: { latitud: number; longitud: number; precision_m?: number | null; registrada_en: string } | null;
}

export default function SeguimientoScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [data, setData] = useState<UbicacionPublica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function cargar() {
      const { data: res, error: err } = await supabase.rpc('ubicacion_publica', { p_token: token });
      if (!mounted) return;
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      const d = (res ?? null) as UbicacionPublica | null;
      setData(d);
      setLoading(false);
    }
    void cargar();
    return () => {
      mounted = false;
    };
  }, [token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Palette.purple} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <IconBubble size={64} background={Palette.pinkSoft}>
          <Ionicons name="link-outline" size={28} color={Palette.pink} />
        </IconBubble>
        <Text style={styles.title}>Enlace no válido</Text>
        <Text style={styles.body}>No pudimos encontrar el acompañamiento solicitado.</Text>
      </View>
    );
  }

  if (!data.valida) {
    return (
      <View style={styles.center}>
        <IconBubble size={64} background={Palette.pinkSoft}>
          <Ionicons name="time-outline" size={28} color={Palette.pink} />
        </IconBubble>
        <Text style={styles.title}>Enlace no válido</Text>
        <Text style={styles.body}>Este enlace de seguimiento ya no está activo.</Text>
        <Button title="Cerrar" variant="outline" size="lg" fullWidth onPress={() => router.back()} />
      </View>
    );
  }

  const compartiendo = data.estado === 'activa' && Boolean(data.compartir_ubicacion) && data.ubicacion != null;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <IconBubble size={46} background={Palette.purpleSoft}>
          <Ionicons name="shield-checkmark" size={22} color={Palette.purple} />
        </IconBubble>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Acompañamiento</Text>
          <Text style={styles.subtitle}>de {data.nombre_usuaria ?? 'una usuaria'}</Text>
        </View>
        <StatusPill label={compartiendo ? 'En línea' : 'Inactivo'} tone={compartiendo ? 'on' : 'off'} />
      </View>

      <Text style={styles.intro}>Esta persona compartió su ubicación contigo.</Text>

      {compartiendo ? (
        <>
          <View style={styles.mapWrap}>
            <MapCanvas latitude={data.ubicacion?.latitud ?? null} longitude={data.ubicacion?.longitud ?? null} status="sharing" />
          </View>
          <Card style={styles.card}>
            <Text style={styles.metaLabel}>Última ubicación</Text>
            <Text style={styles.body}>
              Lat: {(data.ubicacion?.latitud ?? 0).toFixed(4)} · Lng: {(data.ubicacion?.longitud ?? 0).toFixed(4)}
            </Text>
            <Text style={styles.body}>Registrada: {formatearFecha(data.ubicacion?.registrada_en)}</Text>
          </Card>
        </>
      ) : (
        <Card style={styles.card}>
          <View style={styles.waitRow}>
            <Ionicons name="time-outline" size={18} color={Palette.purple} />
            <Text style={styles.body}>La usuaria aún no ha compartido su ubicación en esta sesión.</Text>
          </View>
        </Card>
      )}

      {data.destino ? (
        <Card style={styles.card}>
          <Text style={styles.metaLabel}>Destino</Text>
          <Text style={styles.body}>{data.destino}</Text>
        </Card>
      ) : null}

      <Card style={[styles.card, styles.emergencyCard]}>
        <Ionicons name="call" size={18} color={Palette.danger} />
        <Text style={styles.emergencyText}>
          Si esta situación es grave, contacta a emergencias al <Text style={styles.bold}>{EMERGENCIA_NUMERO}</Text>.
        </Text>
      </Card>

      <Button title="Cerrar" variant="outline" size="lg" fullWidth onPress={() => router.back()} />
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  title: { fontSize: 21, fontWeight: '800', color: Palette.ink, letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  intro: { fontSize: 13, fontWeight: '600', color: Palette.muted, marginBottom: 12 },
  mapWrap: { height: 340, borderRadius: Radius.xxl, overflow: 'hidden', borderWidth: 1, borderColor: Palette.border },
  card: { marginTop: 12 },
  metaLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: Palette.purple, marginBottom: 6 },
  body: { fontSize: 13, fontWeight: '600', color: Palette.ink, lineHeight: 19 },
  bold: { fontWeight: '800' },
  waitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emergencyCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Palette.dangerSoft, borderWidth: 0 },
  emergencyText: { color: '#8A3A40', fontSize: 12, fontWeight: '600', flex: 1, lineHeight: 18 },
});
