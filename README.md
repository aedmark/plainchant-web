# Plainchant Web

A lightweight, Dreamweaver-inspired **HTML5, CSS, and JavaScript WYSIWYG Studio** spun off from Plainchant.

Your project's HTML, CSS, and JavaScript files are always the single source of truth. Every visual action on the Stage—clicking text to edit it in place, dragging elements to reorder them, inspecting box-model margins and padding, inserting semantic HTML5 components, or tweaking CSS rules—splices only the exact byte range in your underlying code.

Static HTML, CSS, and JavaScript: no frontend build step, zero runtime frontend dependencies, works in any modern browser or as a native desktop app via **Tauri v2**.

## Features

- **Code, Split, and Design/Live Views** (`Ctrl/Cmd+Shift+1 / 2 / 3`):
  - **Code View & File Explorer:** Multi-file project sidebar (`Files`), dynamic open-file tabs, transparent-textarea syntax color hints, live HTML/CSS block highlighting (`.sh-selected-line`), Emmet-lite tag abbreviation expansion on `Tab`, and smart indentation on `Enter`.
  - **Direct WYSIWYG Design Mode:**
    - Click any element on the Stage to highlight its exact HTML block in the Code editor without stealing keyboard focus from the Stage.
    - Click any text element (`h1`–`h6`, `p`, `span`, `a`, `button`, `li`, etc.) to place a live text caret right where you clicked and edit text directly in place while watching the HTML code update in real time.
    - Visual **Box-Model Overlay** displays live amber margin bands, emerald padding bands, and pixel dimensions (`tag#id.class · W×H`) on the Stage.
    - Drag and drop elements on the Stage (or use the floating badge buttons `↑`, `↓`, `⧉`, `✕` or `Alt+Up` / `Alt+Down`) to reorder, duplicate, or delete elements cleanly.
  - **Live JS Mode:** Toggle **Live JS** in the Stage header to run your project's JavaScript and test interactive behavior.
- **Dockable, Collapsible & Floating Inspector (`Ctrl/Cmd+Shift+I`):**
  - Use the **Dock** menu to place the Inspector at the bottom, top, left, or right of the Stage, or as a floating window; side docks are resizable and your choice is remembered.
  - **Properties (HTML):** Edit `id`, `class`, `href`, `src`, `alt`, inline text, move up/down, duplicate, wrap in `<div>`, or delete.
  - **Rich CSS Designer:** Reads live `getComputedStyle` telemetry from the Stage iframe to display computed placeholders and box summaries, syncs color pickers, targets either shared stylesheet rules (with **Go to CSS ↗** to jump directly to the rule in the Code editor) or inline `element.style`, and edits Display, Padding, Margin, Gap, Width, Font Size, Text Align, Border Radius, Text Color, and Background Color.
- **Insert Dropdown & Right-Click Context Menu:**
  - Use the top **Insert ▾** dropdown or **right-click** anywhere on the Design Stage or HTML Code Editor to insert semantic HTML5 blocks (`Section`, `Card`, `Flex Row`, `3-Col Grid`, `Container`, `Heading`, `Paragraph`, `Button`, `Link`, `Image`, `List`, `Form`) or run element actions.
- **Multi-File Undo & Redo (`Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, `Ctrl/Cmd+Y`):**
  - Unified history stack across all project files, visual Stage manipulations, Inspector edits, and Code editor typing bursts.
- **Line Numbers & Find/Replace (`Ctrl/Cmd+F`, `Ctrl/Cmd+H`):**
  - A line-number gutter follows wrapped lines, and the find bar highlights every match in the current file with case matching, next/previous, **Replace**, and **Replace All** (undoable).
- **Explorer File Operations & Unsaved Dots:**
  - Rename, duplicate, or delete files from the Explorer (hover buttons or right-click); renames update links to the file, and everything is undoable. A `•` marks files changed since the last Save or Export.
- **Problems Tab (Broken-Link Checker):**
  - Checks every page and stylesheet for dead links, missing images, stylesheets, and scripts, and missing `#anchor` targets; click a problem to jump to it.
- **Safe Local Folder Workflow & Structure-Preserving Export:**
  - Opening a local folder via **Folder** creates an isolated project environment in your Studio library (serving local images, fonts, and linked stylesheets via a built-in localhost asset server in Tauri).
  - Edits are auto-saved to your Studio workspace and **never** overwrite your local disk until you explicitly use **Export**, which writes all project files back to disk while retaining your exact folder and file hierarchy.

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
