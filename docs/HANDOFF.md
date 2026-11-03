# Handoff

<!-- Read `Current state` at session start. Update `Current state` in place and prepend one `Session log` entry at session end. -->

## Current state

Last updated: 2026-11-03
- **Phase**: Phases 1-6 complete; `P7-04`, `P7-05`, `P7-06`, `P7-07`, `P7-02`, `P7-09`, `P7-10`, `P7-13`, `P7-16` done; Phase 7 backlog continues (`P6-01`, `P6-02`) ([`ROADMAP.md`](../ROADMAP.md))
- **Verified with**:
  - `npm test` — passed (`60/60` unit & structural tests); `cargo test --manifest-path src-tauri/Cargo.toml` — passed (`2/2`)
  - `python3 tools/check_docs.py` — passed (`0 error(s), 0 warning(s)`)
  - `python3 tools/manual.py check docs/plainchant-web.manual.json && python3 -m unittest tools/test_manual.py` — passed (`3` sections, `19` entries, `6/6` tests)
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

- **Inspector docking (`P7-16`, `D-016`)**: bottom/top/left/right/float via the Dock menu; side docks resizable and remembered (`src/app/dock-ui.js`, `src/app/panes.js`).

- **Explorer file operations & unsaved dots (`P6-02`, `D-017`)**: Rename/Duplicate/Delete with link updates and undo; `•` markers (`src/app/explorer-ui.js`).

- **Problems tab (`P7-04`, `D-018`)**: static link/missing-file checker with badge and click-to-jump (`src/links.js`, `src/app/problems-ui.js`).

- **Project-wide find/replace (`P7-05`, `D-019`)**: Project scope on the find bar with results list and Replace All in Project (`src/app/find-project.js`, `Finding.findInFiles`).

- **Drag-to-insert (`P7-06`, `D-020`)**: drag Insert menu items onto the Design Stage with a before/after/inside guide (`src/app/insert-drag.js`).

- **CSS pseudo-states (`P7-07`, `D-021`)**: State bar in the CSS Designer, forced-state preview via `[data-pc-force~="state"]` selector twins (`src/app/css-states.js`, `CssAst.forceStates`).

- **Zip export (`P7-13`, `D-022`)**: Export dialog button, stored zip writer (`src/zip.js`, `src/app/zip-ui.js`).

- **Asset manager (`P7-02`, `D-023`)**: Assets modal, picker, uploads and deletes for blob images in the browser build (`src/app/asset-ui.js`, `src/imagelib.js`).

### In flight

- `P7-02` and its `D-024` follow-ups are complete but uncommitted. Nothing half-built.

### Known issues & gotchas

- **WebKitGTK HTML5 Drag-and-Drop**: Native `draggable="true"` / `dragover` / `drop` inside an `iframe[srcdoc]` is unreliable on Linux WebKitGTK (`D-008`). Keep Stage drag-and-drop on deterministic pointer events (`mousedown` / `mousemove` / `mouseup` in [`src/app/stage.js`](../src/app/stage.js)).
- **500-Line Module Cap**: [`test/structure.test.js`](../test/structure.test.js) enforces a hard 500-line ceiling on every `.js` file under `src/app/` (`D-001`). [`src/app/stage.js`](../src/app/stage.js) (~458 lines) and [`src/app/core.js`](../src/app/core.js) are near the limit; extract helpers before adding large features.
- **Service worker is cache-first (`sw.js`)**: after changing any app file, a browser that already installed the app can keep serving old scripts; hard-reload when testing. `CACHE_NAME` has never been bumped, so consider a version bump per release.
- **Browser folder open was not driven end to end**: `showDirectoryPicker` cannot be automated, so `P7-09` was checked by calling `activateImportedFolderProject` with a real PNG. Try it by hand in Chromium with a folder of images.
- **Console line mapping (`D-011`)**: relies on document-relative `lineno` for inline scripts. Verified in Chromium only; check WebKitGTK (Tauri on Linux) when next running the desktop app. `stage.js` is ~466 lines; put new Stage code in `stage-live.js` or a new file.
- **Insert drag was driven with synthetic pointer events (`D-020`)**: try a real mouse drag, and a drag in the Tauri WebKitGTK shell (pointer capture on `document.body`, `elementFromPoint` into the Stage).
- **Desktop image add/rename not driven in a real Tauri window (`D-024`)**: the base64 `assets` export, `adoptDiskImage` (fetch from the localhost server) and `window.prompt`/`confirm` are unverified there; the Rust decoder and path guard have unit tests. Deleting disk-only images is deliberately not offered, and export never deletes files.
- **Dialogs in the desktop shell (`D-017`)**: Rename, New File, and Make Part use `window.prompt`; not verified in Tauri WebKitGTK. If it returns `null` there, replace with an in-app modal.
- **Syntax colours can still switch off (`D-002`)**: `checkShade` permanently disables colouring on a detected wrap mismatch. The known cause (dropped `/` in `/>`) is fixed and guarded by a round-trip test, but any new tokenizer change must keep run text identical to the source. Settings > Syntax colours off/on re-enables without reload.
- **Stage Focus vs. Editor Selection**: Selecting or typing in a Stage element must keep `focusEditor: false` / `keepFocus: true` so keyboard focus stays inside the Stage iframe (`D-009`).

### Next up

1. **Phase 7 backlog** ([`ROADMAP.md`](../ROADMAP.md)): the maintainer's four priorities (`P7-04`..`P7-07`) are done; the rest (`P7-01`, `P7-03`, `P7-08`, `P7-11`, `P7-12`, `P7-14`, `P7-15`) is unprioritized (`P7-02`, `P7-13` are done), so ask which is next.

### Open questions

- None blocking. `Q-001` (Phase order) was resolved 2026-11-02: Phase 5 first. (See [`docs/DECISIONS.md`](DECISIONS.md).)

---

## Session log

<!-- Prepend new entries directly below this comment. Keep the last 10 entries here; move older ones to `docs/archive/handoff-log.md`. -->

### Session 2m: 2026-11-03: P7-02 follow-ups (asset undo, rename, desktop add, CSS background picker)

- **Did**: asset map in undo snapshots (`assetsForSnapshot`, `restoreProjectAssets`, `beginAssetChange`/`finishAssetChange` in [`src/app/assets.js`](../src/app/assets.js)); `Project.renameAsset`; Rename/Delete in [`src/app/asset-ui.js`](../src/app/asset-ui.js); `change.apply` hook in `commitFileChange`; desktop add via base64 `assets` in `save_project_folder` ([`src-tauri/src/main.rs`](../src-tauri/src/main.rs)); **Bg Image** field with **Browse…**.
- **Decided**: `D-024` (export never deletes or moves disk files; disk-only images cannot be deleted in the desktop app).
- **Verified**: `npm test` (`60/60`); `cargo test` (`2/2`); browser check of add/undo/redo, rename with link rewrite and undo, delete and undo, Bg Image picker writing `url("images/logo.png")`. Full check results are in this session's final report.
- **Next**: ask which backlog item is next.

### Session 2l: 2026-11-02: P7-02 asset manager and image picker

- **Did**: [`src/imagelib.js`](../src/imagelib.js), `Links.usage`, `Project.treeAfter` `add`; `addProjectAsset` / `removeProjectAsset` and incremental IndexedDB writes; [`src/app/asset-ui.js`](../src/app/asset-ui.js) (modal, picker, add, delete); **Assets** and **Browse…** buttons; image drops routed in `import.js`; folder export writes added assets.
- **Decided**: `D-023`.
- **Verified**: `npm test` (`59/59`); browser check of add, filter, insert, use-on-selected, picker, usage counts, delete, drop, reload persistence, folder-project tree, zip. Full check results are in this session's final report.
- **Next**: ask which backlog item is next.

### Session 2k: 2026-11-02: P7-13 zip export

- **Did**: [`src/zip.js`](../src/zip.js) (stored zip writer and reader); [`src/app/zip-ui.js`](../src/app/zip-ui.js) and the Export dialog section; `assert.throws` added to [`test/harness.js`](../test/harness.js).
- **Decided**: `D-022` (stored only, pages at the top level, hidden in Tauri, dirty dots not reset).
- **Verified**: `npm test` (`56/56`); `unzip -t` and Python `zipfile` on a generated archive (binary identical); browser check capturing the download. Full check results are in this session's final report.
- **Next**: ask which backlog item is next.

### Session 2j: 2026-11-02: P7-07 CSS Designer pseudo-states

- **Did**: `CssAst.stateOf` / `baseSelector` / `withState` / `splitTopLevel` / `forceStates`; `forceStates` option in `Project.assemblePreview`; bridge `applyForce` and `pc-force-state` in [`src/app/stage.js`](../src/app/stage.js); [`src/app/css-states.js`](../src/app/css-states.js) and the State bar; base-selector target list in [`src/app/inspector-ui.js`](../src/app/inspector-ui.js) (now ~478 lines, near the cap).
- **Decided**: `D-021`.
- **Verified**: `npm test` (`54/54`); browser check of the picker, forced preview on the element and its ancestors, edit and undo, new-rule creation, custom state selectors, inline styles, Live mode, and a clean source. Full check results are in this session's final report.
- **Next**: the maintainer's four Phase 7 priorities are done; ask which backlog item is next.

### Session 2i: 2026-11-02: P7-06 drag-to-insert onto the Stage

- **Did**: `HtmlAst.insertElementAt` (offset and new id; `insertElement` now wraps it); `DomOutline.dropPlacement`; [`src/app/insert-drag.js`](../src/app/insert-drag.js) (pointer drag, ghost, guide, edge scroll, Escape/cancel); `inside` guide CSS in the bridge; ghost CSS.
- **Decided**: `D-020`.
- **Verified**: `npm test` (`51/51`); browser check with synthetic pointer events of threshold, ghost, before/after/inside drops, Escape, pointercancel, release outside, Live mode, undo, and click-to-insert. Full check results are in this session's final report.
- **Next**: `P7-07` pseudo-states in the CSS Designer.

### Session 2h: 2026-11-02: P7-05 project-wide find and replace

- **Did**: `Finding.findInFiles` / `replaceInFiles` ([`src/finding.js`](../src/finding.js)); [`src/app/find-project.js`](../src/app/find-project.js) (Project toggle, results list, per-file checkboxes, Replace All in Project, `Ctrl/Cmd+Shift+F`); small hooks in [`src/app/find.js`](../src/app/find.js).
- **Decided**: `D-019` (scope of the existing find bar; literal text, case toggle).
- **Verified**: `npm test` (`48/48`); browser check of shortcut, results, jump, exclusion, replace, one-step undo/redo, dirty dots, and returning to file mode. Full check results are in this session's final report.
- **Next**: `P7-06` palette drag-to-insert.

### Session 2g: 2026-11-02: P7-04 broken-link checker and Problems tab

- **Did**: [`src/links.js`](../src/links.js) (extract, resolve, severities, offsets, per-file cache); [`src/app/problems-ui.js`](../src/app/problems-ui.js) and the **Problems** tab with badge and click-to-jump; hooks in `render()`, `switchInspectorTab`, and the async asset load.
- **Decided**: `D-018` (errors vs warnings, what is skipped).
- **Verified**: `npm test` (`46/46`); browser check of badge, summary, jump, live re-check, rename keeping the count steady, and no clipped controls on any dock. Full check results are in this session's final report.
- **Next**: `P7-05` project-wide find/replace.

### Session 2f: 2026-11-02: syntax colour fix and P6-02 Explorer file operations

- **Did**: HTML shader keeps every character and falls back to plain text per line (`D-002`); `P6-02`: file helpers in [`src/project.js`](../src/project.js), `FileSync.dirtyPaths`, [`src/app/explorer-ui.js`](../src/app/explorer-ui.js), undo snapshots store tabs and tree, dirty baseline resets on load, explicit Save, and Export.
- **Decided**: `D-017` (rename rewrites links; dirty = changed since explicit save).
- **Verified**: `npm test` (`44/44`); browser check of dots, rename with link updates, duplicate, context menu, delete (active file and last page), undo/redo. Full check results are in this session's final report.
- **Next**: Phase 7 backlog in the maintainer's order (`P7-04`, `P7-05`, `P7-06`, `P7-07`).

### Session 2e: 2026-11-02: Stage anchor fix, Inspector header overflow, dockable Inspector

- **Did**: Live bridge now handles `#anchor`/empty links and form submits (`D-012`); Inspector header wraps and the floating panel clips overflow; `P7-16` dockable Inspector: `#canvasBody` wrapper, **Dock** menu and side resizer in [`src/app/dock-ui.js`](../src/app/dock-ui.js), `setInspectorDock()` in [`src/app/panes.js`](../src/app/panes.js), `inspectorDock` / `inspectorWidth` settings.
- **Decided**: `D-016` (Stage-pane docks, tall single-column sides, menu control, per maintainer).
- **Verified**: `npm test` (`38/38`); browser check of all five docks on every tab (no clipped controls), menu, resize, clamping, reload persistence. Full check results are in this session's final report.
- **Next**: `P6-02`.

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
