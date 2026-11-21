import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Avatar, Button, Card } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useContactos } from '@/hooks/useContactos';
import { useSesion } from '@/hooks/useSesion';
import { EMERGENCIA_NUMERO } from '@/lib/utils';

export default function MasScreen() {
  const { profile } = useAuth();
  const { contactos } = useContactos();
  const { sesion } = useSesion();

  const principal = contactos.find((c) => c.es_principal) ?? contactos[0];

  const opciones = [
    { icon: 'people', label: 'Mis contactos', route: '/contactos', desc: 'Red de apoyo y confidenciales' },
    { icon: 'map', label: 'Acompañamiento', route: '/compartir', desc: sesion ? 'Sesión activa' : 'Compartir ubicación' },
    { icon: 'shield', label: 'Instituciones', route: '/instituciones', desc: 'Directorio de ayuda' },
    { icon: 'sparkles', label: 'Asistente LÍA', route: '/asistente', desc: 'Orientación personalizada' },
    { icon: 'settings', label: 'Ajustes', route: '/ajustes', desc: 'Perfil y preferencias' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.profileCard}>
        <Avatar name={profile?.nombre ?? 'amiga'} size={60} />
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{profile?.nombre ?? 'Amiga LÍA'}</Text>
          <Text style={styles.profileEmail}>{profile?.correo ?? 'Sin correo registrado'}</Text>
        </View>
        <Button title="Editar" size="sm" variant="soft" onPress={() => router.push('/ajustes')} />
      </Card>

      <Card style={styles.sessionCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name={sesion ? 'pulse' : 'pause-circle'} size={20} color={sesion ? '#0E9F66' : '#6B5C7C'} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sessionTitle}>{sesion ? 'Acompañamiento en curso' : 'Sin acompañamiento activo'}</Text>
            <Text style={styles.sessionText}>{sesion ? `Con ${principal?.nombre ?? 'tu contacto'}` : 'Inicia uno cuando lo necesites'}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.menu}>
        {opciones.map((o) => (
          <Pressable key={o.label} onPress={() => router.push(o.route as never)} style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.85 }]}>
            <View style={styles.menuIcon}>
              <Ionicons name={o.icon as never} size={20} color="#55147C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>{o.label}</Text>
              <Text style={styles.menuDesc}>{o.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6B5C7C" />
          </Pressable>
        ))}
      </View>

      <Card style={styles.emergencyCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.emergencyTitle}>¿En una emergencia ahora?</Text>
          <Text style={styles.emergencyText}>Llama al <Text style={styles.emergencyTextBold}>{EMERGENCIA_NUMERO}</Text>. Si no puedes hablar, activa el SOS.</Text>
        </View>
        <Button title="SOS" onPress={() => router.push('/sos')} size="sm" variant="accent" />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAF9FF', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 100 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileName: { color: '#22147C', fontSize: 17, fontWeight: '800' },
  profileEmail: { color: '#6B5C7C', fontSize: 12, fontWeight: '600', marginTop: 2 },
  sessionCard: { marginTop: 12 },
  sessionTitle: { color: '#22147C', fontSize: 14, fontWeight: '800' },
  sessionText: { color: '#6B5C7C', fontSize: 12, fontWeight: '600', marginTop: 2 },
  menu: { marginTop: 14, gap: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#E7DDF2' },
  menuIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#EFE7F8', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { color: '#22147C', fontSize: 14, fontWeight: '800' },
  menuDesc: { color: '#6B5C7C', fontSize: 12, fontWeight: '600', marginTop: 2 },
  emergencyCard: { marginTop: 14, backgroundColor: '#FBE7E8', borderWidth: 0 },
  emergencyTitle: { color: '#E5484D', fontSize: 15, fontWeight: '800' },
  emergencyText: { color: '#8A3A40', fontSize: 12, fontWeight: '600', marginTop: 2, flex: 1 },
  emergencyTextBold: { fontWeight: '800' },
});
