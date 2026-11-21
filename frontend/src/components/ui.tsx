import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Colors, Spacing } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'soft';

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
  const padding = size === 'lg' ? Spacing.four + Spacing.two : size === 'sm' ? Spacing.two + Spacing.one : Spacing.three;
  const fontSize = size === 'lg' ? 16 : size === 'sm' ? 13 : 15;
  const bg =
    variant === 'primary'
      ? theme.primary
      : variant === 'accent'
        ? theme.accent
        : variant === 'soft'
          ? theme.primarySoft
          : variant === 'danger'
            ? theme.danger
            : variant === 'outline'
              ? 'transparent'
              : theme.backgroundElement;
  const fg = variant === 'outline' || variant === 'ghost' || variant === 'soft' ? theme.primary : theme.surface;
  const border =
    variant === 'outline'
      ? theme.primary
      : variant === 'ghost'
        ? 'transparent'
        : 'transparent';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled ? (theme.backgroundElement as string) : (bg as string),
          borderColor: disabled ? theme.border : (border as string),
          paddingVertical: padding,
          paddingHorizontal: size === 'lg' ? Spacing.five + Spacing.one : Spacing.four,
          opacity: disabled ? 0.6 : pressed ? 0.88 : 1,
        },
        fullWidth ? styles.full : null,
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two }}>
        {loading ? <ActivityIndicator size="small" color={fg as string} /> : icon}
        <Text style={[styles.text, { color: fg as string, fontSize, fontWeight: 700 }]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    overflow: 'hidden',
  },
  full: { alignSelf: 'stretch' },
  text: {
    fontFamily: 'System' as never,
    fontWeight: '700',
  },
  cardPress: { borderRadius: 20 },
  chip: {
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chipText: { fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.six, paddingHorizontal: Spacing.five, gap: Spacing.two },
  emptyIcon: { opacity: 0.9 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  backBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  headerRight: { minWidth: 36, alignItems: 'flex-end' },
  toggle: { width: 46, height: 28, borderRadius: 999, borderWidth: 1.5, justifyContent: 'center', paddingHorizontal: 3 },
  knob: { width: 20, height: 20, borderRadius: 10 },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
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
    <View style={[{ backgroundColor: theme.surface, borderRadius: 20, padding: Spacing.four, borderWidth: 1, borderColor: theme.border }, style]}>
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
  const fg = variant === 'success' ? theme.success : variant === 'warning' ? theme.warning : variant === 'accent' ? theme.accent : theme.primary;
  return (
    <View style={[{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: Spacing.two + Spacing.one, paddingVertical: Spacing.half, alignSelf: 'flex-start' }, style]}>
      <Text style={[{ color: fg, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }]}>{children}</Text>
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
        { backgroundColor: selected ? theme.primary : theme.surface, borderColor: selected ? theme.primary : theme.border },
        pressed ? { opacity: 0.85 } : null,
      ]}>
      <Text style={[styles.chipText, { color: selected ? theme.surface : theme.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Avatar({
  name,
  size = 48,
}: {
  name: string;
  size?: number;
}) {
  const theme = useTheme();
  const colores = [theme.primary, theme.accent, theme.secondary, theme.success, theme.warning];
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const bg = colores[hash % colores.length];
  const fg = Colors.light.surface;
  const inicialesCad = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ color: fg, fontSize: size * 0.36, fontWeight: '800' }}>{inicialesCad}</Text>
    </View>
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
      {message ? <Text style={[{ color: theme.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 6 }]}>{message}</Text> : null}
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
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  variant?: 'default' | 'centered';
}) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: theme.primary, fontSize: 22, fontWeight: '800' }}>‹</Text>
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={[{ color: theme.text, fontSize: variant === 'centered' ? 22 : 24, fontWeight: '800' }]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 600, marginTop: 2 }}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View style={styles.headerRight}>{right}</View> : null}
    </View>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={[{ color: theme.text, fontSize: 18, fontWeight: '800' }]}>{title}</Text>
        {subtitle ? <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 600, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={() => onChange(!value)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
      <View
        style={[
          styles.toggle,
          { backgroundColor: value ? theme.primary : theme.backgroundSelected, borderColor: value ? theme.primary : theme.border },
        ]}>
        <View style={[styles.knob, { backgroundColor: value ? theme.surface : theme.textSecondary, transform: value ? 'translateX(20px)' : 'translateX(2px)' }]} />
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

