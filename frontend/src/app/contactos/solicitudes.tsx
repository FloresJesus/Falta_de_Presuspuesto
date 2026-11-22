import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router, useFocusEffect } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

import { Avatar, Badge, Button, Card, EmptyState } from '@/components/ui';
import { useAlertasRecibidas } from '@/hooks/useAlertasRecibidas';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import type { EstadoSolicitudContacto, SolicitudContacto } from '@/lib/types';
import { Palette, Radius } from '@/constants/theme';

const ETIQUETA_ESTADO: Record<EstadoSolicitudContacto, string> = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
};

const VARIANTE_ESTADO: Record<EstadoSolicitudContacto, 'warning' | 'success' | 'neutral'> = {
  pendiente: 'warning',
  aceptada: 'success',
  rechazada: 'neutral',
  cancelada: 'neutral',
};

function fechaCorta(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export default function SolicitudesScreen() {
  const { entrantes, salientes, loading, error, cargar, responder, cancelar } = useSolicitudes();
  const { alertas: sosAlertas, cargar: cargarSos } = useAlertasRecibidas();
  const [accionId, setAccionId] = useState<string | null>(null);
  const [accionError, setAccionError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void cargar();
      void cargarSos();
    }, [cargar, cargarSos]),
  );

  async function responderSolicitud(solicitud: SolicitudContacto, aceptar: boolean) {
    setAccionError(null);
    setAccionId(solicitud.id);
    const res = await responder(solicitud.id, aceptar);
    setAccionId(null);
    if (res.error) setAccionError(res.error);
  }

  async function cancelarSolicitud(solicitud: SolicitudContacto) {
    setAccionError(null);
    setAccionId(solicitud.id);
    const res = await cancelar(solicitud.id);
    setAccionId(null);
    if (res.error) setAccionError(res.error);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Palette.purple} />
        </Pressable>
        <Text style={styles.title}>Solicitudes</Text>
        <View style={styles.headerBtn} />
      </View>
      <Text style={styles.subtitle}>
        Cuando alguien te agregue como contacto, podrás aceptarla o rechazarla aquí.
      </Text>

      {error || accionError ? <Text style={styles.error}>{accionError ?? error}</Text> : null}
      {loading ? <Text style={styles.loading}>Cargando solicitudes...</Text> : null}

      <Text style={styles.sectionTitle}>Alertas SOS recibidas {sosAlertas.length > 0 ? `(${sosAlertas.length})` : ''}</Text>
      {sosAlertas.length === 0 && !loading ? (
        <Card style={styles.emptyCard}>
          <EmptyState
            icon={<Ionicons name="shield-checkmark-outline" size={30} color={Palette.danger} />}
            title="Sin alertas SOS"
            message="Aquí aparecerá la alerta de emergencia de tu contacto."
          />
        </Card>
      ) : null}

      {sosAlertas.map((alerta) => (
        <Card key={alerta.id} style={styles.solicitudCard}>
          <View style={styles.rowTop}>
            <Avatar name={alerta.nombre_usuaria} size={46} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{alerta.nombre_usuaria}</Text>
              <Text style={styles.detail}>{alerta.mensaje}</Text>
            </View>
            <Text style={styles.date}>{fechaCorta(alerta.creada_en)}</Text>
          </View>
          {alerta.latitud != null && alerta.longitud != null ? (
            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={15} color={Palette.muted} />
                <Text style={styles.infoText}>
                  Lat: {alerta.latitud.toFixed(4)} · Lng: {alerta.longitud.toFixed(4)}
                </Text>
              </View>
            </View>
          ) : null}
          <View style={styles.actions}>
            {alerta.token_seguimiento ? (
              <View style={{ flex: 1 }}>
                <Button
                  title="Abrir alerta"
                  size="sm"
                  fullWidth
                  onPress={() => router.push(`/alerta-sos/${alerta.id}`)}
                />
              </View>
            ) : null}
            {alerta.telefono_usuaria ? (
              <View style={{ flex: 1 }}>
                <Button
                  title="Llamar"
                  variant="outline"
                  size="sm"
                  fullWidth
                  onPress={() => void Linking.openURL(`tel:${alerta.telefono_usuaria}`)}
                />
              </View>
            ) : null}
          </View>
        </Card>
      ))}

      <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Para ti {entrantes.length > 0 ? `(${entrantes.length})` : ''}</Text>
      {entrantes.length === 0 && !loading ? (
        <Card style={styles.emptyCard}>
          <EmptyState
            icon={<Ionicons name="mail-open-outline" size={30} color={Palette.purple} />}
            title="Sin solicitudes nuevas"
            message="Cuando otra usuaria te invite a ser su contacto, aparecerá aquí."
          />
        </Card>
      ) : null}

      {entrantes.map((s) => (
        <Card key={s.id} style={styles.solicitudCard}>
          <View style={styles.rowTop}>
            <Avatar name={s.nombre_solicitante} size={46} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{s.nombre_solicitante}</Text>
              <Text style={styles.detail}>Quiere que seas su contacto de confianza.</Text>
            </View>
            <Text style={styles.date}>{fechaCorta(s.creado_en)}</Text>
          </View>

          <View style={styles.infoBox}>
            {s.correo_solicitante ? (
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={15} color={Palette.muted} />
                <Text style={styles.infoText}>{s.correo_solicitante}</Text>
              </View>
            ) : null}
            {s.telefono_solicitante ? (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={15} color={Palette.muted} />
                <Text style={styles.infoText}>{s.telefono_solicitante}</Text>
              </View>
            ) : null}
            {s.relacion ? (
              <View style={styles.infoRow}>
                <Ionicons name="heart-outline" size={15} color={Palette.muted} />
                <Text style={styles.infoText}>Relación: {s.relacion}</Text>
              </View>
            ) : null}
          </View>

          {accionId === s.id ? (
            <ActivityIndicator size="small" color={Palette.purple} />
          ) : (
            <View style={styles.actions}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Rechazar"
                  variant="outline"
                  size="sm"
                  fullWidth
                  onPress={() => void responderSolicitud(s, false)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Aceptar"
                  size="sm"
                  fullWidth
                  onPress={() => void responderSolicitud(s, true)}
                />
              </View>
            </View>
          )}
        </Card>
      ))}

      <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Enviadas ({salientes.length})</Text>
      {salientes.length === 0 && !loading ? (
        <Card style={styles.emptyCard}>
          <EmptyState
            icon={<Ionicons name="paper-plane-outline" size={30} color={Palette.purple} />}
            title="No has enviado solicitudes"
            message="Busca a alguien por correo o teléfono desde Agregar contacto."
          />
        </Card>
      ) : null}

      {salientes.map((s) => (
        <Card key={s.id} style={styles.solicitudCard}>
          <View style={styles.rowTop}>
            <Avatar name={s.nombre_destinatario} size={46} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{s.nombre_destinatario}</Text>
              <Text style={styles.detail}>
                {s.estado === 'pendiente'
                  ? 'Esperando a que acepte.'
                  : s.estado === 'aceptada'
                    ? 'Ya son contactos.'
                    : s.estado === 'rechazada'
                      ? 'La solicitud fue rechazada.'
                      : 'Solicitud cancelada.'}
              </Text>
            </View>
            <View style={styles.badgeWrap}>
              <Badge variant={VARIANTE_ESTADO[s.estado]}>{ETIQUETA_ESTADO[s.estado]}</Badge>
            </View>
          </View>

          <View style={styles.rowBottom}>
            <Text style={styles.date}>{fechaCorta(s.creado_en)}</Text>
            {s.estado === 'pendiente' ? (
              accionId === s.id ? (
                <ActivityIndicator size="small" color={Palette.purple} />
              ) : (
                <Pressable onPress={() => void cancelarSolicitud(s)} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancelar solicitud</Text>
                </Pressable>
              )
            ) : null}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Palette.background, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: Palette.purple, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, fontWeight: '600', color: Palette.muted, marginBottom: 16, textAlign: 'center' },
  error: { color: Palette.danger, fontWeight: '700', marginBottom: 10 },
  loading: { color: Palette.muted, fontWeight: '600', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: Palette.purpleDeep, marginBottom: 8 },
  sectionSpacing: { marginTop: 22 },
  emptyCard: { paddingVertical: 10 },
  solicitudCard: { marginBottom: 10, gap: 12 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontSize: 16, fontWeight: '800', color: Palette.purpleDeep },
  detail: { fontSize: 12, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  date: { fontSize: 11, fontWeight: '700', color: Palette.mutedStrong, alignSelf: 'flex-start' },
  infoBox: {
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 10,
    gap: 6,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { flex: 1, fontSize: 12, fontWeight: '600', color: Palette.mutedStrong },
  actions: { flexDirection: 'row', gap: 10 },
  badgeWrap: { alignItems: 'flex-end' },
  rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cancelBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  cancelText: { fontSize: 12, fontWeight: '800', color: Palette.danger },
});
