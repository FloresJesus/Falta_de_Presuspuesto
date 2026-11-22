import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

import { Badge, Button, Card, IconBubble } from '@/components/ui';
import { useInstituciones } from '@/hooks/useInstituciones';
import { Palette, Radius, Shadows } from '@/constants/theme';

export default function InstitucionDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { instituciones } = useInstituciones();
  const institucion = instituciones.find((i) => i.id === id);

  if (!institucion) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Institución no encontrada</Text>
        <Button title="Volver" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  const mapsUrl =
    institucion.latitud != null && institucion.longitud != null
      ? `https://maps.google.com/?q=${institucion.latitud},${institucion.longitud}`
      : null;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={20} color={Palette.purple} />
        </Pressable>
        <Text style={styles.headerLabel}>Directorio</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.hero}>
        <IconBubble size={58} background={Palette.purpleSoft}>
          <Ionicons name="shield" size={28} color={Palette.purple} />
        </IconBubble>
        <Text style={styles.title}>{institucion.nombre}</Text>
        <View style={styles.badgesRow}>
          <Badge variant="accent">{institucion.categoria}</Badge>
          {institucion.verificado ? <Badge variant="success">Verificada</Badge> : null}
          {institucion.activo ? <Badge variant="primary">Activa</Badge> : null}
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Sobre la institución</Text>
        <Text style={styles.body}>{institucion.descripcion}</Text>
        <View style={styles.metaList}>
          {institucion.horario ? <Meta icon="time-outline" label="Horario" value={institucion.horario} /> : null}
          {institucion.alcance ? <Meta icon="earth-outline" label="Alcance" value={institucion.alcance} /> : null}
          {institucion.ciudad ? <Meta icon="location-outline" label="Ciudad" value={institucion.ciudad} /> : null}
          {institucion.direccion ? <Meta icon="navigate-outline" label="Dirección" value={institucion.direccion} /> : null}
          {institucion.fecha_revision ? <Meta icon="calendar-outline" label="Revisión" value={institucion.fecha_revision} /> : null}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Contacto</Text>
        {institucion.telefono ? (
          <Pressable onPress={() => void Linking.openURL(`tel:${institucion.telefono}`)} style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={16} color={Palette.purple} />
            </View>
            <Text style={styles.contactText}>{institucion.telefono}</Text>
            <Ionicons name="chevron-forward" size={16} color={Palette.muted} />
          </Pressable>
        ) : null}
        {institucion.correo ? <Meta icon="mail-outline" label="Correo" value={institucion.correo} /> : null}
        {institucion.sitio_web ? (
          <Pressable onPress={() => void Linking.openURL(institucion.sitio_web!)} style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Ionicons name="globe" size={16} color={Palette.purple} />
            </View>
            <Text style={styles.contactText} numberOfLines={1}>{institucion.sitio_web}</Text>
            <Ionicons name="chevron-forward" size={16} color={Palette.muted} />
          </Pressable>
        ) : null}
      </Card>

      {mapsUrl ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <Text style={styles.body}>
            Lat: {institucion.latitud?.toFixed(4)} · Lng: {institucion.longitud?.toFixed(4)}
          </Text>
          <Pressable onPress={() => void Linking.openURL(mapsUrl)} style={styles.webButton}>
            <Ionicons name="map-outline" size={18} color={Palette.purple} />
            <Text style={styles.webButtonText}>Abrir en Google Maps</Text>
          </Pressable>
        </Card>
      ) : null}

      <Button
        title="Llamar ahora"
        size="lg"
        fullWidth
        onPress={() => (institucion.telefono ? void Linking.openURL(`tel:${institucion.telefono}`) : void 0)}
      />
      <View style={{ height: 12 }} />
      <Button title="Volver" variant="outline" size="lg" fullWidth onPress={() => router.back()} />
    </ScrollView>
  );
}

function Meta({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Ionicons name={icon} size={15} color={Palette.purple} />
      <Text style={styles.metaLabel}>{label}:</Text>
      <Text style={styles.metaValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Palette.background, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Shadows.card ?? {}),
  },
  headerLabel: { color: Palette.muted, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  hero: { alignItems: 'center', marginBottom: 18 },
  title: { fontSize: 24, fontWeight: '800', color: Palette.ink, textAlign: 'center', marginTop: 12, letterSpacing: -0.4 },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  card: { marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Palette.ink, marginBottom: 8 },
  body: { fontSize: 14, fontWeight: '500', color: Palette.ink, lineHeight: 22 },
  metaList: { marginTop: 10, gap: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  metaLabel: { color: Palette.muted, fontSize: 12, fontWeight: '800' },
  metaValue: { color: Palette.ink, fontSize: 12, fontWeight: '600', flex: 1 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.purpleSoft,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 8,
  },
  contactIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: { fontSize: 14, fontWeight: '800', color: Palette.purple, flex: 1 },
  webButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  webButtonText: { color: Palette.purple, fontWeight: '800', fontSize: 14 },
});
