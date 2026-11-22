import { Svg, Path, Rect, Circle } from 'react-native-svg';

/** Balanza de la justicia, para la categoría legal. */
export function ScaleIcon({ size = 36, color = '#2E9E6B' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path d="M16 5v21" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M10 26h12" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M6 9h20" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M6 9l-3 8M6 9l3 8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M1.5 17c1 2.6 2.5 4.2 4.5 4.2s3.5-1.6 4.5-4.2" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M26 9l-3 8M26 9l3 8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M21.5 17c1 2.6 2.5 4.2 4.5 4.2s3.5-1.6 4.5-4.2" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={16} cy={4.2} r={1.5} fill={color} />
    </Svg>
  );
}

/** Cruz médica, para la categoría salud. */
export function CrossIcon({ size = 34, color = '#E5484D' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Rect x={12} y={5} width={8} height={22} rx={2.2} fill={color} />
      <Rect x={5} y={12} width={22} height={8} rx={2.2} fill={color} />
    </Svg>
  );
}
