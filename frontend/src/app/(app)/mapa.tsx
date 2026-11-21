import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card , Avatar } from '@/components/ui';
import { MapCanvas } from '@/components/MapCanvas';
import { useSesion } from '@/hooks/useSesion';
import { useUbicacion } from '@/hooks/useUbicacion';

export default function MapaScreen() {
  const { sesion, contacto } = useSesion();
  const { location } = useUbicacion();

  const compartiendo = Boolean(sesion && sesion.compartir_ubicacion);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Mapa de seguridad</Text>
          <Text style={styles.subtitle}>{sesion ? 'Tu acompañante puede ver tu ruta.' : 'Sin acompañamiento activo'}</Text>
        </View>
        <View style={[styles.statusPill, sesion ? styles.statusPillOn : styles.statusPillOff]}>
          <Ionicons name={sesion ? 'shield-checkmark' : 'ellipse'} size={13} color={sesion ? '#FFFFFF' : '#6B5C7C'} />
          <Text style={[styles.statusPillText, sesion && styles.statusPillTextOn]}>{sesion ? 'En acompañamiento' : 'Libre'}</Text>
        </View>
      </View>

      <View style={styles.mapWrap}>
        <MapCanvas latitude={location?.latitude ?? null} longitude={location?.longitude ?? null} status={compartiendo ? 'sharing' : 'idle'} />
        <View style={styles.mapBadge}>
          <Ionicons name="location" size={14} color="#FFFFFF" />
          <Text style={styles.mapBadgeText}>{compartiendo ? 'Compartiendo ubicación' : 'Tu ubicación'}</Text>
        </View>
      </View>

      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#55147C" />
          <Text style={styles.infoText}>Última actualización: {location ? 'reciente' : 'esperando señal GPS'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="finger-print-outline" size={16} color="#55147C" />
          <Text style={styles.infoText}>Coordenadas: {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Pendiente'}</Text>
        </View>
      </Card>

      {contacto ? (
        <Card style={styles.contactCard}>
          <Avatar name={contacto.nombre} size={46} />
          <View style={{ flex: 1 }}>
            <Text style={styles.contactName}>{contacto.nombre}</Text>
            <Text style={styles.contactMeta}>{contacto.relacion ? `${contacto.relacion} · ` : ''}Tel: {contacto.telefono}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B5C7C" />
        </Card>
      ) : null}

      <View style={styles.actions}>
        {sesion ? (
          <>
            <Button title="Finalizar acompañamiento" variant="outline" onPress={() => void 0} fullWidth />
            <Button title="Enviar SOS" onPress={() => router.push('/sos')} variant="accent" fullWidth />
          </>
        ) : (
          <Button title="Iniciar acompañamiento" onPress={() => router.push('/compartir')} fullWidth size="lg" />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAF9FF', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#22147C' },
  subtitle: { fontSize: 13, fontWeight: '600', color: '#6B5C7C', marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  statusPillOn: { backgroundColor: '#55147C' },
  statusPillOff: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7DDF2' },
  statusPillText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  statusPillTextOn: { color: '#FFFFFF' },
  mapWrap: { height: 340, borderRadius: 24, overflow: 'hidden', backgroundColor: '#F0EAF9', borderWidth: 1, borderColor: '#E7DDF2', marginTop: 14 },
  mapBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(43,15,62,0.85)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  mapBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  infoCard: { marginTop: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoText: { color: '#6B5C7C', fontSize: 12, fontWeight: '600' },
  contactCard: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactName: { color: '#22147C', fontSize: 15, fontWeight: '800' },
  contactMeta: { color: '#6B5C7C', fontSize: 12, fontWeight: '600', marginTop: 2 },
  actions: { marginTop: 'auto', gap: 10, paddingTop: 16 },
});
