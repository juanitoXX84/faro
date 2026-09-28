# Faro

Pantalla inteligente y checador para la planta. La misma app sirve en una TV o monitor y en el teléfono.

## Arranque

```bash
npm install
npx expo start
```

En el teléfono usa Expo Go. En el navegador presiona `w`.

- **Pantalla**: reloj, avisos, programación multimedia y checadas del día. La pantalla no se apaga mientras está abierta.
- **Checador**: vincula el teléfono a una persona y registra entrada o salida con huella o rostro.
- **Gestión**: solo el teléfono vinculado a Elena Vidal (supervisión) publica avisos y la programación.

## Sensores

En un teléfono Android con huella o rostro registrados, la confirmación usa el sensor del sistema. Face ID de iOS no funciona dentro de Expo Go; hace falta un development build. Si el aparato no tiene sensor —el navegador, por ejemplo— la app ofrece una simulación y marca esa checada como demostración.

## Nube

En el mismo aparato, pantalla y checador se actualizan al momento. En el navegador, dos ventanas se sincronizan entre sí.

Para varios aparatos, en otra terminal:

```bash
npm run cloud
```

En la web, la app intenta `http://127.0.0.1:8787` por su cuenta. En PowerShell:

```powershell
$env:EXPO_PUBLIC_CLOUD_URL="http://192.168.0.10:8787"
npx expo start
```

En macOS o Linux usa `export EXPO_PUBLIC_CLOUD_URL=http://192.168.0.10:8787`.
