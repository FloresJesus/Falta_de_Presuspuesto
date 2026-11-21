import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Avatar, Button, Card, SectionHeader } from '@/components/ui';
import { useContactos } from '@/hooks/useContactos';
import { useContenidosEducativos } from '@/hooks/useInstituciones';
import { useSesion } from '@/hooks/useSesion';
import { useAuth } from '@/context/AuthContext';
import { EMERGENCIA_NUMERO } from '@/lib/utils';

export default function InicioScreen() {
  const { profile } = useAuth();
  const { sesion, contacto } = useSesion();
  const { contactos } = useContactos();
  const { contenidos } = useContenidosEducativos();

  const nombre = profile?.nombre ?? 'amiga';
  const primer = nombre.trim().split(/\s+/)[0] || 'amiga';
  const principal = contactos.find((c) => c.es_principal) ?? contactos[0];
  const featured = contenidos[0];

  const acciones = [
    { key: 'mapa', label: 'Compartir ubicación', icon: 'map', bg: '#55147C', fg: '#FFFFFF', route: '/mapa' },
    { key: 'sos', label: 'Enviar SOS', icon: 'alert', bg: '#55147C', fg: '#FFFFFF', route: '/sos' },
    { key: 'educacion', label: 'Aprender', icon: 'book', bg: '#E7D8F2', fg: '#55147C', route: '/educacion' },
    { key: 'contactos', label: 'Mis contactos', icon: 'people', bg: '#0E9F66', fg: '#FFFFFF', route: '/contactos' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Avatar name={nombre} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Hola, {primer}</Text>
          <Text style={styles.subGreeting}>Tu red de seguridad está activa.</Text>
        </View>
        <Pressable onPress={() => router.push('/ajustes')} style={({ pressed }) => [styles.bellBtn, pressed && { opacity: 0.7 }]}>
          <Ionicons name="notifications-outline" size={22} color="#55147C" />
        </Pressable>
      </View>

      <Card style={styles.statusCard}>
        {sesion ? (
          <View style={styles.statusRow}>
            <View style={styles.statusIconWrap}>
              <Ionicons name="shield-checkmark" size={30} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>Acompañamiento activo</Text>
              <Text style={styles.statusText}>
                Compartiendo con {contacto?.nombre ?? 'tu contacto'} · {sesion.destino ?? 'Sin destino'}
              </Text>
            </View>
            <Pressable onPress={() => router.push('/mapa')} style={styles.statusButton}>
              <Text style={styles.statusButtonText}>Ver</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.statusRow}>
            <View style={[styles.statusIconWrap, styles.statusIconWrapOk]}>
              <Ionicons name="shield-checkmark" size={30} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>Estás a salvo</Text>
              <Text style={styles.statusText}>Recuerda activar un acompañamiento antes de salir.</Text>
            </View>
            <Pressable onPress={() => router.push('/compartir')} style={styles.statusButton}>
              <Text style={styles.statusButtonText}>Compartir</Text>
            </Pressable>
          </View>
        )}
      </Card>

      <View style={styles.grid}>
        {acciones.map((a) => (
          <Pressable key={a.key} onPress={() => router.push(a.route as never)} style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.9 }]}>
            <View style={[styles.actionIcon, { backgroundColor: a.bg }]}>
              <Ionicons name={a.icon as never} size={24} color={a.fg} />
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      <Card style={styles.emergencyCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.emergencyTitle}>¿Emergencia?</Text>
          <Text style={styles.emergencyText}>
            Llama al <Text style={styles.emergencyBold}>{EMERGENCIA_NUMERO}</Text> o activa una alerta SOS con tu red de apoyo.
          </Text>
        </View>
        <Button title="SOS" onPress={() => router.push('/sos')} size="sm" />
      </Card>

      <SectionHeader title="Tu red de apoyo" subtitle="Personas que pueden acompañarte" action={<Button title="+ Añadir" size="sm" variant="soft" onPress={() => router.push('/contactos')} />} />
      {principal ? (
        <Card>
          <View style={styles.contactRow}>
            <Avatar name={principal.nombre} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{principal.nombre}</Text>
              <Text style={styles.contactMeta}>
                {principal.relacion ? `${principal.relacion} · ` : ''}Tel: {principal.telefono}
              </Text>
            </View>
            <Button title="Llamar" size="sm" variant="outline" onPress={() => void 0} />
          </View>
        </Card>
      ) : (
        <Card>
          <Text style={styles.emptyText}>Todavía no tienes contactos de confianza registrados.</Text>
          <Button title="Crear contacto" size="sm" onPress={() => router.push('/contactos')} />
        </Card>
      )}

      {featured ? (
        <>
          <SectionHeader title="Aprende, cuida y empodérate" />
          <Pressable onPress={() => router.push({ pathname: '/contenido/[id]', params: { id: featured.id } } as never)} style={({ pressed }) => [styles.featuredCard, pressed && { opacity: 0.95 }]}>
            <View style={styles.featuredBadge}>
              <Ionicons name="book" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.featuredTitle}>{featured.titulo}</Text>
            <Text style={styles.featuredText}>{featured.resumen}</Text>
            <Text style={styles.featuredMeta}>{featured.tiempo_lectura_min ?? 3} min de lectura · {featured.fuente}</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAF9FF', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#22147C' },
  subGreeting: { fontSize: 13, fontWeight: '600', color: '#6B5C7C', marginTop: 2 },
  bellBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7DDF2', alignItems: 'center', justifyContent: 'center' },
  statusCard: { backgroundColor: '#55147C', borderWidth: 0 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  statusIconWrapOk: { backgroundColor: '#0E9F66' },
  statusTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  statusText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  statusButton: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  statusButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 },
  actionCard: { width: '48.5%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#E7DDF2' },
  actionIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionLabel: { color: '#22147C', fontSize: 13, fontWeight: '800' },
  emergencyCard: { marginTop: 14, backgroundColor: '#FBE7E8', borderWidth: 0, flexDirection: 'row', alignItems: 'center' },
  emergencyTitle: { color: '#E5484D', fontSize: 16, fontWeight: '800' },
  emergencyText: { color: '#8A3A40', fontSize: 12, fontWeight: '600', marginTop: 2, flex: 1 },
  emergencyBold: { fontWeight: '800' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactName: { color: '#22147C', fontSize: 15, fontWeight: '800' },
  contactMeta: { color: '#6B5C7C', fontSize: 12, fontWeight: '600', marginTop: 2 },
  emptyText: { color: '#6B5C7C', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  featuredCard: { marginTop: 14, backgroundColor: '#22147C', borderRadius: 20, padding: 18, borderWidth: 0 },
  featuredBadge: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#55147C', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featuredTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  featuredText: { color: '#E6DDF2', fontSize: 13, fontWeight: '600', marginTop: 6 },
  featuredMeta: { color: '#BCA8D0', fontSize: 11, fontWeight: '700', marginTop: 10 },
});
