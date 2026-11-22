import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/text';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { WebView as WebViewType } from 'react-native-webview';
import { MapaOSM } from '@/components/MapaOSM';

import { Badge, Button, Card } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useUbicacion } from '@/hooks/useUbicacion';
import { useZonasPeligro } from '@/hooks/useZonasPeligro';
import { useAlertasRecibidas } from '@/hooks/useAlertasRecibidas';
import type { ZonaPeligro } from '@/lib/types';
import { Palette, Radius, Shadows } from '@/constants/theme';

const ORURO = { latitude: -17.9696, longitude: -67.1147, latitudeDelta: 0.06, longitudeDelta: 0.06 };
const COLORES = ['#2E9E5B', '#D9A400', '#E87A1F', '#E23B3B', '#8E1B2E'];

export default function MapaScreen() {
  const { profile } = useAuth();
  const { location, obtenerPosicion, solicitarPermiso } = useUbicacion();
  const { zonas, rutas, error, cargar, crear, desactivar } = useZonasPeligro();
  const { alertas: sosRecibidas, cargar: cargarSos, descartar: descartarSos } = useAlertasRecibidas();
  const [seleccion, setSeleccion] = useState<ZonaPeligro | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '', latitud: '', longitud: '', radio: '300', indice: '3', tipo: 'zona' as ZonaPeligro['tipo'] });
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const esAdmin = profile?.rol === 'admin';
  const webRef = useRef<WebViewType | null>(null);
  // Carga diferida para no evaluar codegenNativeComponent en react-native-web.
  useFocusEffect(
    useCallback(() => {
      void cargar();
      void cargarSos();
    }, [cargar, cargarSos]),
  );

  useEffect(() => {
    void (async () => {
      const permiso = await solicitarPermiso();
      if (permiso === 'granted') await obtenerPosicion();
    })();
  }, [obtenerPosicion, solicitarPermiso]);

  useEffect(() => {
    if (location && webRef.current) {
      webRef.current.injectJavaScript(
        `window.moverMapa && window.moverMapa(${location.latitude}, ${location.longitude}); true;`,
      );
    }
  }, [location]);

  async function ubicarme() {
    const res = await obtenerPosicion();
    if (res.location) {
      setForm((f) => ({ ...f, latitud: String(res.location!.latitude), longitud: String(res.location!.longitude) }));
      webRef.current?.injectJavaScript(
        `window.moverMapa && window.moverMapa(${res.location.latitude}, ${res.location.longitude}); true;`,
      );
    }
  }

  async function guardarZona() {
    setFormError(null);
    const lat = Number(form.latitud);
    const lng = Number(form.longitud);
    if (form.nombre.trim().length < 2) return setFormError('Escribe un nombre para la zona.');
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return setFormError('Ingresa coordenadas válidas.');
    setGuardando(true);
    const res = await crear({
      nombre: form.nombre,
      descripcion: form.descripcion,
      latitud: lat,
      longitud: lng,
      radio_m: Number(form.radio),
      indice_peligro: Number(form.indice),
      tipo: form.tipo,
    });
    setGuardando(false);
    if (res.error) return setFormError(res.error);
    setFormVisible(false);
  }

  // En web se usa mapa.web.tsx; este componente nunca llega a renderizar.
  if (Platform.OS === 'web') return null;

  const region = location
    ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : ORURO;

  return (
    <View style={styles.root}>
      <MapaOSM
        webRef={webRef}
        zonas={zonas}
        rutas={rutas}
        alertas={sosRecibidas}
        userLocation={location}
        center={{ latitude: region.latitude, longitude: region.longitude }}
        onZonePress={setSeleccion}
        onAlertaPress={(a) => router.push(`/alerta-sos/${a.id}`)}
        onMapPress={(lat, lng) => setForm((f) => ({ ...f, latitud: String(lat), longitud: String(lng) }))}
      />

      <SafeAreaView style={styles.safe} edges={['top']} pointerEvents="box-none">
        <View style={styles.header}>
          <Pressable onPress={() => router.replace('/inicio')} style={styles.circleBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.purple} />
          </Pressable>
          <Text style={styles.headerTitle}>Mapa de Oruro</Text>
          <Pressable onPress={() => void ubicarme()} style={styles.circleBtn}>
            <Ionicons name="locate-outline" size={22} color={Palette.purple} />
          </Pressable>
        </View>

        <View style={styles.leyenda}>
          <Text style={styles.leyendaText}>
            Zonas de riesgo: {zonas.length} · Rutas peligrosas: {rutas.length}
          </Text>
        </View>

        <View style={styles.escala}>
          <Text style={styles.escalaLabel}>Riesgo:</Text>
          {[1, 2, 3, 4, 5].map((n) => (
            <View key={n} style={[styles.escalaDot, { backgroundColor: COLORES[n - 1] }]}>
              <Text style={styles.escalaDotText}>{n}</Text>
            </View>
          ))}
          <Text style={styles.escalaLabel}>1 bajo · 5 alto</Text>
        </View>

        <ScrollView style={styles.lista} contentContainerStyle={styles.listaContenido} showsVerticalScrollIndicator={false}>
          {sosRecibidas.length > 0 ? (
            <>
              <Text style={[styles.listaTitulo, { color: Palette.danger }]}>Alertas SOS recibidas</Text>
              {sosRecibidas.map((a) => (
                <Pressable key={a.id} onPress={() => router.push(`/alerta-sos/${a.id}`)} style={styles.item}>
                  <View style={[styles.itemBadge, { backgroundColor: Palette.danger }]}>
                    <Ionicons name="warning" size={15} color={Palette.surface} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemNombre}>SOS de {a.nombre_usuaria}</Text>
                    <Text style={styles.itemDesc}>
                      {a.latitud != null && a.longitud != null
                        ? `Ubicación: ${a.latitud.toFixed(4)}, ${a.longitud.toFixed(4)}`
                        : 'Sin ubicación disponible'}
                    </Text>
                  </View>
                  <Pressable onPress={() => void descartarSos(a.id)} style={styles.descartarBtn}>
                    <Ionicons name="checkmark-done-outline" size={18} color={Palette.success} />
                  </Pressable>
                </Pressable>
              ))}
            </>
          ) : null}

          <Text style={styles.listaTitulo}>Calles y zonas peligrosas</Text>
          {rutas.map((r) => (
            <View key={r.id} style={styles.item}>
              <View style={[styles.itemBadge, { backgroundColor: COLORES[r.indice_peligro - 1] }]}>
                <Text style={styles.itemBadgeText}>{r.indice_peligro}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemNombre}>{r.nombre}</Text>
                <Text style={styles.itemDesc}>{r.descripcion ?? 'Ruta reportada como peligrosa.'}</Text>
              </View>
            </View>
          ))}
          {zonas.map((z) => (
            <View key={z.id} style={styles.item}>
              <View style={[styles.itemBadge, { backgroundColor: COLORES[z.indice_peligro - 1] }]}>
                <Text style={styles.itemBadgeText}>{z.indice_peligro}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemNombre}>{z.nombre}</Text>
                <Text style={styles.itemDesc}>{z.descripcion ?? 'Zona con índice de riesgo.'}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {seleccion ? (
          <Card style={styles.detalle}>
            <View style={styles.detalleTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.detalleTitle}>{seleccion.nombre}</Text>
                <Text style={styles.detalleSub}>{seleccion.descripcion ?? 'Sin descripción'}</Text>
              </View>
              <Badge variant={seleccion.indice_peligro >= 4 ? 'warning' : 'neutral'}>Riesgo {seleccion.indice_peligro}/5</Badge>
            </View>
            <Text style={styles.detalleMeta}>Radio: {seleccion.radio_m} m · {seleccion.tipo}</Text>
            {esAdmin ? (
              <Pressable onPress={() => void desactivar(seleccion.id).then(() => setSeleccion(null))} style={styles.borrar}>
                <Text style={styles.borrarText}>Desactivar zona</Text>
              </Pressable>
            ) : null}
          </Card>
        ) : null}
      </SafeAreaView>

      {esAdmin ? (
        <Pressable onPress={() => setFormVisible(true)} style={styles.fab}>
          <Ionicons name="add" size={28} color={Palette.surface} />
        </Pressable>
      ) : null}

      <Modal visible={formVisible} animationType="slide" onRequestClose={() => setFormVisible(false)}>
        <SafeAreaView style={styles.modal}>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.modalTitle}>Nueva zona de peligro</Text>
            <TextInput style={styles.input} placeholder="Nombre" value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />
            <TextInput style={styles.input} placeholder="Descripción" value={form.descripcion} onChangeText={(v) => setForm({ ...form, descripcion: v })} />
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.half]} placeholder="Latitud" keyboardType="numeric" value={form.latitud} onChangeText={(v) => setForm({ ...form, latitud: v })} />
              <TextInput style={[styles.input, styles.half]} placeholder="Longitud" keyboardType="numeric" value={form.longitud} onChangeText={(v) => setForm({ ...form, longitud: v })} />
            </View>
            <Pressable onPress={() => void ubicarme()} style={styles.usarUbicacion}>
              <Ionicons name="locate-outline" size={16} color={Palette.purple} />
              <Text style={styles.usarUbicacionText}>Usar mi ubicación actual</Text>
            </Pressable>
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.half]} placeholder="Radio (m)" keyboardType="numeric" value={form.radio} onChangeText={(v) => setForm({ ...form, radio: v })} />
              <TextInput style={[styles.input, styles.half]} placeholder="Índice 1-5" keyboardType="numeric" value={form.indice} onChangeText={(v) => setForm({ ...form, indice: v })} />
            </View>
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.chips}>
              {(['zona', 'alerta', 'inundacion', 'obras', 'otro'] as const).map((t) => (
                <Pressable key={t} onPress={() => setForm({ ...form, tipo: t })} style={[styles.chip, form.tipo === t && styles.chipOn]}>
                  <Text style={[styles.chipText, form.tipo === t && styles.chipTextOn]}>{t}</Text>
                </Pressable>
              ))}
            </View>
            {formError ? <Text style={styles.error}>{formError}</Text> : null}
            <Button title="Guardar zona" onPress={() => void guardarZona()} loading={guardando} fullWidth />
            <Button title="Cancelar" variant="ghost" onPress={() => setFormVisible(false)} fullWidth />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EDE0F4' },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  circleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.card ?? {}),
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: Palette.purple },
  error: { color: Palette.danger, fontWeight: '700', marginHorizontal: 20, marginTop: 8 },
  leyenda: {
    alignSelf: 'flex-start',
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: Palette.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  leyendaText: { fontSize: 11, fontWeight: '800', color: Palette.danger },
  escala: { flexDirection: 'row', alignItems: 'center', gap: 4, marginHorizontal: 20, marginTop: 8 },
  escalaLabel: { fontSize: 10, fontWeight: '700', color: Palette.mutedStrong },
  escalaDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  escalaDotText: { color: Palette.surface, fontSize: 10, fontWeight: '800' },
  lista: { marginTop: 8, marginHorizontal: 20 },
  listaContenido: { paddingBottom: 110 },
  listaTitulo: { fontSize: 14, fontWeight: '800', color: Palette.purpleDeep, marginBottom: 6 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  itemBadge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  itemBadgeText: { color: Palette.surface, fontSize: 12, fontWeight: '800' },
  itemNombre: { fontSize: 12, fontWeight: '800', color: Palette.purpleDeep },
  itemDesc: { fontSize: 10, fontWeight: '600', color: Palette.muted, marginTop: 1 },
  descartarBtn: { padding: 6 },
  detalle: { marginHorizontal: 20, marginTop: 12, gap: 8 },
  detalleTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  detalleTitle: { fontSize: 17, fontWeight: '800', color: Palette.purpleDeep },
  detalleSub: { fontSize: 13, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  detalleMeta: { fontSize: 12, fontWeight: '700', color: Palette.mutedStrong },
  borrar: { alignSelf: 'flex-start', paddingVertical: 6 },
  borrarText: { color: Palette.danger, fontWeight: '800', fontSize: 13 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Palette.purple,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.floating ?? {}),
  },
  modal: { flex: 1, backgroundColor: Palette.background },
  modalBody: { padding: 20, gap: 12 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: Palette.purple },
  input: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Palette.ink,
  },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  label: { fontSize: 13, fontWeight: '800', color: Palette.purpleDeep },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, borderWidth: 1, borderColor: Palette.border },
  chipOn: { backgroundColor: Palette.purple, borderColor: Palette.purple },
  chipText: { fontSize: 12, fontWeight: '700', color: Palette.mutedStrong },
  chipTextOn: { color: Palette.surface },
  usarUbicacion: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  usarUbicacionText: { fontSize: 13, fontWeight: '800', color: Palette.purple },
});
