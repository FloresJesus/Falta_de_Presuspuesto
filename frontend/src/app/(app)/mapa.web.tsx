import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/text';

import { Badge, Button, Card } from '@/components/ui';
import { MapCanvas } from '@/components/MapCanvas';
import { useAuth } from '@/context/AuthContext';
import { useZonasPeligro } from '@/hooks/useZonasPeligro';
import { Palette, Radius } from '@/constants/theme';

export default function MapaWebScreen() {
  const { profile } = useAuth();
  const { zonas, crear, desactivar } = useZonasPeligro();
  const [form, setForm] = useState({ nombre: '', latitud: '-17.9696', longitud: '-67.1147', indice: '3' });
  const [error, setError] = useState<string | null>(null);
  const esAdmin = profile?.rol === 'admin';

  async function guardar() {
    setError(null);
    if (form.nombre.trim().length < 2) return setError('Escribe un nombre.');
    const res = await crear({
      nombre: form.nombre,
      latitud: Number(form.latitud),
      longitud: Number(form.longitud),
      indice_peligro: Number(form.indice),
      tipo: 'zona',
    });
    if (res.error) return setError(res.error);
    setForm({ ...form, nombre: '' });
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.titulo}>Mapa de Oruro</Text>
      <View style={styles.mapa}>
        <MapCanvas latitude={-17.9696} longitude={-67.1147} status="idle" markers />
      </View>

      <Text style={styles.seccion}>Zonas registradas ({zonas.length})</Text>
      {zonas.map((z) => (
        <Card key={z.id} style={styles.zona}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nombre}>{z.nombre}</Text>
            <Text style={styles.meta}>
              {z.latitud.toFixed(4)}, {z.longitud.toFixed(4)} · {z.tipo}
            </Text>
          </View>
          <Badge variant={z.indice_peligro >= 4 ? 'warning' : 'neutral'}>Riesgo {z.indice_peligro}</Badge>
          {esAdmin ? (
            <Button title="Baja" variant="ghost" size="sm" onPress={() => void desactivar(z.id)} />
          ) : null}
        </Card>
      ))}

      {esAdmin ? (
        <Card style={styles.forma}>
          <Text style={styles.seccion}>Nueva zona (FELCC)</Text>
          <TextInput style={styles.input} placeholder="Nombre" value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.half]} placeholder="Latitud" value={form.latitud} onChangeText={(v) => setForm({ ...form, latitud: v })} />
            <TextInput style={[styles.input, styles.half]} placeholder="Longitud" value={form.longitud} onChangeText={(v) => setForm({ ...form, longitud: v })} />
          </View>
          <TextInput style={styles.input} placeholder="Índice 1-5" value={form.indice} onChangeText={(v) => setForm({ ...form, indice: v })} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Guardar zona" onPress={() => void guardar()} fullWidth />
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, backgroundColor: Palette.background, padding: 20, gap: 10 },
  titulo: { fontSize: 22, fontWeight: '800', color: Palette.purple },
  mapa: { height: 260, borderRadius: Radius.xl, overflow: 'hidden' },
  seccion: { fontSize: 15, fontWeight: '800', color: Palette.purple, marginTop: 8 },
  zona: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  nombre: { fontSize: 15, fontWeight: '800', color: Palette.purpleDeep },
  meta: { fontSize: 11, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  forma: { gap: 10 },
  input: {
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Palette.ink,
  },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  error: { color: Palette.danger, fontWeight: '700', fontSize: 13 },
});
