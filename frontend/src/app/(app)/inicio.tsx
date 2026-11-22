import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Mascot, MascotAvatar } from '@/components/ui';
import { CarruselDesaparecidas } from '@/components/carrusel-desaparecidas';
import { useContactos } from '@/hooks/useContactos';
import { useSesion } from '@/hooks/useSesion';
import { useAuth } from '@/context/AuthContext';
import { useSos } from '@/context/SosContext';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import { useAlertasRecibidas } from '@/hooks/useAlertasRecibidas';
import { Palette, Radius, Shadows } from '@/constants/theme';

export default function InicioScreen() {
  const { profile } = useAuth();
  const { sesion, contacto } = useSesion();
  const { contactos } = useContactos();
  const { pendientesEntrantes, cargar: cargarSolicitudes } = useSolicitudes();
  const { alertas: sosRecibidas } = useAlertasRecibidas();
  const { estado: sos, cancelarSos } = useSos();
  const totalNotificaciones = pendientesEntrantes + sosRecibidas.length;

  useFocusEffect(
    useCallback(() => {
      void cargarSolicitudes();
    }, [cargarSolicitudes]),
  );

  const nombre = profile?.nombre ?? 'María';
  const primer = nombre.trim().split(/\s+/)[0] || 'María';
  const principal = contactos.find((c) => c.es_principal) ?? contactos[0];
  const acompanante = contacto?.nombre ?? principal?.nombre;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <MascotAvatar size={56} />
        <View style={styles.helloRow}>
          <Text style={styles.hello}>Hola, {primer}</Text>
          <Ionicons name="heart" size={22} color={Palette.pink} />
        </View>
        <Pressable
          onPress={() => router.push('/contactos/solicitudes')}
          style={({ pressed }) => [styles.bell, pressed && { opacity: 0.75 }]}>
          <Ionicons name="notifications-outline" size={20} color={Palette.purple} />
          {totalNotificaciones > 0 ? (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>
                {totalNotificaciones > 9 ? '9+' : totalNotificaciones}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {sosRecibidas.length > 0 ? (
        <Pressable
          onPress={() => router.push(`/alerta-sos/${sosRecibidas[0].id}`)}
          style={({ pressed }) => [styles.sosRecibidoBanner, pressed && { opacity: 0.94 }]}>
          <Ionicons name="warning" size={22} color={Palette.danger} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sosRecibidoTitle}>
              {sosRecibidas.length === 1
                ? `Alerta SOS de ${sosRecibidas[0].nombre_usuaria}`
                : `Tienes ${sosRecibidas.length} alertas SOS`}
            </Text>
            <Text style={styles.bannerText}>Abre para ver su ubicación y llamarla.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Palette.danger} />
        </Pressable>
      ) : null}

      {pendientesEntrantes > 0 ? (
        <Pressable
          onPress={() => router.push('/contactos/solicitudes')}
          style={({ pressed }) => [styles.solicitudesBanner, pressed && { opacity: 0.94 }]}>
          <Ionicons name="mail-unread-outline" size={22} color={Palette.purple} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              {pendientesEntrantes === 1
                ? 'Tienes 1 solicitud de contacto'
                : `Tienes ${pendientesEntrantes} solicitudes de contacto`}
            </Text>
            <Text style={styles.bannerText}>Ábrela para aceptarla o rechazarla.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Palette.purple} />
        </Pressable>
      ) : null}

      {sos.activo ? (
        <View style={styles.sosActivoBanner}>
          <Ionicons name="warning" size={20} color={Palette.danger} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sosActivoTitle}>Alerta SOS activa</Text>
            <Text style={styles.sosActivoText}>Tu ubicación se está compartiendo con {acompanante ?? 'tu contacto'}.</Text>
          </View>
          <Pressable onPress={() => void cancelarSos()} style={styles.sosCancelLink}>
            <Text style={styles.sosCancelText}>Cancelar</Text>
          </Pressable>
        </View>
      ) : null}

      <CarruselDesaparecidas />

      <Pressable onPress={() => router.push('/mapa')} style={({ pressed }) => [styles.statusCard, pressed && { opacity: 0.94 }]}>
        <View style={styles.statusIcon}>
          <Ionicons name="checkmark" size={32} color={Palette.surface} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>Todo está bien</Text>
          <Text style={styles.statusSub}>
            {sesion && acompanante
              ? `Compartiendo con ${acompanante}`
              : 'Tu ubicación se comparte con tus contactos'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={Palette.purple} />
      </Pressable>

      <Text style={styles.sectionTitle}>Accesos rápidos</Text>

      <View style={styles.grid}>
        <QuickCard icon="location-outline" label="Compartir ubicación" color={Palette.pink} onPress={() => router.push('/compartir')} />
        <QuickCard
          icon="warning-outline"
          label="Enviar SOS"
          color={Palette.pink}
          onPress={() => router.push('/sos')}
          counter={null}
        />
        <QuickCard icon="book-outline" label="Aprender" color={Palette.purple} onPress={() => router.push('/educacion')} />
        <QuickCard icon="people-outline" label="Mis contactos" color={Palette.purple} onPress={() => router.push('/contactos')} />
      </View>

      <View style={styles.reminder}>
        <Mascot height={68} />
        <View style={{ flex: 1 }}>
          <Text style={styles.reminderTitle}>Recuerda:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.reminderTitle}>No estás sola</Text>
            <Ionicons name="heart" size={16} color={Palette.pink} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function QuickCard({
  icon,
  label,
  color,
  onPress,
  counter,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  counter?: number | null;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && { transform: [{ scale: 0.98 }], opacity: 0.94 }]}>
      {counter != null ? (
        <>
          <View style={[styles.sosCountRing, { borderColor: color }]}>
            <Text style={[styles.sosCount, { color }]}>{counter}</Text>
          </View>
          <Text style={[styles.quickLabel, { color }]}>Toca para cancelar</Text>
        </>
      ) : (
        <>
          <Ionicons name={icon} size={34} color={color} />
          <Text style={styles.quickLabel}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Palette.background, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  helloRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  hello: { fontSize: 19, fontWeight: '800', color: Palette.purple, letterSpacing: -0.3 },
  bell: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...(Shadows.card ?? {}),
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Palette.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: { color: Palette.surface, fontSize: 10, fontWeight: '800' },
  sosRecibidoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FDE7EC',
    borderRadius: Radius.xl,
    padding: 12,
    marginBottom: 10,
  },
  sosRecibidoTitle: { fontSize: 14, fontWeight: '800', color: Palette.danger },
  solicitudesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.lilac,
    borderRadius: Radius.xl,
    padding: 12,
    marginBottom: 10,
  },
  bannerTitle: { fontSize: 14, fontWeight: '800', color: Palette.purple },
  bannerText: { fontSize: 12, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.lilac,
    borderRadius: Radius.xl,
    padding: 12,
  },
  statusIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: Palette.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: { fontSize: 17, fontWeight: '800', color: Palette.purple, letterSpacing: -0.2 },
  statusSub: { fontSize: 13, fontWeight: '600', color: Palette.muted, marginTop: 2, lineHeight: 18, maxWidth: 215 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Palette.purple, marginTop: 18, marginBottom: 10, letterSpacing: -0.2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 84,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 10,
    ...(Shadows.card ?? {}),
  },
  quickLabel: { fontSize: 12, fontWeight: '600', color: Palette.purple, textAlign: 'center' },
  sosCountRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosCount: { fontSize: 22, fontWeight: '800' },
  sosActivoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDE7EC',
    borderRadius: Radius.xl,
    padding: 12,
    marginBottom: 10,
  },
  sosActivoTitle: { fontSize: 14, fontWeight: '800', color: Palette.danger },
  sosActivoText: { fontSize: 12, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  sosCancelLink: { paddingVertical: 6, paddingLeft: 6 },
  sosCancelText: { fontSize: 12, fontWeight: '800', color: Palette.danger },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.lilac,
    borderRadius: Radius.xl,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 14,
    overflow: 'hidden',
  },
  reminderTitle: { fontSize: 16, fontWeight: '800', color: Palette.purple, letterSpacing: -0.2 },
});
