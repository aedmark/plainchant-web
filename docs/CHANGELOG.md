# Changelog

User-visible changes by release. Internal refactors and doc-only edits belong in git history and [`docs/HANDOFF.md`](HANDOFF.md), not here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/): `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

## [Unreleased]

### Added

- **Home Screen & Starter Templates**: Welcome studio launcher ([`index.html`](../index.html)) with Blank HTML5, Product Landing Page, Creative Portfolio, and 90s GeoCities Retro starter templates plus Open Local Folder.
- **Split-View WYSIWYG Studio**: Code, Split, and Design view modes ([`app.html`](../app.html)) with responsive viewport presets (`100%`, `768px`, `375px`), live DOM breadcrumb bar, collapsible File Explorer (`#fileExplorer`), and dockable/collapsible/floating/hideable Inspector (`D-007`).
- **Direct Stage Manipulation**:
  - Single-click direct WYSIWYG text editing on the Design Stage (`contenteditable` live sync to HTML source without stealing focus to the code editor, `D-009`).
  - Pointer-based drag-and-drop element reordering (`before`, `after`, `inside`) with live amber drop indicators and target badges (`D-008`).
  - On-stage selection action badge (`↑` move up, `↓` move down, `⧉` duplicate, `✕` delete).
  - Top **Insert ▾** dropdown menu and right-click context menu on both the Design Stage and HTML code editor (`P2-06`).
- **Rich CSS Designer**:
  - Live `getComputedStyle` placeholders across Layout, Spacing, Size, Typography, and Background & Border sections (`D-007`).
  - Interactive visual Box Model diagram with live margin (amber) and padding (emerald) overlays on the Design Stage.
  - Matching stylesheet rule inspector with one-click **Go to CSS ↗** rule navigation.
- **Project-Wide Multi-File Undo & Redo**: Top bar `↶` / `↷` buttons and `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, `Ctrl+Y` across code edits, Stage text edits, drag-and-drop moves, Inspector edits, and CSS Designer changes (`D-010`).
- **Isolated Studio Project Environment**: Opening a local folder loads files into an isolated in-memory studio workspace (`[Folder Mode — Unsaved in Studio]`) without auto-overwriting disk files; **Export** preserves the original folder and subfolder structure when saving back to disk (`D-006`).

- **Console tab**: Third Inspector tab showing `console.log/info/warn/error`, uncaught errors, and unhandled promise rejections from Live JS mode, with `All` / `Errors` / `Warnings` / `Logs` filters, an unread badge (red when an error is present), **Clear**, and click-to-jump `file:line` links for errors (`P5-01`, `D-011`).

- **Multi-page link navigation**: In Live JS mode, clicking a relative link to a project page opens that file in the Studio. In Design mode, `Ctrl/Cmd+Click` a link, the `Follow ↗` Stage badge button, or **Follow Link ↗** in Properties does the same; a plain click still selects and edits text (`P5-02`, `D-012`, `D-009`).

- **Project images in the browser build**: Opening a folder in a Chromium browser now loads images, fonts, and other binary files (up to 25 MB each, 200 MB per project) so they render on the Stage, survive reload, follow Duplicate, and are written by **Export to a new folder** (`P7-09`, `D-013`).

- **Shared page parts**: Select an element and choose **Make Part…** to move it into a reusable file (for example `parts/header.html`); pages keep a marked copy, and editing the part file updates every page. A **Parts** Inspector tab shows which pages differ and can insert a part into another page. Pages stay plain HTML (`P7-10`, `D-014`).

- **Line numbers and Find/Replace**: The code editor shows a line-number gutter that follows wrapped lines and highlights the caret line and Stage-selected block. `Ctrl/Cmd+F` / `Ctrl/Cmd+H` open a find bar with match highlighting, a case toggle, next/previous (`Enter` / `Shift+Enter`), **Replace**, and **Replace All**, all undoable (`P6-01`, `D-015`).

- **Dockable Inspector**: A **Dock** menu in the Inspector header places it at the bottom, top, left, or right of the Stage, or floating. Side docks are a resizable single-column panel (drag the edge or use the arrow keys); the position and width are remembered (`P7-16`, `D-016`).

- **Explorer file operations and unsaved dots**: Hover a file in the Explorer (or right-click it) to **Rename**, **Duplicate**, or **Delete** it; each can be undone with `Ctrl/Cmd+Z`. Renaming or moving a file updates the links to it in your pages and stylesheets, and the last page cannot be deleted. Tabs and Explorer rows show a `•` for files changed since the last load, **Save**, or **Export** (`P6-02`, `D-017`).

- **Problems tab (broken-link checker)**: A new Inspector tab lists broken links and missing files across every page and stylesheet: dead page links, images, stylesheets, scripts, CSS `url()`, links that leave the project, case-only matches, and missing `#anchor` targets. A badge shows the count, and clicking a row jumps to the exact spot (`P7-04`, `D-018`).

- **Project-wide find and replace**: Press `Ctrl/Cmd+Shift+F` or click **Project** on the find bar to search every file. Results show the line, jump to the match when clicked, and can be excluded per file; **Replace All in Project** changes the checked files in one undoable step (`P7-05`, `D-019`).

- **Drag to insert**: Press and drag any item in the **Insert ▾** menu onto the Design Stage. A guide shows whether it will go before, after, or inside the element under the pointer; release to insert it (one undo step, new element selected). `Escape` cancels, and clicking an item still inserts as before (`P7-06`, `D-020`).

- **Pseudo-state editing**: A **State** bar in the CSS Designer (Normal, `:hover`, `:focus`, `:active`, `:focus-visible`, `:focus-within`) edits the matching state rule for the selected element and previews that state on the Design Stage, including rules on a parent such as `.card:hover .title` (`P7-07`, `D-021`).

- **Zip export**: The Export dialog has **Download project .zip**, which packs every file (including images from an opened folder and your unsaved editor text) into one archive with the same folder layout and pages at the top level. It is hidden in the desktop app, which exports to a folder (`P7-13`, `D-022`).

- **Keyboard shortcut cheat sheet**: The Help guide (`F1` or `Ctrl/Cmd+/`) now ends with a **Keyboard Shortcuts** section covering saving, undo, views, the Inspector, the editor, find and replace, and the Design Stage (`P7-15`, `D-031`).
- **Format**: A **Format** button beside the file tabs (and `Alt+Shift+F`) re-indents and tidies the open HTML, CSS, or JavaScript file in one undo step, using the file's own indent. HTML and CSS are rebuilt line by line; JavaScript is only re-indented (`P7-14`, `D-030`).
- **Preview in a browser or on a phone**: A **Preview** button opens a dialog. In the desktop app, **Start sharing** serves the open project read-only on your network behind a private link, so you can open it on a phone or in another browser; pages reload as you edit, including unsaved text and added images. Sharing is off until you start it and stops when you press **Stop sharing** or quit. The browser build has **Open in new tab** for a snapshot of the current page (`P7-12`, `D-029`).
- **Accessibility and markup hints**: The Problems tab now also reports missing `alt` text, skipped heading levels, links, buttons, and form fields with no name, frames without a title, positive `tabindex`, a missing `lang` or `<title>`, duplicate ids, and unclosed, crossed, or stray tags. A **Show** filter (All, Links, Accessibility, Markup) limits the list and badge and is remembered (`P7-11`, `D-028`).
- **Explorer folders and moves**: **+ Folder** creates folders (empty ones are created on disk when you export), folder rows can be renamed or deleted when empty, and files or whole folders can be dragged onto a folder (or the blank area for the root) to move them, with links updated and undo. Open file tabs can be dragged to reorder (`P7-08`, `D-027`).
- **Breakpoint switcher**: A **Breakpoint** bar in the CSS Designer (All sizes, ≤ 768px, ≤ 375px) scopes edits to the matching `@media (max-width: …)` block, creating it when needed, and resizes the Stage to that width so you see the result as you edit (`P7-03`, `D-026`).
- **Flex and grid gap handles**: Selecting a flex or grid container on the Design Stage now draws grid track guides and amber handles in the gaps between items. Drag a handle to change `gap`, `column-gap`, or `row-gap` (hold Shift to snap to 4px). The CSS Designer has a new **Layout** group for flex direction, wrap, justify-content, and align-items (`P7-01`, `D-025`).
- **Asset manager follow-ups**: Adding, renaming, and deleting images can be undone (Ctrl/Cmd+Z). **Rename** moves an image and updates every link to it. The desktop app can now add images (saved to the folder on export) and rename them. The CSS Designer has a **Bg Image** field with **Browse…** for `background-image` (`P7-02`, `D-024`).
- **Asset manager and image picker**: An **Assets** button opens a thumbnail grid of the project's images with size, dimensions, and how many places use each one, plus **Insert**, **Use on <img>**, **Copy path**, and **Delete**. **Browse…** beside Source picks an image for the selected element. In the browser, **Add images…** or dropping image files anywhere adds them to `images/`, and they are saved with the project, exported to the folder, and included in the zip (`P7-02`, `D-023`).

### Changed

- **Explorer folders collapse**: click a folder's name (or press Enter or Space on it) in the Explorer to collapse or expand it; the arrow shows the state. Opening, moving, renaming, or creating a file or folder inside a collapsed folder expands it, and filtering the list shows every match.
- **Clicking an image in the Explorer no longer inserts it**: it opens the Assets dialog filtered to that image, where **Insert** is an explicit button. Before, the click added an `<img>` to the page.
- Live JS scripts no longer run inside a `try/catch` block, so top-level `let`/`const` behave as on a real page; runtime errors now appear in the Console tab.

### Fixed

- Syntax colours no longer switch off by themselves. The HTML colouring dropped the `/` from self-closing tags (`<circle ... />`, `<path ... />`) and any stray quote inside a tag, so the coloured copy was a few characters shorter than the text and, at certain line widths, wrapped differently; the editor then turned colours off until reload. The colouring now keeps every character, falls back to plain text for any line that would not, shows a notice if colours are ever switched off, and turning **Syntax colours** off and on in Settings brings them back without a reload.
- The floating Inspector no longer lets its header controls spill past the window edge: the tabs, selection label, and action buttons now wrap onto a second row, long element labels are truncated (full text on hover), and anything left over is clipped inside the window. Docked mode wraps the same way on narrow screens.
- Clicking a `#anchor` link (or an empty link, or submitting a form) in Live JS mode no longer loads a second copy of the editor inside the Stage. The Stage frame resolves such links against the editor page, so the Live bridge now scrolls to the anchor itself and cancels the navigation.
- Fixed Stage drag-and-drop element reordering on Linux WebKitGTK by replacing native HTML5 drag events with deterministic pointer-based hit testing (`D-008`) and single-pass byte-offset splicing in `HtmlAst.moveElement`.
