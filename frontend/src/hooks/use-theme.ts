/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';

/**
 * MASI está diseñada únicamente en modo claro (`userInterfaceStyle: "light"`
 * en app.json). En web el esquema del sistema no se respeta igual que en
 * nativo, por lo que usamos siempre la paleta clara: así las tarjetas y
 * textos mantienen el contraste de la marca en cualquier dispositivo.
 */
export function useTheme() {
  return Colors.light;
}
