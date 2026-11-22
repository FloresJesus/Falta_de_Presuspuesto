# Backend MASI

API en Node.js (Express) conectada a Supabase.

## Requisitos

- Node.js 20+
- Docker Desktop (solo para Supabase local con `supabase start`)
- CLI de Supabase: `npm install` ya incluye `supabase` como devDependency.

## Configuración

1. Copia `.env.example` a `.env` y completa las claves del proyecto:

   ```bash
   cp .env.example .env
   ```

   Las claves se obtienen con:

   ```bash
   npx supabase projects api-keys --remote
   ```

2. El proyecto vinculado es **LIA-MVP** (`jefskurnzxyvwdhsuvzb`). Para vincular otro:

   ```bash
   npx supabase link --project-ref <ref>
   ```

## Uso

```bash
npm run dev      # servidor con recarga automática en http://localhost:3000
npm start        # servidor en producción
```

Rutas disponibles:

| Método | Ruta                  | Descripción                                  |
| ------ | --------------------- | -------------------------------------------- |
| GET    | `/`                   | Info de la API                               |
| GET    | `/api/health`         | Estado del servidor y de la base de datos    |
| GET    | `/api/instituciones`  | Instituciones activas (público, aplica RLS)  |
| GET    | `/api/perfiles/me`    | Perfil del usuario (requiere `Authorization`) |

## Esquema y migraciones

El esquema remoto se sincronizó en `supabase/migrations/20261121162119_remote_schema.sql`.
Para seguir administrándolo:

```bash
npm run supabase:pull   # trae cambios del esquema remoto a migraciones locales
npm run supabase:push   # aplica migraciones locales al proyecto remoto
```

## Estructura

```
src/
  config.js                 # variables de entorno
  supabase.js               # clientes de Supabase (servicio y anónimo)
  app.js                    # app Express (middlewares y rutas)
  index.js                  # punto de entrada
  middleware/
    auth.js                 # verifica el Bearer token con Supabase Auth
    async-handler.js        # propaga errores de rutas async
    error-handler.js        # respuesta de error uniforme
  routes/
    health.js
    instituciones.js
    perfiles.js
```
