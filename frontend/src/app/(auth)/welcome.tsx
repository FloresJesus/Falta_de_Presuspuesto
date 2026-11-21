import { ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui';

const FEATURES = [
  { icon: '🛡️', title: 'Alerta SOS con red de apoyo', text: 'Conecta con una persona de confianza y activa una alerta en segundos.' },
  { icon: '📍', title: 'Acompañamiento seguro', text: 'Comparte tu ubicación solo durante un acompañamiento autorizado.' },
  { icon: '📚', title: 'Educación y rutas de ayuda', text: 'Aprende señales de alerta y conoce dónde denunciar en Bolivia.' },
];

export default function WelcomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Image
          source={require('@/assets/images/logos.png')}
          style={{ width: 170, height: 170, borderRadius: 44, overflow: 'hidden' }}
          resizeMode="cover"
        />
        <Text style={styles.tagline}>Tu seguridad. Siempre contigo.</Text>
      </View>

      <View style={styles.features}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureCard}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button title="Comenzar" onPress={() => router.push('/register')} size="lg" fullWidth />
        <Button title="Iniciar sesión" onPress={() => router.push('/login')} variant="outline" size="lg" fullWidth />
      </View>

      <Text style={styles.footer}>LÍA · Acompañamiento en seguridad personal</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAF9FF', paddingHorizontal: 24, paddingTop: 48, paddingBottom: 28 },
  hero: { alignItems: 'center', marginTop: 24 },
  logoWrap: {
    width: 170,
    height: 170,
    borderRadius: 44,
    backgroundColor: '#55147C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#55147C',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  tagline: { color: '#6B5C7C', fontSize: 15, fontWeight: '600', textAlign: 'center', marginTop: 14, maxWidth: 300 },
  features: { marginTop: 30, gap: 10 },
  featureCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#E7DDF2' },
  featureIcon: { fontSize: 26 },
  featureTitle: { color: '#22147C', fontSize: 14, fontWeight: '800' },
  featureText: { color: '#6B5C7C', fontSize: 12, fontWeight: '600', marginTop: 2 },
  actions: { marginTop: 'auto', gap: 10 },
  footer: { textAlign: 'center', color: '#6B5C7C', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 18 },
});
