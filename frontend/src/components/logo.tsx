import React from 'react';
import { Circle, Ellipse, Path, Svg, Text } from 'react-native-svg';

/** Símbolo MASI: dos personas formando la "M" bajo un pin de ubicación. */
export function LogoMark({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      {/* Pin de ubicación */}
      <Path
        d="M60 8 C49 8 42 16 42 26 C42 38 60 50 60 50 C60 50 78 38 78 26 C78 16 71 8 60 8 Z"
        fill="#FAF9FF"
      />
      <Circle cx="60" cy="25" r="6" fill="#22147C" />
      {/* Dos figuras humanas que forman la M */}
      <Circle cx="38" cy="50" r="9" fill="#FFFFFF" />
      <Circle cx="82" cy="50" r="9" fill="#FFFFFF" />
      <Path
        d="M31 101 C31 77 37 64 48 64 C57 64 60 79 60 79 C60 79 63 64 72 64 C83 64 89 77 89 101"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="13"
        strokeLinecap="round"
      />
      {/* Órbita / anillo de protección */}
      <Ellipse
        cx="60"
        cy="86"
        rx="44"
        ry="12"
        transform="rotate(-8 60 86)"
        fill="none"
        stroke="#E7D8F2"
        strokeWidth="4"
      />
    </Svg>
  );
}

/** Wordmark MASI: "M" + triángulo de alerta (la A) + "Si" con ondas. */
export function LogoWordmark({
  size = 140,
  color = '#FAF9FF',
}: {
  size?: number;
  color?: string;
}) {
  const width = size * 1.45;
  const height = size * 0.45;
  return (
    <Svg width={width} height={height} viewBox="0 0 190 58">
      <Text x="0" y="44" fontSize="46" fontWeight="800" fill={color} fontFamily="System">
        M
      </Text>
      <Path d="M62 6 L48 46 L76 46 Z" fill="#55147C" />
      <Text x="62" y="40" fontSize="30" fontWeight="800" fill="#FFFFFF" fontFamily="System" textAnchor="middle">
        !
      </Text>
      <Text x="82" y="44" fontSize="46" fontWeight="800" fill={color} fontFamily="System">
        S
      </Text>
      <Text x="122" y="44" fontSize="46" fontWeight="800" fill={color} fontFamily="System">
        i
      </Text>
      {/* Ondas de señal */}
      <Path d="M141 10 C147 4 155 4 161 10" fill="none" stroke="#55147C" strokeWidth="3" strokeLinecap="round" />
      <Path d="M143 17 C149 11 157 11 163 17" fill="none" stroke="#55147C" strokeWidth="3" strokeLinecap="round" />
      <Path d="M145 24 C150 19 156 19 161 24" fill="none" stroke="#55147C" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function Logo({ size = 120 }: { size?: number }) {
  return <LogoMark size={size} />;
}
