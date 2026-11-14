# Mi Refugio 💜

Tu diario personal: un espacio cuidadoso para escribir apuntes, guardar fotos y tener compañía en los días difíciles. **100% privado**: sin cuentas ni servidores, todo vive en tu dispositivo (IndexedDB).

## Funciones

- 📖 **Entradas de diario** con fecha y hora automáticas, título opcional, texto con formato básico (negrita, cursiva, listas), etiquetas y color de tarjeta.
- 🗒 **Apuntes locos**: post-its desordenados en un mural, arrastrables y con colores aleatorios, para ideas sueltas, impulsos y sueños.
- 📷 **Fotos** desde galería o cámara, comprimidas automáticamente (máx. 1600px, calidad 0.8). Galería tipo polaroid con descripción y lightbox.
- 🌈 **Estado de ánimo** (feliz, tranquilo, neutral, triste, ansioso, agotado, caótico) con color visible en el calendario.
- 🗓 **Calendario** mensual con marcas de ánimo y corazones para entradas de días difíciles.
- 🔍 **Búsqueda** por texto, #etiqueta o ánimo.
- 💾 **Exportar/importar** respaldo completo en JSON (con fotos en base64).
- 🔒 **Bloqueo opcional** con PIN de 4 dígitos (guardado como hash SHA-256, nunca en texto plano).

## Modo "días difíciles" 💗

Se activa con el botón de corazón de la cabecera:

- Paleta suave (lavanda, durazno, verde salvia) y bajo contraste.
- Frases de acompañamiento: "Está bien no estar bien hoy", "Solo escribe lo que puedas"…
- Preguntas guía opcionales, nunca obligatorias.
- Sin rachas, conteos ni Culpa™.
- Sección de apoyo con **Línea Vida Uruguay (0800 0767)** y **Emergencias (911)**.
- Animaciones más lentas y suaves.

## Animaciones

- 📔 **Portada**: cuaderno cerrado con sello que se abre con rotación 3D al tocarlo (con botón "omitir").
- 📄 **Cambio de página** con efecto de hoja (rotateY + sombra en el lomo) o modo suave (fade + desplazamiento), configurable en Ajustes.
- ✨ Micro-interacciones: rebote en botones, polaroids que se enderezan, confeti y corazones al guardar.
- ♿ Respeta `prefers-reduced-motion`: solo transiciones de opacidad.

## Stack

React 18 · Vite 5 · TypeScript · Tailwind CSS 3 · Framer Motion 11 · idb (IndexedDB) · Lucide React · Capacitor (APK).

## Compilar el APK en GitHub

El workflow `.github/workflows/build-apk.yml` compila el APK en cada push a `main`:

1. Pestaña **Actions** → run **Build APK**.
2. Sección **Artifacts** → descargar **mi-refugio-apk** → `app-debug.apk`.

En local:

```bash
npm install
npm run build        # TypeScript + Vite → dist/
npx cap add android  # solo la primera vez
npx cap sync android
cd android && ./gradlew assembleDebug
```

## Desarrollo web

```bash
npm install
npm run dev
```

## Estructura

```
├── src/
│   ├── App.tsx                 # orquestador de vistas y estado global
│   ├── types.ts                # tipos principales (Entrada, Ajustes…)
│   ├── lib/
│   │   ├── db.ts               # IndexedDB (idb): entradas y ajustes
│   │   ├── datos.ts            # ánimos, colores, frases y preguntas
│   │   └── utils.ts            # fechas, fotos, markdown, PIN, respaldo
│   ├── hooks/
│   │   ├── useAjustes.tsx      # contexto de ajustes (tema, PIN, modo difícil)
│   │   └── useEntradas.ts      # CRUD de entradas
│   └── components/             # portada, editor, calendario, galería…
├── capacitor.config.json
└── .github/workflows/build-apk.yml
```

## Privacidad

No hay servidor, ni cuentas, ni analítica. Tus entradas y fotos se guardan cifradas por el sistema operativo dentro de la app. Usa **Exportar** de vez en cuando para tener una copia de seguridad.
