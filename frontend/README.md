# LÍA — Acompañamiento en seguridad personal

Frontend móvil y web de **LÍA / MASI**, una red de apoyo para mujeres en Bolivia. Construido con Expo SDK 58 + Expo Router, conectado directamente al proyecto de Supabase con los datos iniciales (categorías, contenidos, cuestionario e instituciones).

## Paleta de marca

| Color | Código | Uso |
| --- | --- | --- |
| Primary | `#55147C` | Marca, botones, acentos y superficies destacadas |
| Secondary | `#22147C` | Texto principal, superficies oscuras y contraste |
| Third | `#FAF9FF` | Fondo general de la app |
| Derivados claros | `#EFE7F8` / `#E7D8F2` / `#F0EAF9` | Superficies suaves, bordes y fondos de elementos |
| Éxito / peligro / advertencia | `#0E9F66` / `#E5484D` / `#C77400` | Estados funcionales |

## Stack

- Expo 58, React 19, React Native 0.88, Expo Router (file-based routing)
- `@supabase/supabase-js` con persistencia de sesión en AsyncStorage
- `expo-location`, `expo-haptics`, `expo-linking`, `@expo/vector-icons`, `react-native-svg`
- TypeScript estricto + ESLint (Expo config)

## Inicio rápido

```bash
cd frontend
npm install
npx expo start
```

Para abrir en plataformas específicas: `npx expo start --android`, `npx expo start --ios`, `npx expo start --web`.

### Verificación

```bash
npx tsc --noEmit     # typecheck
npx expo lint        # lint
npx expo export --platform web   # build web estático (SPA)
```

## Estructura

```
src/
  app/
    _layout.tsx              # AuthProvider + Stack raíz
    index.tsx                # Redirect according to session
    (auth)/                  # welcome, login, register
    (app)/                   # inicio, mapa, educacion, mas (NativeTabs)
    sos.tsx                  # Alerta SOS con cuenta regresiva
    contactos/               # lista, nuevo, detalle
    instituciones.tsx / institucion/[id].tsx
    contenido/[id].tsx / cuestionario/[id].tsx
    asistente.tsx / ajustes.tsx / compartir.tsx
    seguimiento/[token].tsx  # vista pública del contacto
  components/                # ui, logo (SVG), MapCanvas (SVG), Markdown
  context/AuthContext.tsx
  hooks/                     # contactos, sesión, alertas, educación, asistente, ubicación
  lib/                       # supabase client, types, utils
  constants/theme.ts
```

## Supabase

El cliente (URL y anon key) está en `src/lib/supabase.ts`. Se usan las tablas y RPC existentes: `alertar_sos`, `iniciar_acompanamiento`, `finalizar_acompanamiento`, `registrar_ubicacion`, `obtener_cuestionario`, `responder_cuestionario`, `ubicacion_publica`. Las políticas RLS se respetan: el cliente usa la clave anónima y el `auth.uid()` de la sesión.

Datos semilla disponibles: 5 categorías educativas, 7 contenidos, 1 cuestionario de 3 preguntas y 3 instituciones de apoyo.

## Notas

- La salida web es `output: "single"` (SPA) en `app.json`: el modo `static` renderiza en Node y AsyncStorage/Supabase intentan acceder a `window` durante el prerenderizado.
- `src/app/(app)/_layout.tsx` usa `NativeTabs` en móvil. En web se usa `src/app/(app)/_layout.web.tsx` con **JavaScript tabs**, porque `NativeTabs.Trigger.VectorIcon` invoca `expo-font.renderToImageAsync`, una API nativa no disponible en web.
- El logo y el mapa se recrearon como SVG en `src/components/`. Si tienes los archivos originales del logo, reemplazar `logo.tsx` por el asset oficial dará una fidelidad pixel perfect.
- Las funciones nativas (ubicación, vibración, portapapeles) funcionan en Expo Go; para producción usa un development build (`eas build --profile development`).
