# Plainchant Web

A lightweight, Dreamweaver-inspired **HTML5, CSS, and JavaScript WYSIWYG Studio** spun off from Plainchant.

Your `index.html`, `styles.css`, and `script.js` files are always the single source of truth. Every visual action on the Stage—clicking elements to inspect their box model, editing text inline, inserting semantic HTML5 components, or tweaking CSS rules—splices only the exact byte range in your underlying code.

Static HTML, CSS, and JavaScript: no build step, no runtime frontend dependencies, works in any modern browser or as a native desktop app via **Tauri**.

## Features

- **Code, Split, and Design/Live Views** (`Ctrl/Cmd+Shift+1 / 2 / 3`):
  - **Code View:** Multi-file tabs (`index.html`, `styles.css`, `script.js`), transparent-textarea syntax color hints, Emmet-lite tag abbreviation expansion on `Tab`, and smart indentation on `Enter`.
  - **Design Mode:** Click any element on the Stage to highlight it, view its ancestor path in the bottom **Tag Selector** (`body › main#hero › h1`), or double-click any text element to edit inline (`contenteditable`) with full undo support.
  - **Live JS Mode:** Toggle **Live JS** in the Stage header to run `script.js` interactively.
- **Properties & CSS Designer Inspector:**
  - Edit HTML attributes (`id`, `class`, `href`, `src`, `alt`), inner text, wrap elements in a `<div>`, or delete elements.
  - Target either a shared CSS rule in `styles.css` (e.g. `.card`, `#ctaBtn`) or inline `element.style` and adjust Display (`block`, `flex`, `grid`), Padding, Margin, Gap, Width, Font Size, Text Align, Border Radius, Text Color, and Background Color.
- **Insert Palette & DOM Tree:**
  - One-click insertion of semantic HTML5 blocks (`Section`, `Card`, `Flex`, `Grid`, `Div`, `Heading`, `Text`, `Button`, `Link`, `Image`, `List`, `Form`).
  - **DOM Modal:** Hierarchical DOM outline with instant filtering and element/CSS/JS statistics.
- **Hybrid Storage (Browser IndexedDB + Tauri Desktop):**
  - Automatic saving in IndexedDB with version snapshots, 30-day trash recovery, single-file bundled `.html` export, and direct local project folder sync (`index.html`, `styles.css`, `script.js`) via Tauri or the File System Access API.

## Run in Browser

Open `app.html` directly, or serve the folder with any static server:

```sh
python3 -m http.server 8080
```

## Run as Tauri Desktop App

```sh
npm run tauri:dev
```

## Run Tests

```sh
npm test
```
