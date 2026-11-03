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

### Changed

- Live JS scripts no longer run inside a `try/catch` block, so top-level `let`/`const` behave as on a real page; runtime errors now appear in the Console tab.

### Fixed

- The floating Inspector no longer lets its header controls spill past the window edge: the tabs, selection label, and action buttons now wrap onto a second row, long element labels are truncated (full text on hover), and anything left over is clipped inside the window. Docked mode wraps the same way on narrow screens.
- Clicking a `#anchor` link (or an empty link, or submitting a form) in Live JS mode no longer loads a second copy of the editor inside the Stage. The Stage frame resolves such links against the editor page, so the Live bridge now scrolls to the anchor itself and cancels the navigation.
- Fixed Stage drag-and-drop element reordering on Linux WebKitGTK by replacing native HTML5 drag events with deterministic pointer-based hit testing (`D-008`) and single-pass byte-offset splicing in `HtmlAst.moveElement`.
