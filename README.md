# Typewriter

Un lugar tranquilo para escribir. Una app web minimalista que simula una máquina de escribir: una hoja, una tipografía de máquina y nada más.

![Typewriter en modo oscuro con la máquina negra](docs/screenshots/oscuro-negra.jpg)

## Objetivo

Escribir requiere foco, y la mayoría de los editores están llenos de menús, barras de herramientas, notificaciones y opciones de formato que invitan a hacer cualquier cosa menos escribir.

Typewriter recupera la experiencia de sentarse frente a una máquina de escribir:

- **Una sola cosa en pantalla:** la hoja y el texto.
- **Siempre escribís en el mismo lugar:** la línea actual queda fija justo encima de la barra de la máquina y es el papel el que sube, como en una máquina real.
- **Nada que configurar antes de empezar:** abrís la app y escribís. El texto se guarda solo.
- **Tu texto es tuyo:** se exporta como Markdown (`.md`), un formato abierto que podés abrir en cualquier editor, en Obsidian, Notion, GitHub, etc.

## Capturas

### Modos claro y oscuro

| Oscuro | Claro |
| --- | --- |
| ![Modo oscuro](docs/screenshots/oscuro-negra.jpg) | ![Modo claro](docs/screenshots/claro-crema.jpg) |

### Estilos de máquina

| Negra | Crema | Menta |
| --- | --- | --- |
| ![Máquina negra](docs/screenshots/oscuro-negra.jpg) | ![Máquina crema](docs/screenshots/claro-crema.jpg) | ![Máquina menta](docs/screenshots/claro-menta.jpg) |

| Roja | Celeste |
| --- | --- |
| ![Máquina roja](docs/screenshots/oscuro-roja.jpg) | ![Máquina celeste](docs/screenshots/claro-celeste.jpg) |

### Solo la hoja

Para la máxima concentración, la máquina se puede ocultar y queda únicamente la hoja.

![Modo solo hoja](docs/screenshots/solo-hoja.jpg)

### En el celular

<img src="docs/screenshots/movil.jpg" alt="Typewriter en el celular" width="300">

## Cómo funciona

### Escribir

Abrí la app y empezá a escribir: el cursor ya está en la hoja. A medida que avanzás, el papel sube y la línea que estás escribiendo se queda siempre a la misma altura, justo sobre la barra de la máquina, para que la vista no tenga que perseguir al texto.

Podés volver a leer lo anterior con la rueda del mouse o el trackpad; al seguir escribiendo, la hoja vuelve sola a tu línea. También funciona hacer clic en cualquier parte del texto o moverte con las flechas: la hoja se acomoda para que esa línea quede sobre la barra.

Mientras escribís, los botones se atenúan casi por completo para no distraer, y vuelven a aparecer cuando movés el mouse.

### Los botones

Todos los botones están en la máquina (o al pie de la hoja si la máquina está oculta). Pasando el mouse por encima aparece qué hace cada uno.

| Ícono | Acción |
| --- | --- |
| **＋** | **Hoja nueva.** Borra el texto actual para empezar de cero. Si hay texto, pide confirmación antes. |
| **⤓** | **Descargar.** Descarga el texto como archivo `.md`. |
| **⛶** | **Pantalla completa.** Entra y sale de pantalla completa para escribir sin nada alrededor. |
| **☀ / ☾** | **Modo claro / oscuro.** Cambia el escritorio entre oscuro y blanco. |
| **●** | **Estilo de máquina.** Cada clic pasa al siguiente color: negra, crema, menta, roja y celeste. El circulito muestra el color actual. |
| **🗎 / ⌨** | **Ocultar / mostrar la máquina.** Deja solo la hoja, o vuelve a mostrar la máquina. |

### Atajos de teclado

| Atajo | Acción |
| --- | --- |
| `Ctrl` + `S` (`⌘` + `S` en Mac) | Descargar el texto como `.md` |
| `Ctrl` + `Shift` + `F` (`⌘` + `Shift` + `F` en Mac) | Pantalla completa |
| `Esc` | Salir de pantalla completa |

### Exportar a Markdown

Lo que escribís se descarga tal cual como un archivo `.md`, así que podés usar sintaxis Markdown mientras escribís (`# Título`, `**negrita**`, `- listas`, etc.).

El nombre del archivo se arma con la primera línea del texto: si empezás con `# Carta a mi yo del futuro`, el archivo se llama `carta-a-mi-yo-del-futuro.md`. Si no hay texto, se usa la fecha, por ejemplo `texto-2026-10-14.md`.

### Guardado automático

El texto se guarda automáticamente en tu navegador mientras escribís. Si cerrás la pestaña o recargás la página, todo sigue ahí y el cursor vuelve al final para que sigas donde quedaste.

También se recuerdan tus preferencias: modo claro u oscuro, estilo de máquina y si la máquina está oculta.

> **Importante:** el guardado es local, en ese navegador y en esa computadora. No hay cuentas ni servidor: nada de lo que escribís sale de tu dispositivo. Si borrás los datos del navegador, usás una ventana de incógnito o cambiás de equipo, el texto no va a estar. Descargá el `.md` de todo lo que quieras conservar.

## Tecnología

- [Next.js](https://nextjs.org/) 16 (App Router) y React 19
- TypeScript
- CSS puro, sin librerías de UI: la máquina está dibujada íntegramente con CSS (gradientes y sombras), sin imágenes
- Tipografía [Special Elite](https://fonts.google.com/specimen/Special+Elite), cargada con `next/font`
- `localStorage` para el guardado automático y las preferencias
- [Fullscreen API](https://developer.mozilla.org/docs/Web/API/Fullscreen_API) para la pantalla completa

### Cómo se mantiene fija la línea de escritura

El área de texto es un `<textarea>` que crece con su contenido dentro de un contenedor con scroll. Para saber en qué altura está el cursor, la app copia el texto hasta la posición del cursor en un elemento "espejo" invisible con exactamente la misma tipografía y ancho, y mide dónde cae un marcador al final. Con esa medida desplaza el contenedor para que la línea del cursor quede justo encima de la barra de la máquina. Esto se recalcula al escribir, al mover el cursor y al cambiar el tamaño de la ventana.

## Instalación y uso local

Requisitos: [Node.js](https://nodejs.org/) 20 o superior.

```bash
git clone https://github.com/meryboth/typewriter.git
cd typewriter
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

### Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en vivo |
| `npm run build` | Compila la app para producción |
| `npm run start` | Sirve la versión compilada (después de `build`) |

### Publicarla

La app es completamente estática, sin backend, así que se puede publicar gratis en [Vercel](https://vercel.com/): importá el repositorio desde Vercel y no hace falta ninguna configuración extra.

## Estructura del proyecto

```
typewriter/
├── app/
│   ├── layout.tsx        # Layout raíz, tipografía y metadatos
│   ├── page.tsx          # Página principal
│   └── globals.css       # Estilos: escritorio, hoja, máquina, modos y estilos
├── components/
│   └── Typewriter.tsx    # Editor, máquina, botones, atajos y guardado
├── docs/
│   └── screenshots/      # Capturas usadas en este README
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Próximas ideas

- Sonido de teclas y campanita al final de la línea (opcional)
- Modo "sin borrar", como en una máquina de verdad
- Más tipografías de máquina para elegir
- Varias hojas o documentos guardados
- Objetivo de palabras diario
