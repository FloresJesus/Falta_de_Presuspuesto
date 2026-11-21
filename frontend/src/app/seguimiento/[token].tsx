import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card } from '@/components/ui';
import { MapCanvas } from '@/components/MapCanvas';
import { supabase } from '@/lib/supabase';
import { EMERGENCIA_NUMERO, formatearFecha } from '@/lib/utils';

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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#55147C" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Enlace no válido</Text>
        <Text style={styles.body}>No pudimos encontrar el acompañamiento solicitado.</Text>
      </View>
    );
  }

  if (!data.valida) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Enlace no válido</Text>
        <Text style={styles.body}>Este enlace de seguimiento ya no está activo.</Text>
        <Button title="Cerrar" variant="outline" size="lg" fullWidth onPress={() => router.back()} />
      </View>
    );
  }

  const compartiendo = data.estado === 'activa' && Boolean(data.compartir_ubicacion) && data.ubicacion != null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={28} color="#55147C" />
        <Text style={styles.title}>Acompañamiento de {data.nombre_usuaria ?? 'una usuaria'}</Text>
      </View>
      <Text style={styles.subtitle}>Esta persona compartió su ubicación con contigo.</Text>

      {compartiendo ? (
        <>
          <MapCanvas latitude={data.ubicacion?.latitud ?? null} longitude={data.ubicacion?.longitud ?? null} status="sharing" />
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
          <Text style={styles.body}>La usuaria aún no ha compartido su ubicación en esta sesión.</Text>
        </Card>
      )}

      {data.destino ? <Card style={styles.card}><Text style={styles.body}>Destino: {data.destino}</Text></Card> : null}

      <Card style={styles.card}>
        <Text style={styles.body}>
          Si esta situación es grave, por favor contacta a los servicios de emergencia al <Text style={styles.bold}>{EMERGENCIA_NUMERO}</Text>.
          Tu acompañamiento puede continuar desde la app original.
        </Text>
      </Card>

      <Button title="Cerrar" variant="outline" size="lg" fullWidth onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  content: { padding: 20, paddingTop: 70, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 22, fontWeight: '800', color: '#22147C' },
  subtitle: { fontSize: 13, fontWeight: '600', color: '#6B5C7C', marginTop: 6, marginBottom: 14 },
  card: { marginBottom: 12 },
  metaLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: '#55147C', marginBottom: 6 },
  body: { fontSize: 14, fontWeight: '600', color: '#22147C', lineHeight: 20 },
  bold: { fontWeight: '800' },
});
