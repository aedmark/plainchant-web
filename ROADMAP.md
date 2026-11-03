# Roadmap

Item IDs are permanent: `P<phase>-<nn>`. Never renumber; append new items at the end of their phase.
`[ ]` open · `[~]` in progress (who holds it, since when, and what is left) · `[x]` done · `[-]` dropped (say why,
and the decision). An item held `[~]` by someone else is theirs until they or a maintainer release it.

A finished item says what was done, the decision if any, the evidence (the test, or the measurement), and the date.
A new item says where it came from (a test run, a real user, a maintainer) and the date. Keep an item's history in it:
"tried X, measured Y, then did Z" is how the next session avoids trying X again. Bugs are items too, filed under
the phase they belong to.

## Phase 1: Foundations & Parsers

Goal: Establish the zero-dependency HTML5/CSS/JS studio architecture, non-destructive AST parsers, and structural test suite.

- [x] P1-01 Non-destructive HTML5 parser, `data-pc-id` stamper, and surgical byte-range splicer in `src/html-ast.js` (D-001, D-003). Verified by `test/html-ast.test.js`, 6 tests (2026-11-02).
- [x] P1-02 Non-destructive CSS rule/declaration parser, selector matcher, and rule splicer in `src/css-ast.js` (D-003). Verified by `test/css-ast.test.js`, 4 tests (2026-11-02).
- [x] P1-03 Multi-file project bundle packer/unpacker, linked stylesheet resolver, and preview document assembler in `src/project.js` (D-004, D-006). Verified by `test/project.test.js`, 2 tests (2026-11-02).
- [x] P1-04 Transparent-textarea syntax shader (`src/code-shade.js`, `src/app/shade.js`), Emmet-lite tag abbreviation expander, and smart Enter indenter (`src/editing.js`) (D-002). Verified by `test/structure.test.js` (2026-11-02).

## Phase 2: Core WYSIWYG Stage & Inspector Experience

Goal: Deliver Dreamweaver-inspired round-trip editing between the Code View, Design/Live Stage, and Properties/CSS Inspector.

- [x] P2-01 Split Code / Design / Live JS Stage (`src/app/stage.js`, `src/app/panes.js`) with responsive viewport presets (`100%`, `768px`, `375px`) and Stage-to-Code block highlighting (`highlightCodeRange` in `src/app/shade.js`, `selectElementById` in `src/app/layout.js`) (2026-11-02).
- [x] P2-02 Dockable, collapsible, hideable, and draggable floating modal Properties & CSS Designer Inspector (`src/app/panes.js`, `src/app/inspector-ui.js`) with live `getComputedStyle` telemetry, visual box-model margin/padding Stage overlays, and **Go to CSS ↗** rule jumping (D-007) (2026-11-02).
- [x] P2-03 Direct Stage manipulation: pointer-based drag-and-drop element reordering (`src/app/stage.js`, `HtmlAst.moveElement`), floating badge quick actions (`↑`, `↓`, `⧉`, `✕`), and element duplication (`HtmlAst.duplicateElement`) (D-008). Verified by `test/html-ast.test.js` (2026-11-02).
- [x] P2-04 Direct single-click WYSIWYG text editing on the Design Stage (`isTextEditable`, `placeCaretAtPoint`, `pc-inline-input` in `src/app/stage.js`) that syncs live to the Code editor without stealing keyboard focus from the Stage (D-009) (2026-11-02).
- [x] P2-05 Multi-file Undo and Redo stack (`src/app/typing.js`, `src/app/core.js`) across Code typing bursts, Stage manipulations, and Inspector edits (`Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, `Ctrl+Y`) (D-010) (2026-11-02).
- [x] P2-06 Reorganized top menu bar above file tab strip, **Insert ▾** dropdown menu, and right-click context menu (`#contextMenu`) on both Stage and HTML Code editor (2026-11-02).

## Phase 3: Desktop Tauri Shell, Multi-File Explorer & Export

Goal: Support real multi-file web projects with local binary assets, safe in-studio workspaces, and structure-preserving disk export.

- [x] P3-01 Tauri v2 desktop backend (`src-tauri/src/main.rs`, `src-tauri/build.rs`) with staged `src-tauri/dist/` asset bundling, recursive directory scanning, and localhost static asset HTTP server (`spawn_asset_server`) so local images, fonts, and multiple stylesheets render via `<base href>` (D-005, D-006) (2026-11-02).
- [x] P3-02 IDE File Explorer sidebar (`#fileExplorer`), filter search, `+ File` creation, and dynamic closable file tabs (`#fileTabs`) in `src/app/core.js` (D-006) (2026-11-02).
- [x] P3-03 Isolated Studio project environment on folder open (`src/app/tauri-files.js`, `src/app/persistence.js`) and structure-preserving local folder Export (`src/app/export.js`, `save_project_folder`) so local disk files are never modified until explicitly exported (D-006) (2026-11-02).

## Phase 4: Quality, Structure & Documentation

Goal: Enforce architectural invariants, offline readiness, and canonical agent documentation.

- [x] P4-01 Structural and offline verification suite (`test/structure.test.js`, 9 checks) enforcing script load order, single global namespace, 500-line file cap, no inline scripts/styles, and Service Worker cache parity (D-001, D-002) (2026-11-02).
- [x] P4-02 Adopt `the-manifold` canonical agent documentation scheme (`AGENTS.md`, `CLAUDE.md`, `ROADMAP.md`, `docs/*`, `tools/check_docs.py`). Verified by `python3 tools/check_docs.py` (2026-11-02).
- [x] P4-03 Adopt `3x-documentation-scheme` What / How / Why manual (`docs/plainchant-web.manual.json`, `docs/manual.html`, `docs/manual.schema.json`, `tools/manual.py`, `tools/test_manual.py`, `tools/manual.LICENSE`). Verified by `python3 tools/manual.py check docs/plainchant-web.manual.json` and `python3 -m unittest tools/test_manual.py`, 6 tests (2026-11-02).

## Phase 5: Interactive Console & Live Link Navigation on the Stage

Goal: Give developers live runtime observability and seamless multi-page navigation directly inside the Stage and Inspector.

- [x] P5-01 **In-App JS Console Drawer** (requested by maintainer, 2026-11-02). Done 2026-11-02 (D-011): console bridge in `Project.assemblePreview` (Live JS only, `Project.consoleBridge`), `src/app/console-ui.js`, Console tab. Source lines map back to project files; user scripts are no longer wrapped in `try/catch` so top-level `let`/`const` behave as on a real page and `window.onerror` reports exact lines. Verified by 3 new tests (`test/project.test.js` x2, `test/structure.test.js` x1) and a manual browser check of logs, warnings, errors, badge, filters and click-to-jump.
  - **Scope**: Add a third Inspector tab (`Console` with unread/error count badge `#consoleCountBadge`) next to `Properties (HTML)` and `CSS Designer` in `app.html`.
  - **Stage Bridge (`src/project.js`, `src/app/stage.js`)**: Wrap `console.log`, `console.info`, `console.warn`, and `console.error` plus `window.onerror` and `window.onunhandledrejection` inside the Stage iframe (`Project.assemblePreview`), forwarding structured `{ type: 'pc-console', level, args, line, source }` messages via `postMessage`.
  - **Inspector UI (`src/app/console-ui.js`, `src/styles.css`)**: Render filterable log rows (`All`, `Errors`, `Warnings`, `Logs`) with severity badges, timestamps, a `Clear` button, and click-to-jump source line navigation. Extract into `src/app/console-ui.js` (registered in `app.html` and `sw.js`) so `src/app/inspector-ui.js` (currently 449 lines) stays well under the 500-line limit (D-001).
  - **Verification**: Unit test in `test/project.test.js` asserting console proxy injection; structural check in `test/structure.test.js`.
- [x] P5-02 **Multi-Page Link Navigation on the Stage** (requested by maintainer, 2026-11-02). Done 2026-11-02 (D-012): `Project.resolveRelativePath`, Live JS link bridge and link handlers in `src/app/stage-live.js`, `Ctrl/Cmd+Click` and `Follow ↗` badge button on the Design Stage, and **Follow Link ↗** in Properties. Verified by `test/project.test.js` (`resolveRelativePath`), `test/structure.test.js`, and a browser check of Live click, Ctrl+Click, plain Design click (selects only), badge, Properties button, and a missing target.
  - **Scope**: Clicking a relative project HTML link (such as `resume.html` or `gallery.html`) on the Stage switches the Studio's active HTML document to that file in `projectFiles.entries`.
  - **Interaction Rules (D-009)**:
    - In **Live JS mode**: Any normal click on a relative `<a href>` targeting a project `.html` file intercepts iframe navigation and switches the Studio to that file.
    - In **Design mode**: Single-click on an `<a>` continues to select and inline-edit its text (D-009), while `Ctrl/Cmd+Click` on the Stage—or clicking a **Follow Link ↗** button in the floating stage badge / Properties panel—switches to the linked `.html` file.
  - **Resolution (`src/project.js`, `src/app/stage.js`, `src/app/core.js`)**: Add `Project.resolveRelativePath(fromFile, rawHref)` to normalize relative paths (`./resume.html`, `sub/page.html#section`, `../index.html`), ignore external schemes (`http:`, `https:`, `mailto:`, `tel:`, `javascript:`), and switch the active editor/Stage tab via `openFileInEditor(targetPath)`.
  - **Verification**: Unit tests for `Project.resolveRelativePath` in `test/project.test.js`.

## Phase 6: Editor Ergonomics & File Management

Goal: Upgrade the Code editor with line-number gutters and in-file Find/Replace, and add full file lifecycle management and per-file dirty tracking in the File Explorer.

- [ ] P6-01 **Line Numbers Gutter & Find/Replace (`Ctrl/Cmd+F`, `Ctrl/Cmd+H`) in the Code Editor** (requested by maintainer, 2026-11-02).
  - **Line Numbers Gutter (`app.html`, `src/styles.css`, `src/app/shade.js`)**:
    - Add `<div id="editorGutter" class="editor-gutter" aria-hidden="true"></div>` inside `#code-scroll` alongside `.editor-wrap`.
    - Synchronize gutter line numbers and wrapped-line heights with `drawShade()` and `highlightCodeRange()`, highlighting both the active caret line and any Stage-selected code range.
  - **Find & Replace Bar (`app.html`, `src/styles.css`, `src/app/find.js`)**:
    - Add a compact `#findBar` toolbar at the top of `#code-pane` with search input, case-sensitivity toggle (`Aa`), match counter (`1 of N`), Next/Previous buttons (`Enter` / `Shift+Enter`), Replace input, **Replace**, and **Replace All**.
    - Highlight all active search matches inside `.editor-shade` (`<mark class="sh-find-match">`) and execute Replace / Replace All through `applyEdit()` so replacements are undoable with `Ctrl/Cmd+Z` (D-010).
    - Implement in a dedicated `src/app/find.js` module (registered in `app.html` and `sw.js`) to keep `src/app/shade.js` and `src/app/typing.js` well below 500 lines (D-001).
  - **Verification**: Unit tests for search/replace offset helpers in `test/` and structural check in `test/structure.test.js`.
- [ ] P6-02 **File Operations in Explorer & Dirty Indicators (`•`) on Tabs** (requested by maintainer, 2026-11-02).
  - **Per-File Dirty Indicators (`src/app/core.js`, `src/app/persistence.js`, `src/filesync.js`)**:
    - Track baseline `savedFileEntries` per file on project load, Studio save (`saveScript`), and folder export.
    - Render an unsaved indicator (`•`) on modified file tabs in `#fileTabs` and modified rows in `#fileExplorer` whenever `projectFiles.entries[path] !== savedFileEntries[path]`.
  - **Explorer File Operations (`src/app/explorer-ui.js`, `src/app/core.js`, `src/styles.css`)**:
    - Support **Rename File**, **Duplicate File**, and **Delete File** directly from `#fileExplorer` (via hover quick-action buttons and right-click context menu).
    - Record a project-wide Undo snapshot (`pushUndoSnapshot` in `src/app/typing.js`) before every file rename, duplicate, or delete so file tree operations can be undone/redone (`D-010`), and prevent deleting the last remaining `.html` file.
    - Place Explorer UI handlers in `src/app/explorer-ui.js` (registered in `app.html` and `sw.js`) so `src/app/core.js` (currently 390 lines) stays under the 500-line ceiling (D-001).
  - **Verification**: Unit tests in `test/project.test.js` for file rename/duplicate/delete state helpers and structural check in `test/structure.test.js`.

## Phase 7: Future Backlog (Not Yet Committed)

Not committed. Decide only after Phases 5 and 6 are complete. `P7-04`..`P7-07` are the maintainer's chosen next four (priority order, 2026-11-02); the rest are unprioritized.

- [ ] P7-01 Visual CSS Grid & Flexbox interactive gap/alignment handles on the Design Stage (proposed 2026-11-02).
- [ ] P7-02 Visual Asset Manager & Image Picker modal browsing local project images with thumbnail previews (proposed 2026-11-02).
- [ ] P7-03 Responsive Media Query Switcher in the CSS Designer to scope style edits to `@media (max-width: 768px)` or `@media (max-width: 375px)` (proposed 2026-11-02).
- [ ] P7-04 **Broken-link checker and Problems tab** (suggested by agent, maintainer-prioritized #1, 2026-11-02). Project-wide check for dead page links, missing images, stylesheets, and scripts using `Project.resolveRelativePath` (P5-02, D-012), shown in a Problems Inspector tab beside the Console with click-to-jump.
- [ ] P7-05 **Project-wide Find & Replace** (suggested by agent, maintainer-prioritized #2, 2026-11-02). Search and replace across every text file in `projectFiles.entries`, as one undoable step (D-010). Builds on the single-file find in `P6-01`.
- [ ] P7-06 **Drag-to-insert from the Insert palette onto the Stage** (suggested by agent, maintainer-prioritized #3, 2026-11-02). Drag a snippet from **Insert ▾** onto the Design Stage using the pointer-based drop targets (D-008), spliced via `HtmlAst.insertElement`.
- [ ] P7-07 **Pseudo-state editing in the CSS Designer** (requested by maintainer, prioritized #4, 2026-11-02). Edit `:hover`, `:focus`, `:active`, and similar rules for the selected element, and preview each state on the Stage. Needs `CssAst` support for compound selectors and a decision on how to show a forced state.
- [ ] P7-08 **Folder operations in the Explorer** (suggested by agent, 2026-11-02). New folder, move file, and drag-to-reorder; the file operations themselves are `P6-02`.
- [x] P7-09 **Binary assets in the browser build** (suggested by agent, 2026-11-02). Confirmed 2026-11-02: browser folder open listed images in the tree but never loaded them, and the `srcdoc` Stage resolved `images/hero.jpg` against the app origin, so every project image was broken (Tauri was unaffected, D-006). Done 2026-11-02 (D-013): binaries are loaded as Blobs on folder open, stored in a new `assets` IndexedDB store, and the preview rewrites relative `src`/`srcset`/`poster`/`<link href>`/CSS `url()` to `blob:` URLs. Verified by 2 tests in `test/project.test.js` and a browser check of folder open, reload persistence, duplicate, and purge cascade. Not covered: images set from user JS, adding images via import/drop (see `P7-02`), and a real `showDirectoryPicker` run (simulated).
- [x] P7-10 **Shared page parts (header/footer reuse across pages)** (suggested by agent, 2026-11-02). Done 2026-11-02 (D-014, maintainer chose marker regions): a part is a project `.html` file; pages hold a `<!-- pc:part src="..." -->` region with a copy of it, so every file stays plain HTML. New `src/parts.js` (find, scan, sync, pull), `src/app/parts-ui.js`, a **Parts** Inspector tab, **Make Part…** in the Inspector, and auto-sync of every page when the part file is edited. Verified by 2 tests in `test/project.test.js`, 1 in `test/structure.test.js`, and a browser check of make, insert, edit-propagates, divergence status, and undo/redo. Not covered: nested parts (reported as unmatched), editing a part while seeing the Stage in page context (Stage shows the fragment), and Export/standalone HTML (markers stay as comments).
- [ ] P7-11 **Accessibility and validation hints** (suggested by agent, 2026-11-02). Missing `alt`, heading order, duplicate IDs, and unclosed tags, reported through the Problems tab from `P7-04`.
- [ ] P7-12 **Preview in a real browser or on a phone** (suggested by agent, 2026-11-02). Serve the project over the local network; Tauri already runs an asset server (D-005).
- [ ] P7-13 **Zip export** (suggested by agent, 2026-11-02). Whole-project download for the browser build, which cannot write to a folder as the desktop app can.
- [ ] P7-14 **Format / beautify the current file** (suggested by agent, 2026-11-02).
- [ ] P7-15 **Keyboard-shortcut cheat sheet** (suggested by agent, 2026-11-02). Check what `src/app/help.js` already covers before building.
