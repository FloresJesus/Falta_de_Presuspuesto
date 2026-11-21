import React from 'react';
import { Circle, G, Path, Rect, Svg } from 'react-native-svg';

const COLORS = {
  land: '#F0EAF9',
  landDark: '#2A1A38',
  block: '#D8C8E7',
  blockDark: '#3A2349',
  park: '#DCE8CC',
  parkDark: '#24331F',
  water: '#BFDFEA',
  waterDark: '#16313E',
  road: '#FFFFFF',
  roadDark: '#FAF9FF',
  roadLine: '#D6C8E3',
  roadLineDark: '#3A2349',
  primary: '#55147C',
  primaryDark: '#6A4A98',
  accent: '#55147C',
  userBg: '#FFFFFF',
  userStroke: '#55147C',
};

export function MapCanvas({
  latitude,
  longitude,
  status,
}: {
  latitude?: number | null;
  longitude?: number | null;
  status?: 'sharing' | 'idle' | 'error';
}) {
  const isDark = false;
  const land = isDark ? COLORS.landDark : COLORS.land;
  const block = isDark ? COLORS.blockDark : COLORS.block;
  const park = isDark ? COLORS.parkDark : COLORS.park;
  const water = isDark ? COLORS.waterDark : COLORS.water;
  const road = isDark ? COLORS.roadDark : COLORS.road;
  const roadLine = isDark ? COLORS.roadLineDark : COLORS.roadLine;

  return (
    <Svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
      <Rect x="0" y="0" width="300" height="300" fill={land} />
      {/* parques y agua */}
      <Rect x="20" y="20" width="70" height="70" rx="14" fill={park} />
      <Rect x="210" y="160" width="70" height="70" rx="14" fill={park} />
      <Path d="M0 250 C60 235 120 265 180 250 C240 235 260 250 300 240 L300 300 L0 300 Z" fill={water} />
      {/* manzanas */}
      <Rect x="110" y="40" width="46" height="40" rx="8" fill={block} />
      <Rect x="40" y="130" width="40" height="40" rx="8" fill={block} />
      <Rect x="180" y="90" width="44" height="44" rx="8" fill={block} />
      <Rect x="90" y="180" width="50" height="40" rx="8" fill={block} />
      {/* calles */}
      <Path d="M0 90 H300" stroke={road} strokeWidth="14" />
      <Path d="M0 150 H300" stroke={road} strokeWidth="14" />
      <Path d="M0 210 H300" stroke={road} strokeWidth="14" />
      <Path d="M60 0 V300" stroke={road} strokeWidth="14" />
      <Path d="M150 0 V300" stroke={road} strokeWidth="14" />
      <Path d="M0 90 H300" stroke={roadLine} strokeWidth="1.5" strokeDasharray="10 12" />
      <Path d="M60 0 V300" stroke={roadLine} strokeWidth="1.5" strokeDasharray="10 12" />
      <Path d="M0 150 H300" stroke={roadLine} strokeWidth="1.5" strokeDasharray="10 12" />
      <Path d="M150 0 V300" stroke={roadLine} strokeWidth="1.5" strokeDasharray="10 12" />
      {/* ruta hacia el destino */}
      <Path
        d="M60 250 C 90 200, 130 190, 150 150"
        fill="none"
        stroke={status === 'sharing' ? '#55147C' : COLORS.primary}
        strokeWidth="4"
        strokeDasharray="2 8"
        strokeLinecap="round"
      />
      {/* marcador de usuario */}
      {status === 'sharing' ? (
        <G>
          <Circle cx="60" cy="250" r="26" fill={COLORS.primary} opacity="0.18" />
          <Circle cx="60" cy="250" r="14" fill={COLORS.userBg} stroke={COLORS.userStroke} strokeWidth="5" />
        </G>
      ) : (
        <G>
          <Circle cx="60" cy="250" r="22" fill={COLORS.primaryDark} opacity="0.18" />
          <Circle cx="60" cy="250" r="10" fill={COLORS.userBg} stroke={COLORS.userStroke} strokeWidth="4" />
        </G>
      )}
      {/* marcador de destino */}
      <G>
        <Path d="M150 132 C 142 132 137 126 137 119 C 137 111 150 103 150 103 C 150 103 163 111 163 119 C 163 126 157 132 150 132 Z" fill={COLORS.accent} />
        <Circle cx="150" cy="119" r="4.5" fill="#FFFFFF" />
      </G>
    </Svg>
  );
}
