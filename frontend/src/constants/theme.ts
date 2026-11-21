/**
 * Tema de marca de LÍA / MASI.
 * Paleta principal: primary #55147C, secondary #22147C, third #FAF9FF.
 * Los tonos claros se derivan de esos tres colores; los colores de estado
 * (éxito/peligro/advertencia) se conservan por motivos funcionales.
 */

import { Platform, StyleSheet } from 'react-native';

export const Colors = {
  light: {
    text: '#22147C',
    background: '#FAF9FF',
    backgroundElement: '#F0EAF9',
    backgroundSelected: '#E7D8F2',
    textSecondary: '#6B5C7C',
    primary: '#55147C',
    primaryDark: '#22147C',
    primarySoft: '#EFE7F8',
    accent: '#55147C',
    accentDark: '#22147C',
    accentSoft: '#EFE7F8',
    secondary: '#22147C',
    secondarySoft: '#F3ECFA',
    surface: '#FFFFFF',
    border: '#E7DDF2',
    success: '#0E9F66',
    successSoft: '#DDF5E9',
    danger: '#E5484D',
    dangerSoft: '#FBE7E8',
    warning: '#C77400',
    warningSoft: '#FCEEDA',
    mapLand: '#F0EAF9',
    mapPark: '#E3EED8',
    mapWater: '#DAEAF3',
    shadow: 'rgba(85, 20, 124, 0.12)',
  },
  dark: {
    text: '#FAF9FF',
    background: '#150C25',
    backgroundElement: '#1E1130',
    backgroundSelected: '#2A1645',
    textSecondary: '#C9BED6',
    primary: '#8F6DB5',
    primaryDark: '#6A4A98',
    primarySoft: '#2A1645',
    accent: '#8F6DB5',
    accentDark: '#B99FD0',
    accentSoft: '#2A1645',
    secondary: '#C9BED6',
    secondarySoft: '#241436',
    surface: '#1E1130',
    border: '#3A2349',
    success: '#2FC484',
    successSoft: '#123326',
    danger: '#F2717A',
    dangerSoft: '#3C1820',
    warning: '#E8A33D',
    warningSoft: '#3A2A10',
    mapLand: '#2A1A38',
    mapPark: '#22351F',
    mapWater: '#16313E',
    shadow: 'rgba(0, 0, 0, 0.4)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 560;

export const Type = StyleSheet.create({
  h1: { fontSize: 32, fontWeight: '800', lineHeight: 40, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '800', lineHeight: 30, letterSpacing: -0.3 },
  h3: { fontSize: 19, fontWeight: '700', lineHeight: 25 },
  subtitle: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  smallBold: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '700', lineHeight: 16 },
  label: {
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
});
