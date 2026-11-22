import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { Colors, Gradients, Palette, Radius, Shadows, Spacing } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'soft' | 'light';

const GRADIENT_BY_VARIANT: Record<string, readonly [string, string, ...string[]]> = {
  primary: Gradients.primary,
  accent: Gradients.accent,
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}) {
  const theme = useTheme();
  const padding = size === 'lg' ? 16 : size === 'sm' ? 10 : 13;
  const fontSize = size === 'lg' ? 16 : size === 'sm' ? 13 : 15;
  const gradient = GRADIENT_BY_VARIANT[variant];
  const solidBg =
    variant === 'danger'
      ? theme.danger
      : variant === 'soft'
        ? theme.primarySoft
        : variant === 'light'
          ? 'rgba(255,255,255,0.14)'
          : 'transparent';
  const fg =
    variant === 'outline' || variant === 'ghost' || variant === 'soft'
      ? theme.primary
      : Palette.surface;
  const border =
    variant === 'outline' ? theme.primary : variant === 'light' ? 'rgba(255,255,255,0.32)' : 'transparent';

  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two }}>
      {loading ? <ActivityIndicator size="small" color={fg} /> : icon}
      <Text style={[styles.text, { color: fg, fontSize }]}>{title}</Text>
    </View>
  );

  const containerStyle = [
    styles.button,
    {
      borderColor: disabled ? theme.border : border,
      paddingVertical: padding,
      paddingHorizontal: size === 'lg' ? 28 : Spacing.four,
      opacity: disabled ? 0.55 : 1,
    },
    fullWidth ? styles.full : null,
  ];

  if (gradient && !disabled) {
    return (
      <Pressable
        onPress={onPress}
        disabled={loading}
        style={({ pressed }) => [containerStyle, styles.gradientButton, pressed && { transform: [{ scale: 0.985 }], opacity: 0.94 }]}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        containerStyle,
        { backgroundColor: disabled ? theme.backgroundElement : solidBg },
        pressed && { opacity: 0.88 },
      ]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    overflow: 'hidden',
  },
  gradientButton: {
    backgroundColor: Palette.purple,
    ...(Shadows.card ?? {}),
  },
  full: { alignSelf: 'stretch' },
  text: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cardPress: { borderRadius: Radius.xl },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chipText: { fontSize: 13, fontWeight: '700' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  emptyIcon: { opacity: 0.9 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  headerRight: { minWidth: 36, alignItems: 'flex-end' },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  knob: { width: 22, height: 22, borderRadius: 11 },
  progressTrack: { height: 10, borderRadius: Radius.pill, backgroundColor: '#EADFF2', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radius.pill },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.five, marginBottom: Spacing.three },
});

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const inner = (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: Radius.xl,
          padding: Spacing.four,
          borderWidth: 1,
          borderColor: theme.border,
          ...(Shadows.card ?? {}),
        },
        style,
      ]}>
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }, styles.cardPress]}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

export function Hero({
  children,
  colors = Gradients.hero,
  style,
}: {
  children: React.ReactNode;
  colors?: readonly [string, string, ...string[]];
  style?: any;
}) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: Radius.xxl, padding: Spacing.four + 2, overflow: 'hidden' }, style]}>
      {children}
    </LinearGradient>
  );
}

export function IconBubble({
  children,
  size = 48,
  background = Palette.purpleSoft,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  background?: string;
  style?: any;
}) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: Math.round(size / 3),
          backgroundColor: background,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function Badge({
  children,
  variant = 'neutral',
  style,
}: {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'accent' | 'primary';
  style?: any;
}) {
  const theme = useTheme();
  const bg =
    variant === 'success'
      ? theme.successSoft
      : variant === 'warning'
        ? theme.warningSoft
        : variant === 'accent'
          ? theme.accentSoft
          : variant === 'primary'
            ? theme.primarySoft
            : theme.backgroundElement;
  const fg =
    variant === 'success'
      ? theme.success
      : variant === 'warning'
        ? theme.warning
        : variant === 'accent'
          ? theme.accent
          : theme.primary;
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: Radius.pill,
          paddingHorizontal: Spacing.two + Spacing.one,
          paddingVertical: 3,
          alignSelf: 'flex-start',
        },
        style,
      ]}>
      <Text style={{ color: fg, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {children}
      </Text>
    </View>
  );
}

export function Chip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.surface,
          borderColor: selected ? theme.primary : theme.border,
          ...(selected ? (Shadows.card ?? {}) : {}),
        },
        pressed ? { opacity: 0.85 } : null,
      ]}>
      <Text style={[styles.chipText, { color: selected ? Palette.surface : theme.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  const gradientes = [
    Gradients.primary,
    Gradients.accent,
    Gradients.lavender,
    ['#8F57B8', '#4E1D71'] as const,
    ['#F06AA0', '#D8125A'] as const,
  ];
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colors = gradientes[hash % gradientes.length];
  const inicialesCad = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.55)',
      }}>
      <Text style={{ color: Palette.surface, fontSize: size * 0.34, fontWeight: '800' }}>{inicialesCad}</Text>
    </LinearGradient>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.empty}>
      {icon ? <View style={styles.emptyIcon}>{icon}</View> : null}
      <Text style={[{ color: theme.text, fontSize: 17, fontWeight: '800', textAlign: 'center' }]}>{title}</Text>
      {message ? (
        <Text style={[{ color: theme.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 6 }]}>
          {message}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: Spacing.three, alignSelf: 'stretch' }}>{action}</View> : null}
    </View>
  );
}

export function Spinner({ color }: { color?: string }) {
  const theme = useTheme();
  return <ActivityIndicator size="small" color={color ?? theme.primary} />;
}

export function Header({
  title,
  subtitle,
  right,
  onBack,
  variant = 'default',
  light = false,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  variant?: 'default' | 'centered';
  light?: boolean;
}) {
  const theme = useTheme();
  const titleColor = light ? Palette.surface : theme.text;
  const subtitleColor = light ? 'rgba(255,255,255,0.75)' : theme.textSecondary;
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={[styles.backBtn, light ? { backgroundColor: 'rgba(255,255,255,0.16)', borderColor: 'rgba(255,255,255,0.25)' } : null]}>
          <Ionicons name="chevron-back" size={20} color={light ? Palette.surface : theme.primary} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: titleColor,
            fontSize: variant === 'centered' ? 22 : 24,
            fontWeight: '800',
            letterSpacing: -0.3,
          }}
          numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ color: subtitleColor, fontSize: 13, fontWeight: '600', marginTop: 2 }}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View style={styles.headerRight}>{right}</View> : null}
    </View>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.2 }}>{title}</Text>
        {subtitle ? (
          <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 2 }}>{subtitle}</Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export function Toggle({ value, onChange, activeColor }: { value: boolean; onChange: (v: boolean) => void; activeColor?: string }) {
  const theme = useTheme();
  const activo = activeColor ?? theme.primary;
  return (
    <Pressable onPress={() => onChange(!value)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
      <View
        style={[
          styles.toggle,
          {
            backgroundColor: value ? activo : theme.backgroundSelected,
            borderColor: value ? activo : theme.border,
          },
        ]}>
        <View
          style={[
            styles.knob,
            {
              backgroundColor: value ? Palette.surface : theme.textSecondary,
              transform: value ? 'translateX(20px)' : 'translateX(2px)',
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

export function ProgressBar({ value, max, color }: { value: number; max: number; color?: string }) {
  const theme = useTheme();
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: color ?? theme.primary }]} />
    </View>
  );
}

/** Tarjeta de acceso rápido del inicio (ícono + etiqueta). */
export function QuickAction({
  icon,
  label,
  tint = Palette.purpleSoft,
  iconColor = Palette.purple,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tint?: string;
  iconColor?: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: '48%',
          backgroundColor: theme.surface,
          borderRadius: Radius.lg,
          padding: 14,
          borderWidth: 1,
          borderColor: theme.border,
          ...(Shadows.card ?? {}),
        },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
      ]}>
      <IconBubble background={tint} size={46}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </IconBubble>
      <Text style={{ color: theme.text, fontSize: 13, fontWeight: '800', marginTop: 10 }}>{label}</Text>
    </Pressable>
  );
}

/** Pastilla de estado con punto de color (En línea, Acompañamiento, etc.). */
export function StatusPill({
  label,
  tone = 'on',
}: {
  label: string;
  tone?: 'on' | 'off' | 'light';
}) {
  const bg = tone === 'on' ? Palette.success : tone === 'light' ? 'rgba(255,255,255,0.16)' : Palette.surface;
  const fg = tone === 'off' ? Palette.muted : Palette.surface;
  const dot = tone === 'on' ? Palette.surface : tone === 'light' ? Palette.success : Palette.muted;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: bg,
        borderRadius: Radius.pill,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderWidth: tone === 'off' ? 1 : 0,
        borderColor: Palette.border,
      }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot }} />
      <Text style={{ color: fg, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </View>
  );
}

const CONTACT_SOURCES = [
  require('@/assets/images/masi/contact-0.png'),
  require('@/assets/images/masi/contact-1.png'),
  require('@/assets/images/masi/contact-2.png'),
  require('@/assets/images/masi/contact-3.png'),
];

/** Avatar circular de la mascota MASI (incluye anillo blanco). */
export function MascotAvatar({ size = 48, variant, style }: { size?: number; variant?: number; style?: any }) {
  const source = variant == null ? require('@/assets/images/masi/avatar.png') : CONTACT_SOURCES[((variant % 4) + 4) % 4];
  return (
    <Image
      source={source}
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        variant != null ? { borderWidth: 2, borderColor: '#FFFFFF' } : null,
        style,
      ]}
      resizeMode="cover"
    />
  );
}

/** Mascota completa sin fondo, para héroes y tarjetas. */
export function Mascot({ height = 120, style }: { height?: number; style?: any }) {
  const width = (height * 297) / 333;
  return (
    <Image
      source={require('@/assets/images/masi/mascot.png')}
      style={[{ width, height }, style]}
      resizeMode="contain"
    />
  );
}

/** Logotipo MASI completo (M + pin + !Si + ondas). */
export function BrandLogo({ width = 200, style }: { width?: number; style?: any }) {
  const height = (width * 694) / 598;
  return (
    <Image
      source={require('@/assets/images/masi/logo.png')}
      style={[{ width, height }, style]}
      resizeMode="contain"
    />
  );
}

/** Recuadro de icono con esquinas redondeadas y color de fondo. */
export function IconTile({
  icon,
  size = 64,
  background = Palette.lilac,
  color = Palette.purple,
  iconSize,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  background?: string;
  color?: string;
  iconSize?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Ionicons name={icon} size={iconSize ?? Math.round(size * 0.45)} color={color} />
    </View>
  );
}

export { Colors };
