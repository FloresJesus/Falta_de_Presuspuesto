import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { Button, Card } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useDesaparecidas } from '@/hooks/useDesaparecidas';
import { Palette, Radius } from '@/constants/theme';

const VACIO = {
  nombre: '',
  edad: '',
  descripcion: '',
  foto_url: '',
  lugar: 'Oruro',
  latitud: '-17.7833',
  longitud: '-67.1333',
  fecha: new Date().toISOString().slice(0, 10),
  contacto: '',
};

export default function RegistroFelccScreen() {
  const { profile } = useAuth();
  const { personas, crear, marcarEncontrada } = useDesaparecidas();
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [guardando, setGuardando] = useState(false);

  if (profile?.rol !== 'admin') {
    return (
      <View style={styles.centro}>
        <Ionicons name="lock-closed-outline" size={48} color={Palette.purple} />
        <Text style={styles.titulo}>Solo FELCC</Text>
        <Text style={styles.texto}>Este registro es exclusivo de la policía administradora.</Text>
        <Button title="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  async function guardar() {
    setError(null);
    setOk(false);
    if (form.nombre.trim().length < 2) return setError('Escribe el nombre completo.');
    setGuardando(true);
    const res = await crear({
      nombre: form.nombre,
      edad: form.edad ? Number(form.edad) : null,
      descripcion: form.descripcion,
      foto_url: form.foto_url,
      lugar: form.lugar,
      latitud: Number(form.latitud),
      longitud: Number(form.longitud),
      fecha_desaparicion: new Date(`${form.fecha}T12:00:00`).toISOString(),
      contacto_familiar: form.contacto,
    });
    setGuardando(false);
    if (res.error) return setError(res.error);
    setForm(VACIO);
    setOk(true);
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Palette.purple} />
        </Pressable>
        <View>
          <Text style={styles.titulo}>Registro FELCC</Text>
          <Text style={styles.subtitulo}>Nueva persona desaparecida</Text>
        </View>
      </View>

      <Card>
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Nombre completo *" value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.half]} placeholder="Edad" keyboardType="numeric" value={form.edad} onChangeText={(v) => setForm({ ...form, edad: v })} />
            <TextInput style={[styles.input, styles.half]} placeholder="Fecha (AAAA-MM-DD)" value={form.fecha} onChangeText={(v) => setForm({ ...form, fecha: v })} />
          </View>
          <TextInput style={styles.input} placeholder="Lugar de la desaparición" value={form.lugar} onChangeText={(v) => setForm({ ...form, lugar: v })} />
          <TextInput style={styles.input} placeholder="URL de la foto" value={form.foto_url} onChangeText={(v) => setForm({ ...form, foto_url: v })} autoCapitalize="none" />
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.half]} placeholder="Latitud" keyboardType="numeric" value={form.latitud} onChangeText={(v) => setForm({ ...form, latitud: v })} />
            <TextInput style={[styles.input, styles.half]} placeholder="Longitud" keyboardType="numeric" value={form.longitud} onChangeText={(v) => setForm({ ...form, longitud: v })} />
          </View>
          <TextInput style={[styles.input, styles.multiline]} placeholder="Descripción / señas particulares" value={form.descripcion} onChangeText={(v) => setForm({ ...form, descripcion: v })} multiline />
          <TextInput style={styles.input} placeholder="Contacto de la familia" value={form.contacto} onChangeText={(v) => setForm({ ...form, contacto: v })} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {ok ? <Text style={styles.ok}>Registrado y publicado en el carrusel.</Text> : null}
          <Button title="Registrar desaparición" onPress={() => void guardar()} loading={guardando} fullWidth size="lg" />
        </View>
      </Card>

      <Text style={styles.listaTitulo}>Casos activos ({personas.length})</Text>
      {personas.map((p) => (
        <Card key={p.id} style={styles.caso}>
          <View style={styles.casoTop}>
            {p.foto_url ? <Image source={p.foto_url} style={styles.foto} contentFit="cover" /> : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.casoNombre}>{p.nombre}</Text>
              <Text style={styles.casoMeta}>{p.lugar}</Text>
            </View>
            <Pressable onPress={() => void marcarEncontrada(p.id)} style={styles.encontrada}>
              <Text style={styles.encontradaText}>Marcar encontrada</Text>
            </Pressable>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, backgroundColor: Palette.background, padding: 20, gap: 14 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10, backgroundColor: Palette.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 21, fontWeight: '800', color: Palette.purple },
  subtitulo: { fontSize: 12, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  texto: { fontSize: 14, fontWeight: '600', color: Palette.muted, textAlign: 'center' },
  form: { gap: 10 },
  input: {
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: Palette.ink,
  },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  error: { color: Palette.danger, fontWeight: '700', fontSize: 13 },
  ok: { color: Palette.success, fontWeight: '700', fontSize: 13 },
  listaTitulo: { fontSize: 16, fontWeight: '800', color: Palette.purple },
  caso: { gap: 8 },
  casoTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  foto: { width: 52, height: 52, borderRadius: 26 },
  casoNombre: { fontSize: 15, fontWeight: '800', color: Palette.purpleDeep },
  casoMeta: { fontSize: 12, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  encontrada: { paddingHorizontal: 8, paddingVertical: 6 },
  encontradaText: { fontSize: 11, fontWeight: '800', color: Palette.success },
});
