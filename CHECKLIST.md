# Cómo probar LÍA de verdad

## 1. Salir de Expo Go

Las funciones nativas (push con sonido y ubicación en segundo plano) no funcionan bien en Expo Go.

```bash
cd /home/jj/Sin_Presuspuesto/frontend
npx eas-cli login
npx eas-cli init
npx eas-cli build --profile development --platform android
```

Instala el APK resultante en el celular. Para iOS cambia `android` por `ios`.

## 2. Cuentas

- Admin / FELCC: `ffjesus03@gmail.com`
- Usuaria normal: `jairo.flores@sistemas.edu.bo`

## 3. Pruebas

### Mapa
- Pestaña inferior **SOS/Mapa**.
- Arrastra, haz zoom, toca un pin numerado.
- Con la cuenta admin, botón `+`: crea una zona en Oruro.
- Revisa que aparezca en la otra cuenta.

### Carrusel
- En **Inicio** salen 3 personas desaparecidas de ejemplo.
- Desliza horizontalmente.
- **Llamar a familia** abre el teléfono.

### Registro FELCC
- Con la cuenta admin: **Más → Registro FELCC**.
- Registra una persona.
- Márcala como **encontrada**: desaparece del carrusel.

### SOS
- Pestaña inferior **SOS**.
- Botón grande en el centro.
- Cuenta regresiva de 10s dentro del círculo.
- Se envía y muestra confirmación.
- La otra cuenta ve banner rojo + pantalla completa de alerta + seguimiento de ubicación.

## 4. Limitación iOS

Para que suene con **No molestar** en iOS hace falta el entitlement *Critical Alerts* de Apple. Hoy se usa `timeSensitive`: avisa, pero no lo garantiza. En Android usa canal de alarma.
