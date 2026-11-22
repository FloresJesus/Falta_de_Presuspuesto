import React from 'react';
import { Circle, G, Path, Rect, Svg, Text as SvgText } from 'react-native-svg';

const COLORS = {
  land: '#EDE0F4',
  block: '#E2D0EE',
  park: '#D9EAC9',
  water: '#CFE8F2',
  road: '#FFFFFF',
  roadLine: '#E4D6EE',
  label: '#A897B2',
  primary: '#4E1D71',
  primaryDark: '#2E0F45',
  accent: '#F22969',
  userBg: '#FFFFFF',
  userStroke: '#4E1D71',
};

export function MapCanvas({
  latitude,
  longitude,
  status,
  markers = true,
}: {
  latitude?: number | null;
  longitude?: number | null;
  status?: 'sharing' | 'idle' | 'error';
  markers?: boolean;
}) {
  return (
    <Svg viewBox="0 0 300 600" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
      <Rect x="0" y="0" width="300" height="600" fill={COLORS.land} />

      {/* parques */}
      <Rect x="-20" y="30" width="110" height="140" rx="18" fill={COLORS.park} />
      <Rect x="215" y="150" width="105" height="150" rx="20" fill={COLORS.park} />
      <Rect x="-10" y="420" width="120" height="110" rx="18" fill={COLORS.park} />
      <Rect x="205" y="470" width="110" height="150" rx="20" fill={COLORS.park} />
      <Rect x="120" y="560" width="90" height="60" rx="14" fill={COLORS.water} />

      {/* manzanas */}
      <Rect x="110" y="20" width="34" height="46" rx="7" fill={COLORS.block} />
      <Rect x="175" y="20" width="30" height="46" rx="7" fill={COLORS.block} />
      <Rect x="30" y="200" width="40" height="36" rx="7" fill={COLORS.block} />
      <Rect x="120" y="185" width="38" height="40" rx="7" fill={COLORS.block} />
      <Rect x="200" y="330" width="36" height="44" rx="7" fill={COLORS.block} />
      <Rect x="60" y="330" width="30" height="40" rx="7" fill={COLORS.block} />
      <Rect x="130" y="420" width="40" height="48" rx="7" fill={COLORS.block} />
      <Rect x="235" y="400" width="26" height="40" rx="7" fill={COLORS.block} />

      {/* calles principales */}
      <Path d="M0 90 H300" stroke={COLORS.road} strokeWidth="18" />
      <Path d="M0 175 H300" stroke={COLORS.road} strokeWidth="14" />
      <Path d="M0 265 H300" stroke={COLORS.road} strokeWidth="18" />
      <Path d="M0 360 H300" stroke={COLORS.road} strokeWidth="14" />
      <Path d="M0 455 H300" stroke={COLORS.road} strokeWidth="18" />
      <Path d="M0 545 H300" stroke={COLORS.road} strokeWidth="14" />

      <Path d="M55 0 V600" stroke={COLORS.road} strokeWidth="16" />
      <Path d="M145 0 V600" stroke={COLORS.road} strokeWidth="20" />
      <Path d="M235 0 V600" stroke={COLORS.road} strokeWidth="16" />

      {/* diagonales */}
      <Path d="M-10 250 L310 170" stroke={COLORS.road} strokeWidth="13" strokeLinecap="round" />
      <Path d="M-10 500 L310 430" stroke={COLORS.road} strokeWidth="13" strokeLinecap="round" />

      {/* líneas de calzada */}
      <Path d="M0 90 H300 M0 265 H300 M0 455 H300" stroke={COLORS.roadLine} strokeWidth="1.4" strokeDasharray="8 10" />
      <Path d="M145 0 V600" stroke={COLORS.roadLine} strokeWidth="1.4" strokeDasharray="8 10" />
      <Path d="M-10 250 L310 170" stroke={COLORS.roadLine} strokeWidth="1.2" strokeDasharray="6 9" />
      <Path d="M-10 500 L310 430" stroke={COLORS.roadLine} strokeWidth="1.2" strokeDasharray="6 9" />

      {/* rótulos */}
      <SvgText x="18" y="355" fontSize="6" fontWeight="600" fill={COLORS.label}>
        Calle Bolívar
      </SvgText>
      <SvgText x="185" y="445" fontSize="6" fontWeight="600" fill={COLORS.label}>
        Av. Arce
      </SvgText>

      {markers ? (
        <>
          <Path
            d="M70 500 C 100 430, 160 380, 200 270"
            fill="none"
            stroke={COLORS.primary}
            strokeWidth="3.5"
            strokeDasharray="2 7"
            strokeLinecap="round"
          />
          <G>
            <Circle cx="70" cy="500" r="26" fill={COLORS.primary} opacity="0.18" />
            <Circle cx="70" cy="500" r="13" fill={COLORS.userBg} stroke={COLORS.userStroke} strokeWidth="4" />
          </G>
          <G>
            <Path
              d="M200 252 C 192 252 187 246 187 239 C 187 231 200 223 200 223 C 200 223 213 231 213 239 C 213 246 208 252 200 252 Z"
              fill={COLORS.accent}
            />
            <Circle cx="200" cy="239" r="4" fill="#FFFFFF" />
          </G>
        </>
      ) : null}
    </Svg>
  );
}
