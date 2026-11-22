# MASI

**MASI** es una aplicación móvil de acompañamiento y seguridad personal para mujeres en Bolivia. Reúne en un solo lugar las herramientas para pedir ayuda, mantenerse en contacto con personas de confianza y acceder a información útil antes, durante y después de una situación de riesgo.

> Aplicación desarrollada con Expo / React Native y Supabase.

## Características

- **SOS con cuenta regresiva:** envía una alerta a tu contacto de confianza y comparte tu ubicación.
- **Seguimiento en vivo:** la persona de confianza puede ver la ubicación durante la emergencia.
- **Contactos de confianza:** solicitudes entre usuarias registradas, contacto principal y llamada directa.
- **Mapa de Oruro:** zonas de riesgo, rutas peligrosas y puntos de referencia.
- **Personas desaparecidas:** registro FELCC, carrusel de casos y ficha con datos de contacto.
- **Directorio de instituciones:** apoyo legal, psicológico, salud y protección.
- **Contenido educativo:** prevención, seguridad personal y digital, derechos, denuncia y autocuidado.
- **Asistente MASI:** orientación guiada dentro de la app.
- **Notificaciones:** aviso local con sonido de bocina para las alertas SOS.

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| App móvil | Expo SDK 58, React Native 0.88, TypeScript, Expo Router |
| Estado y datos | Supabase Auth, PostgreSQL, RLS, RPC |
| Mapas | OpenStreetMap / Leaflet y `react-native-maps` |
| Backend | Node.js + Express, Supabase Edge Functions (Deno) |
| Build | EAS Build o Gradle (APK Android) |

## Estructura del repositorio

```text
.
├── frontend/                 # Aplicación Expo / React Native
│   ├── src/app/              # Rutas y pantallas (Expo Router)
│   ├── src/components/       # Componentes reutilizables
│   ├── src/hooks/            # Lógica de datos y estado
│   ├── src/context/          # Autenticación y contexto SOS
│   ├── assets/               # Imágenes, fuentes y sonidos
│   └── app.json              # Configuración de Expo
├── backend/                  # API Express + Supabase
│   ├── src/                  # Rutas de la API
│   └── supabase/
│       ├── migrations/       # Esquema, funciones y datos iniciales
│       └── functions/        # Edge Function sos-notify
├── CHECKLIST.md              # Guía de pruebas manuales
└── README.md
```

## Requisitos

- Node.js 20 o superior
- npm
- Un proyecto de Supabase
- Android Studio / Android SDK (solo para compilar el APK localmente)

## Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/FloresJesus/Falta_de_Presuspuesto.git
cd Falta_de_Presuspuesto
```

### 2. Configurar el frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edita `frontend/.env` con los datos de tu proyecto:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<tu-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

### 3. Configurar el backend

```bash
cd backend
npm install
cp .env.example .env
```

Completa `backend/.env` con las claves de Supabase y ejecuta:

```bash
npm run dev
```

La API queda disponible en `http://localhost:3000`.

### 4. Preparar Supabase

```bash
cd backend
npx supabase link --project-ref <tu-project-ref>
npm run supabase:push
npx supabase functions deploy sos-notify
```

## Ejecutar la app

```bash
cd frontend
npx expo start
```

Desde el menú de Expo puedes abrir Android, iOS o la versión web. Para un dispositivo Android conectado por USB:

```bash
npx expo run:android
```

## Compilar un APK

Con el SDK de Android configurado:

```bash
cd frontend/android
./gradlew :app:assembleRelease
```

El APK queda en:

```text
frontend/android/app/build/outputs/apk/release/app-release.apk
```

También se puede compilar en la nube con EAS:

```bash
cd frontend
npx eas-cli build --platform android --profile preview
```

## Notificaciones y SOS

- **Con la app abierta:** la app revisa las alertas recibidas y lanza una notificación local en el canal `sos-alerts-v2`, con sonido de bocina y audio de alarma.
- **Con la app cerrada:** hace falta configurar Expo Push (proyecto EAS + credenciales FCM). Los pasos están en [`CHECKLIST.md`](./CHECKLIST.md).

## Pruebas

La guía de pruebas manuales (mapa, carrusel, registro FELCC y SOS) está en [`CHECKLIST.md`](./CHECKLIST.md).

Documentación específica:

- [`frontend/README.md`](./frontend/README.md)
- [`backend/README.md`](./backend/README.md)

## Notas

- El nombre visible de la app es **MASI**. Los identificadores técnicos del proyecto se conservan para no romper builds ni enlaces anteriores.
- Las claves de Supabase y los archivos `.env` no se versionan.
- Los APK de prueba no se suben al repositorio.

---

## Equipo

**MASI** es el nombre de la aplicación. El equipo desarrollador es **Falta de Presupuesto** — Oruro, Bolivia.
