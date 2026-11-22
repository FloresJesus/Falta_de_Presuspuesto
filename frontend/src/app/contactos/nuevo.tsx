import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Avatar, Button, Card, Toggle } from '@/components/ui';
import { useContactos } from '@/hooks/useContactos';
import { useDirectorio, type PersonaDirectorio } from '@/hooks/useDirectorio';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import { esEmailValido, esTelefonoValido } from '@/lib/utils';
import { Palette, Radius, Shadows } from '@/constants/theme';

export default function ContactoNuevoScreen() {
  const { contactos, crear } = useContactos();
  const { personas, buscando, error: errorBusqueda, buscar, resolver, limpiar } = useDirectorio();
  const { solicitudes, enviar } = useSolicitudes();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [relacion, setRelacion] = useState('');
  const [esPrincipal, setEsPrincipal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [campoActivo, setCampoActivo] = useState<'correo' | 'telefono' | null>(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<PersonaDirectorio | null>(null);
  const [personaSolicitada, setPersonaSolicitada] = useState<PersonaDirectorio | null>(null);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);

  // Personas registradas que todavía no son contactos ni tienen solicitud pendiente.
  const sugerencias = personas.filter(
    (p) =>
      !contactos.some(
        (c) =>
          (p.correo && c.correo && c.correo.toLowerCase() === p.correo.toLowerCase()) ||
          (p.telefono && c.telefono && c.telefono === p.telefono),
      ) &&
      !solicitudes.some((s) => s.destinatario_id === p.id && s.estado === 'pendiente'),
  );

  // Solo buscamos cuando el campo activo es correo o teléfono, y con un dato
  // completo: la búsqueda en la base es exacta, no por coincidencias de nombre.
  useEffect(() => {
    if (!mostrarSugerencias || !campoActivo) return;
    const texto = campoActivo === 'correo' ? correo : telefono;
    const valido =
      campoActivo === 'correo' ? esEmailValido(texto) : texto.replace(/\D/g, '').length >= 6;
    const timer = setTimeout(() => {
      if (valido) void buscar(texto, campoActivo);
      else limpiar();
    }, 300);
    return () => clearTimeout(timer);
  }, [correo, telefono, campoActivo, mostrarSugerencias, buscar, limpiar]);

  function descartarSeleccion() {
    if (perfilSeleccionado) setPerfilSeleccionado(null);
  }

  function escribirNombre(valor: string) {
    setNombre(valor);
    descartarSeleccion();
    setCampoActivo(null);
    setMostrarSugerencias(false);
  }

  function escribirTelefono(valor: string) {
    setTelefono(valor);
    descartarSeleccion();
    setCampoActivo('telefono');
    setMostrarSugerencias(true);
  }

  function escribirCorreo(valor: string) {
    setCorreo(valor);
    descartarSeleccion();
    setCampoActivo('correo');
    setMostrarSugerencias(true);
  }

  function escribirRelacion(valor: string) {
    setRelacion(valor);
    descartarSeleccion();
  }

  function seleccionarPersona(persona: PersonaDirectorio) {
    setNombre(persona.nombre);
    if (persona.correo) setCorreo(persona.correo);
    if (persona.telefono) setTelefono(persona.telefono);
    setPerfilSeleccionado(persona);
    setMostrarSugerencias(false);
    setCampoActivo(null);
    limpiar();
    setError(null);
  }

  async function handleSave() {
    setError(null);
    if (nombre.trim().length < 2) {
      setError('Ingresa el nombre de la persona');
      return;
    }
    const tel = telefono.trim();
    const cor = correo.trim();
    if (tel && (!esTelefonoValido(tel) || tel.length > 25)) {
      setError('Ingresa un teléfono válido (entre 6 y 25 caracteres)');
      return;
    }
    if (cor && !esEmailValido(cor)) {
      setError('El correo no tiene un formato válido (o déjalo vacío)');
      return;
    }
    if (!tel && !cor) {
      setError('Agrega un teléfono o un correo para este contacto');
      return;
    }
    setSaving(true);

    // Como una solicitud de amistad: si el correo o teléfono pertenecen a una
    // usuaria registrada, se envía la solicitud aunque los haya escrito a mano.
    const personaEncontrada =
      perfilSeleccionado ??
      (cor ? await resolver(cor, 'correo') : null) ??
      (tel ? await resolver(tel, 'telefono') : null);

    if (personaEncontrada) {
      setPersonaSolicitada(personaEncontrada);
      const res = await enviar({
        destinatarioId: personaEncontrada.id,
        nombre,
        telefono,
        correo,
        relacion,
      });
      setSaving(false);
      if (res.error) {
        setError(res.error);
        return;
      }
      setSolicitudEnviada(true);
      return;
    }

    const res = await crear({ nombre, telefono, correo, relacion, es_principal: esPrincipal });
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.back();
  }

  if (solicitudEnviada) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <View style={styles.successWrap}>
            <View style={styles.successIcon}>
              <Ionicons name="paper-plane-outline" size={32} color={Palette.purple} />
            </View>
            <Text style={styles.successTitle}>¡Solicitud enviada!</Text>
            <Text style={styles.successText}>
              Le llegó una solicitud a {personaSolicitada?.nombre ?? nombre}. Cuando la acepte,
              las dos quedarán como contactos de confianza.
            </Text>
            <Text style={styles.successNote}>
              Puedes ver el estado en Contactos → Solicitudes.
            </Text>
            <Button title="Volver a contactos" onPress={() => router.back()} size="lg" fullWidth />
          </View>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={20} color={Palette.purple} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Nuevo contacto</Text>
          <Text style={styles.subtitle}>Recibirá tus alertas SOS.</Text>
        </View>
      </View>

      <Card>
        <View style={styles.form}>
          <Field icon="person-outline" placeholder="Nombre" value={nombre} onChangeText={escribirNombre} />
          <Field
            icon="call-outline"
            placeholder="Teléfono (opcional)"
            value={telefono}
            onChangeText={escribirTelefono}
            keyboardType="phone-pad"
          />
          <Field
            icon="mail-outline"
            placeholder="Correo (opcional)"
            value={correo}
            onChangeText={escribirCorreo}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Field
            icon="heart-outline"
            placeholder="Relación (madre, pareja, amiga...)"
            value={relacion}
            onChangeText={escribirRelacion}
          />

          {mostrarSugerencias && (buscando || sugerencias.length > 0) ? (
            <View style={styles.sugerencias}>
              <View style={styles.sugerenciasHeader}>
                <Text style={styles.sugerenciasTitle}>Personas registradas</Text>
                {buscando ? <ActivityIndicator size="small" color={Palette.purple} /> : null}
              </View>
              {sugerencias.map((persona) => (
                <Pressable
                  key={persona.id}
                  onPress={() => seleccionarPersona(persona)}
                  style={({ pressed }) => [styles.sugerencia, pressed && { opacity: 0.75 }]}>
                  <Avatar name={persona.nombre} size={38} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sugerenciaNombre}>{persona.nombre}</Text>
                    <Text style={styles.sugerenciaCorreo} numberOfLines={1}>
                      {campoActivo === 'telefono'
                        ? (persona.telefono ?? 'Sin teléfono registrado')
                        : (persona.correo ?? 'Sin correo registrado')}
                    </Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color={Palette.purple} />
                </Pressable>
              ))}
              <Text style={styles.sugerenciasHint}>
                Toca una persona para completar sus datos. Al guardar le enviaremos una solicitud.
              </Text>
            </View>
          ) : null}

          {errorBusqueda ? <Text style={styles.error}>{errorBusqueda}</Text> : null}

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleText}>Es mi contacto principal</Text>
              <Text style={styles.toggleDesc}>Será el primero en recibir tus alertas.</Text>
            </View>
            <Toggle value={esPrincipal} onChange={setEsPrincipal} />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            title={perfilSeleccionado ? 'Enviar solicitud' : 'Guardar contacto'}
            onPress={() => void handleSave()}
            loading={saving}
            size="lg"
            fullWidth
          />
        </View>
      </Card>

      <Text style={styles.note}>
        Si el correo o teléfono pertenece a una usuaria registrada, le enviaremos una solicitud.
        Recién cuando la acepte serán contactos de confianza.
      </Text>
    </ScrollView>
  );
}

function Field({
  icon,
  ...props
}: React.ComponentProps<typeof TextInput> & { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.field}>
      <Ionicons name={icon} size={18} color={Palette.muted} />
      <TextInput placeholderTextColor="#9A8BA8" {...props} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Palette.background, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
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
  title: { fontSize: 22, fontWeight: '800', color: Palette.ink, letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontWeight: '600', color: Palette.muted, marginTop: 2 },
  form: { gap: 12 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 14, color: Palette.ink },
  sugerencias: {
    backgroundColor: Palette.purpleMist,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  sugerenciasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sugerenciasTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Palette.purpleDeep,
  },
  sugerencia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  sugerenciaNombre: { fontSize: 14, fontWeight: '800', color: Palette.purpleDeep },
  sugerenciaCorreo: { fontSize: 12, fontWeight: '600', color: Palette.mutedStrong, marginTop: 1 },
  sugerenciasHint: { fontSize: 11, fontWeight: '600', color: Palette.mutedStrong, marginTop: 2 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 14,
    gap: 12,
  },
  toggleText: { color: Palette.ink, fontSize: 14, fontWeight: '800' },
  toggleDesc: { color: Palette.muted, fontSize: 11, fontWeight: '600', marginTop: 2 },
  error: { color: Palette.danger, fontWeight: '700', fontSize: 13 },
  note: { color: Palette.muted, fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 16, lineHeight: 16 },
  successWrap: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  successIcon: {
    width: 68,
    height: 68,
    borderRadius: Radius.pill,
    backgroundColor: Palette.purpleMist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 20, fontWeight: '800', color: Palette.purpleDeep, textAlign: 'center' },
  successText: { fontSize: 14, fontWeight: '600', color: Palette.ink, textAlign: 'center', lineHeight: 20 },
  successNote: { fontSize: 12, fontWeight: '600', color: Palette.muted, textAlign: 'center' },
});
