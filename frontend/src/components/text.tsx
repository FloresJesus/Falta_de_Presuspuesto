import React from 'react';
import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';

const FAMILIES: Record<string, string> = {
  '100': 'Poppins_400Regular',
  '200': 'Poppins_400Regular',
  '300': 'Poppins_400Regular',
  '400': 'Poppins_400Regular',
  normal: 'Poppins_400Regular',
  '500': 'Poppins_500Medium',
  '600': 'Poppins_600SemiBold',
  '700': 'Poppins_700Bold',
  bold: 'Poppins_700Bold',
  '800': 'Poppins_800ExtraBold',
  '900': 'Poppins_800ExtraBold',
};

/**
 * Texto con la tipografía de la marca (Poppins).
 * Elige el peso según `fontWeight` para que se vea igual en iOS, Android y web.
 */
export function Text({ style, ...rest }: TextProps) {
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const weight = String(flat?.fontWeight ?? '400');
  const family = flat?.fontFamily ?? FAMILIES[weight] ?? 'Poppins_400Regular';
  return <RNText {...rest} style={[style, { fontFamily: family, fontWeight: 'normal' }]} />;
}
