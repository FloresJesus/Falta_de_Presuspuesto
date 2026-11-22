import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Polygon } from 'react-native-svg';

import { BrandLogo, Button } from '@/components/ui';
import { Gradients, Palette } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <LinearGradient colors={Gradients.hero} start={{ x: 0.2, y: 0 }} end={{ x: 0.6, y: 1 }} style={styles.root}>
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice">
        <Polygon points="195,690 330,844 60,844" fill="rgba(0,0,0,0.10)" />
        <Polygon points="195,735 295,844 95,844" fill="rgba(0,0,0,0.08)" />
      </Svg>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.hero}>
          <BrandLogo width={190} />
          <Text style={styles.tagline}>Tu seguridad.{'\n'}Siempre contigo.</Text>
        </View>

        <View style={styles.actions}>
          <Button title="Comenzar" onPress={() => router.push('/register')} variant="accent" size="lg" fullWidth />
          <Pressable onPress={() => router.push('/login')} style={styles.loginBtn}>
            <Text style={styles.loginText}>Iniciar sesión</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 28 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  tagline: {
    color: Palette.surface,
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: -0.1,
    marginTop: 30,
  },
  actions: { paddingBottom: 8 },
  loginBtn: { alignItems: 'center', paddingVertical: 20 },
  loginText: { color: Palette.surface, fontSize: 16, fontWeight: '600' },
});
