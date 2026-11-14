# Mi Diario 📖

Tu diario personal: escribe, guarda fotos, elige tu estado de ánimo y navega entre páginas con animaciones de libro.

App Android generada con [Capacitor](https://capacitorjs.com) a partir de una PWA. Funciona offline: todo se guarda en el dispositivo (IndexedDB).

## Compilar el APK en GitHub (automático)

Este repo incluye un workflow de GitHub Actions (`.github/workflows/build-apk.yml`) que compila el APK en cada push a `main`:

1. Ve a la pestaña **Actions** del repositorio.
2. Abre el run **Build APK**.
3. En la sección **Artifacts**, descarga **mi-diario-apk** → `app-debug.apk`.
4. En el móvil, abre el APK y acepta "instalar de origen desconocido".

También puedes lanzarlo manualmente: **Actions → Build APK → Run workflow**.

## Compilar en local (opcional)

```bash
npm install
npx cap add android
cd android && ./gradlew assembleDebug
```
APK en `android/app/build/outputs/apk/debug/app-debug.apk`.

## Probar la versión web

```bash
cd www
python3 -m http.server 8080
```
En Chrome: menú → **Añadir a pantalla de inicio**.

## Funciones

- ✍️ Escribir entradas con título, fecha, texto y estado de ánimo (emoji).
- 📷 Varias fotos por entrada, comprimidas automáticamente.
- 📖 Animación de paso de página (efecto hoja 3D) y efectos de tinta al escribir.
- 🔍 Búsqueda, agrupación por meses, lightbox de fotos, borrado con confirmación.
- 📴 Offline total.

## Estructura

```
├── www/                        # app web (la que empaqueta Capacitor)
│   ├── index.html
│   ├── css/styles.css          # diseño cuaderno + animaciones
│   ├── js/db.js                # IndexedDB (capa de datos aislada)
│   ├── js/app.js               # lógica, vistas, animaciones
│   ├── manifest.webmanifest
│   ├── sw.js                   # caché offline
│   └── icons/icon.svg
├── capacitor.config.json
├── package.json
└── .github/workflows/build-apk.yml
```

## Sincronización en la nube (futuro)

`www/js/db.js` está aislada como capa de datos: se puede añadir Firebase/Supabase o un servidor propio sin tocar el resto de la app.
