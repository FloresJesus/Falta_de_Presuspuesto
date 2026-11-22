/**
 * Tema de marca de LÍA / MÁSi.
 *
 * Paleta base solicitada:
 *   - #55147C  morado principal
 *   - #22147C  azul profundo (texto / contraste)
 *   - #FAF9FF  fondo casi blanco
 *
 * Acento del mockup:
 *   - #F32969  rosa (CTA principal y SOS)
 *   - #DDB4E6  lila secundario
 *
 * Los colores de estado (éxito/peligro/advertencia) se conservan por
 * motivos funcionales y de accesibilidad.
 */

import { Platform, StyleSheet } from 'react-native';

export const Palette = {
  purple: '#4E1D71',
  purpleDeep: '#2E0F45',
  purpleSoft: '#F0E3F6',
  purpleMist: '#F6EAF9',
  pink: '#F22969',
  pinkDeep: '#D8125A',
  pinkSoft: '#FDE3EC',
  lilac: '#ECD5F2',
  lilacSoft: '#F6EAF9',
  background: '#FBF6FC',
  surface: '#FFFFFF',
  ink: '#4E1D71',
  muted: '#8A7B93',
  /** Texto secundario con contraste suficiente sobre fondos claros. */
  mutedStrong: '#6E5C7B',
  border: '#F0E6F3',
  success: '#2EBF70',
  successSoft: '#DDF5E9',
  danger: '#E5484D',
  dangerSoft: '#FBE7E8',
  warning: '#C77400',
  warningSoft: '#FCEEDA',
} as const;

/** Degradados reutilizables para héroes, botones y fondos. */
export const Gradients = {
  hero: ['#5B1F7A', '#4E1D71', '#3E185A'] as const,
  primary: ['#5E2386', '#4E1D71'] as const,
  accent: ['#FF5C86', '#F22969', '#D8125A'] as const,
  soft: ['#FBF6FC', '#F3E4F8'] as const,
  lavender: ['#ECD5F2', '#DDBCE8'] as const,
};

export const Colors = {
  light: {
    text: Palette.ink,
    background: Palette.background,
    backgroundElement: '#F6EAF9',
    backgroundSelected: '#ECD5F2',
    textSecondary: Palette.muted,
    primary: Palette.purple,
    primaryDark: Palette.purpleDeep,
    primarySoft: Palette.purpleSoft,
    accent: Palette.pink,
    accentDark: Palette.pinkDeep,
    accentSoft: Palette.pinkSoft,
    secondary: Palette.lilac,
    secondarySoft: Palette.lilacSoft,
    surface: Palette.surface,
    border: Palette.border,
    success: Palette.success,
    successSoft: Palette.successSoft,
    danger: Palette.danger,
    dangerSoft: Palette.dangerSoft,
    warning: Palette.warning,
    warningSoft: Palette.warningSoft,
    mapLand: '#EDE0F4',
    mapPark: '#D9EAC9',
    mapWater: '#D6E8F2',
    shadow: 'rgba(78, 29, 113, 0.14)',
  },
  dark: {
    text: '#FAF9FF',
    background: '#150C25',
    backgroundElement: '#1E1130',
    backgroundSelected: '#2A1645',
    textSecondary: '#C9BED6',
    primary: '#B98BD8',
    primaryDark: '#8F6DB5',
    primarySoft: '#2A1645',
    accent: '#FF6B93',
    accentDark: '#F32969',
    accentSoft: '#3C1828',
    secondary: '#DDB4E6',
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

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
  pill: 999,
} as const;

export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: Palette.purple,
      shadowOpacity: 0.1,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 3 },
    default: {},
  }),
  floating: Platform.select({
    ios: {
      shadowColor: Palette.purple,
      shadowOpacity: 0.22,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
    },
    android: { elevation: 8 },
    default: {},
  }),
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
