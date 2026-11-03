# Handoff

<!-- Read `Current state` at session start. Update `Current state` in place and prepend one `Session log` entry at session end. -->

## Current state

Last updated: 2026-11-02
- **Phase**: Phase 5 in progress: `P5-01` done, `P5-02` next; Phase 6 specced (`P6-01`, `P6-02`) ([`ROADMAP.md`](../ROADMAP.md))
- **Verified with**:
  - `npm test` — passed (`26/26` unit & structural tests)
  - `python3 tools/check_docs.py` — passed (`0 error(s), 0 warning(s)`)
  - `python3 tools/manual.py check docs/plainchant-web.manual.json && python3 -m unittest tools/test_manual.py` — passed (`3` sections, `11` entries, `6/6` tests)
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

### In flight

- `P5-01` is complete but uncommitted (nothing else half-built).

### Known issues & gotchas

- **WebKitGTK HTML5 Drag-and-Drop**: Native `draggable="true"` / `dragover` / `drop` inside an `iframe[srcdoc]` is unreliable on Linux WebKitGTK (`D-008`). Keep Stage drag-and-drop on deterministic pointer events (`mousedown` / `mousemove` / `mouseup` in [`src/app/stage.js`](../src/app/stage.js)).
- **500-Line Module Cap**: [`test/structure.test.js`](../test/structure.test.js) enforces a hard 500-line ceiling on every `.js` file under `src/app/` (`D-001`). [`src/app/stage.js`](../src/app/stage.js) (~458 lines) and [`src/app/core.js`](../src/app/core.js) are near the limit; extract helpers before adding large features.
- **Console line mapping (`D-011`)**: relies on document-relative `lineno` for inline scripts. Verified in Chromium only; check WebKitGTK (Tauri on Linux) when next running the desktop app. `stage.js` is ~458 lines.
- **Stage Focus vs. Editor Selection**: Selecting or typing in a Stage element must keep `focusEditor: false` / `keepFocus: true` so keyboard focus stays inside the Stage iframe (`D-009`).

### Next up

1. **`P5-02`**: Multi-Page Link Navigation on the Stage (`Project.resolveRelativePath`, click in Live JS mode or `Ctrl/Cmd+Click` / badge button in Design mode).
2. **`P6-01`**: Line Numbers Gutter (`#editorGutter`) & Find/Replace bar (`#findBar`, `Ctrl/Cmd+F`, `Ctrl/Cmd+H`, `src/app/find.js`) in the Code editor.
3. **`P6-02`**: File Operations in Explorer (Rename, Duplicate, Delete in `src/app/explorer-ui.js`) & per-file dirty indicators (`•`) on `#fileTabs` and `#fileExplorer`.

### Open questions

- None blocking. `Q-001` (Phase order) was resolved 2026-11-02: Phase 5 first. (See [`docs/DECISIONS.md`](DECISIONS.md).)

---

## Session log

<!-- Prepend new entries directly below this comment. Keep the last 10 entries here; move older ones to `docs/archive/handoff-log.md`. -->

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
