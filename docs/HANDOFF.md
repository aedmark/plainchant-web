# Handoff

<!-- Read `Current state` at session start. Update `Current state` in place and prepend one `Session log` entry at session end. -->

## Current state

Last updated: 2026-11-02
- **Phase**: Phases 1-5 complete; `P6-01`, `P7-09`, `P7-10` done; `P6-02` next (`P6-01`, `P6-02`) ([`ROADMAP.md`](../ROADMAP.md))
- **Verified with**:
  - `npm test` — passed (`36/36` unit & structural tests)
  - `python3 tools/check_docs.py` — passed (`0 error(s), 0 warning(s)`)
  - `python3 tools/manual.py check docs/plainchant-web.manual.json && python3 -m unittest tools/test_manual.py` — passed (`3` sections, `15` entries, `6/6` tests)
  - `cargo build --manifest-path src-tauri/Cargo.toml` — passed

### What works

- **Foundations & Parsers (`P1-01`..`P1-04`)**: Non-destructive HTML5 (`src/html-ast.js`) and CSS (`src/css-ast.js`) byte-offset parsers and splicers (`D-001`, `D-003`), multi-file project bundler (`src/project.js`, `D-004`), and transparent-textarea syntax shader (`src/code-shade.js`, `src/app/shade.js`, `D-002`).
- **Core WYSIWYG Stage & Inspector (`P2-01`..`P2-06`)**:
  - Split Code / Design / Live JS Stage (`src/app/stage.js`, `src/app/panes.js`) with Stage-to-Code block highlighting (`P2-01`).
  - Dockable, collapsible, hideable, and floating Properties & CSS Designer Inspector (`src/app/inspector-ui.js`) with live `getComputedStyle` telemetry, box-model Stage overlays, and **Go to CSS ↗** rule jumping (`P2-02`, `D-007`).
  - Pointer-based Stage drag-and-drop reordering, floating badge actions (`↑`, `↓`, `⧉`, `✕`), and element duplication (`P2-03`, `D-008`).
  - Focus-preserving Stage selection and single-click direct WYSIWYG text editing (`P2-04`, `D-009`).
  - Project-wide multi-file Undo and Redo stack (`P2-05`, `D-010`).
  - Top menu bar above file tabs, **Insert ▾** dropdown menu, and right-click context menu (`#contextMenu`) (`P2-06`).
- **Desktop Tauri Shell & Isolated Workspace (`P3-01`..`P3-03`)**: Tauri v2 shell (`src-tauri/src/main.rs`) with localhost static asset server (`D-005`, `D-006`), IDE File Explorer sidebar (`#fileExplorer`), and isolated Studio workspace on folder open with structure-preserving local folder Export (`src/app/tauri-files.js`, `src/app/export.js`).

- **JS Console (`P5-01`, `D-011`)**: Console Inspector tab (`src/app/console-ui.js`) fed by `Project.consoleBridge` in Live JS mode.

- **Link navigation (`P5-02`, `D-012`)**: Live JS click and Design `Ctrl/Cmd+Click` / `Follow ↗` / **Follow Link ↗** open linked project pages (`src/app/stage-live.js`, `Project.resolveRelativePath`).

- **Browser binary assets (`P7-09`, `D-013`)**: images/fonts from an opened folder load as Blobs, persist in the IndexedDB `assets` store (DB v2), and render via `blob:` URLs (`src/app/assets.js`, `Project.rewriteAssetUrls`).
- **Shared page parts (`P7-10`, `D-014`)**: marker-region parts, **Parts** tab, **Make Part…**, auto-sync on part edit (`src/parts.js`, `src/app/parts-ui.js`).

- **Line numbers & Find/Replace (`P6-01`, `D-015`)**: `#editorGutter` in `src/app/shade.js`; `#findBar` with `Ctrl/Cmd+F` / `Ctrl/Cmd+H` in `src/app/find.js` and `src/finding.js`.

### In flight

- `P6-01` is complete but uncommitted. Nothing half-built.

### Known issues & gotchas

- **WebKitGTK HTML5 Drag-and-Drop**: Native `draggable="true"` / `dragover` / `drop` inside an `iframe[srcdoc]` is unreliable on Linux WebKitGTK (`D-008`). Keep Stage drag-and-drop on deterministic pointer events (`mousedown` / `mousemove` / `mouseup` in [`src/app/stage.js`](../src/app/stage.js)).
- **500-Line Module Cap**: [`test/structure.test.js`](../test/structure.test.js) enforces a hard 500-line ceiling on every `.js` file under `src/app/` (`D-001`). [`src/app/stage.js`](../src/app/stage.js) (~458 lines) and [`src/app/core.js`](../src/app/core.js) are near the limit; extract helpers before adding large features.
- **Service worker is cache-first (`sw.js`)**: after changing any app file, a browser that already installed the app can keep serving old scripts; hard-reload when testing. `CACHE_NAME` has never been bumped, so consider a version bump per release.
- **Browser folder open was not driven end to end**: `showDirectoryPicker` cannot be automated, so `P7-09` was checked by calling `activateImportedFolderProject` with a real PNG. Try it by hand in Chromium with a folder of images.
- **Console line mapping (`D-011`)**: relies on document-relative `lineno` for inline scripts. Verified in Chromium only; check WebKitGTK (Tauri on Linux) when next running the desktop app. `stage.js` is ~466 lines; put new Stage code in `stage-live.js` or a new file.
- **Stage Focus vs. Editor Selection**: Selecting or typing in a Stage element must keep `focusEditor: false` / `keepFocus: true` so keyboard focus stays inside the Stage iframe (`D-009`).

### Next up

1. **`P6-02`**: File Operations in Explorer (Rename, Duplicate, Delete in `src/app/explorer-ui.js`) & per-file dirty indicators (`•`) on `#fileTabs` and `#fileExplorer`.

2. **Phase 7 backlog** ([`ROADMAP.md`](../ROADMAP.md)): maintainer-chosen order after Phase 6 is `P7-04` link checker, `P7-05` project-wide find/replace, `P7-06` palette drag-to-insert, `P7-07` CSS Designer pseudo-states.

### Open questions

- None blocking. `Q-001` (Phase order) was resolved 2026-11-02: Phase 5 first. (See [`docs/DECISIONS.md`](DECISIONS.md).)

---

## Session log

<!-- Prepend new entries directly below this comment. Keep the last 10 entries here; move older ones to `docs/archive/handoff-log.md`. -->

### Session 2d: 2026-11-02: P6-01 line numbers and Find/Replace

- **Did**: gutter in [`src/app/shade.js`](../src/app/shade.js) (hidden-mirror row heights, caret and Stage-selection highlight); [`src/finding.js`](../src/finding.js) helpers; [`src/app/find.js`](../src/app/find.js) bar, match layer, shortcuts; CSS, `app.html`, help text, README.
- **Decided**: `D-015`. The roadmap's `#code-scroll` / `#code-pane` do not exist, so markup went in `.editor-wrap` / above `.workspace-body`.
- **Verified**: `npm test` (`35/35`), browser check of wrapped-line numbering, find, case toggle, next/previous, Replace, Replace All, undo. Full check results are in this session's final report.
- **Next**: `P6-02`.

### Session 2c: 2026-11-02: P7-09 browser binary assets and P7-10 shared page parts

- **Did**: `P7-09`: `Store` assets store and `Project.rewriteAssetUrls`/`rewriteCssUrls`/`mimeFor`, [`src/app/assets.js`](../src/app/assets.js), folder scan and export changes in [`src/app/tauri-files.js`](../src/app/tauri-files.js). `P7-10`: [`src/parts.js`](../src/parts.js), [`src/app/parts-ui.js`](../src/app/parts-ui.js), Parts tab, **Make Part…**, `propagatePartEdits` hook in `render()`.
- **Decided**: `D-013` (amends `D-004`; chosen: Blobs in memory + IndexedDB), `D-014` (chosen: marker regions).
- **Verified**: `npm test` (`33/33`), browser checks (folder open with a real PNG, reload persistence, duplicate, purge cascade; make part, insert, part edit propagates, divergence status, undo/redo). Full check results are in this session's final report.
- **Next**: push both commits if not yet pushed; `P6-01`.

### Session 2b: 2026-11-02: P5-02 Multi-Page Link Navigation

- **Did**: `Project.resolveRelativePath` ([`src/project.js`](../src/project.js)); new [`src/app/stage-live.js`](../src/app/stage-live.js) (Live link bridge, `followProjectLink`); `Ctrl/Cmd+Click` and `Follow ↗` badge button in [`src/app/stage.js`](../src/app/stage.js); **Follow Link ↗** in Properties.
- **Decided**: `D-012`.
- **Verified**: `npm test` (`28/28`); browser check of Live click, Design `Ctrl/Cmd+Click`, plain Design click (selects only), badge and Properties buttons, and a missing target. Full check results are in this session's final report.
- **Next**: `P6-01`.

### Session 2: 2026-11-02: P5-01 In-App JS Console

- **Did**: Added `Project.consoleBridge` and per-script line map to `Project.assemblePreview` ([`src/project.js`](../src/project.js)); new [`src/app/console-ui.js`](../src/app/console-ui.js), Console tab and styles; wired `pc-console` in [`src/app/stage.js`](../src/app/stage.js); removed the `try/catch` wrapper and `pc-runtime-error`.
- **Decided**: `D-011`; resolved `Q-001` (Phase 5 first).
- **Verified**: `npm test` (`26/26`), manual Chromium check of logs, warnings, errors, badge, and click-to-jump. Full check results are in the final report of this session.
- **Next**: `P5-02` Multi-Page Link Navigation.

### Session 1: 2026-11-02: Initial Plainchant Web studio spin-off, WYSIWYG capabilities, and agent docs

- **Did**:
  - Built core studio architecture (`P1-01`..`P1-04`): [`src/html-ast.js`](../src/html-ast.js), [`src/css-ast.js`](../src/css-ast.js), [`src/project.js`](../src/project.js), and [`src/code-shade.js`](../src/code-shade.js).
  - Implemented Rich CSS Designer and dockable/floating Inspector (`P2-01`, `P2-02`, `D-007`) with computed style placeholders, box-model Stage overlays, **Go to CSS ↗** rule jumping, and Stage-to-Code highlighting.
  - Implemented Direct Stage Manipulation (`P2-03`, `P2-04`, `P2-06`): pointer-based drag-and-drop element reordering (`D-008`), on-stage action badges (`↑`, `↓`, `⧉`, `✕`), single-click direct WYSIWYG text editing (`D-009`), reorganized top menu bar, **Insert ▾** dropdown, and right-click context menu.
  - Added project-wide multi-file Undo/Redo (`P2-05`, `D-010`) and isolated studio project workspace semantics with structure-preserving local folder export (`P3-01`..`P3-03`, `D-005`, `D-006`).
  - Adopted `the-manifold` agent documentation scheme (`P4-01`, `P4-02`: `CLAUDE.md`, `AGENTS.md`, `ROADMAP.md`, `docs/*`, `tools/check_docs.py`), `3x-documentation-scheme` What/How/Why manual (`P4-03`: `docs/plainchant-web.manual.json`, `docs/manual.html`, `tools/manual.py`, `tools/test_manual.py`), and specced Phases 5 and 6 (`P5-01`, `P5-02`, `P6-01`, `P6-02`).
- **Decided**: `D-001` through `D-010`; logged `Q-001`.
- **Verified**: `npm test` (`23/23` passed), `python3 tools/check_docs.py` (`0 error(s), 0 warning(s)`), `python3 -m unittest tools/test_manual.py` (`6/6` passed), `cargo build --manifest-path src-tauri/Cargo.toml`.
- **Next**: Implement Phase 5 (`P5-01` In-App JS Console Drawer, `P5-02` Multi-Page Link Navigation) and Phase 6 (`P6-01` Line Numbers & Find/Replace, `P6-02` Explorer File Operations & Dirty Indicators).
