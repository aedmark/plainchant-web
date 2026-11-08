# Handoff

<!-- Read `Current state` at session start. Update `Current state` in place and prepend one `Session log` entry at session end. -->

## Current state

_Last updated: 2026-11-08, session 2zb, on `master` at `0ffb1b1`: documentation brought in line with the current Manifold standard (AGENTS.md rules, held tensions, checker, handoff layout). Uncommitted: those doc edits, plus `index.html` and `src/home.css` (not mine)._

**Session owner:** none live. The `index.html` and `src/home.css` edits in the working tree belong to the maintainer.

- **Phase**: Phases 1-6 complete; `P7-04`, `P7-05`, `P7-06`, `P7-07`, `P7-01`, `P7-03`, `P7-08`, `P7-11`, `P7-12`, `P7-14`, `P7-15`, `P7-02`, `P7-09`, `P7-10`, `P7-13`, `P7-16` done; Phase 7 backlog continues (`P6-01`, `P6-02`) ([`ROADMAP.md`](../ROADMAP.md))

**Verified** (2026-11-08, on `0ffb1b1` plus uncommitted doc edits, Linux, Node v22.23.4, local Cargo)

| Suite | Result |
| --- | --- |
| `npm test` | **106/106** |
| `cargo test --manifest-path src-tauri/Cargo.toml` | **7/7** |
| `python3 tools/manual.py check docs/plainchant-web.manual.json` and `python3 -m unittest tools/test_manual.py` | **passed** (3 sections, 22 entries) |
| `python3 tools/check_docs.py` | **0 errors, 0 warnings** |

Not run this session: `cargo build`. Carried over from 2026-11-06: it passed then.

**Corrections**
- The earlier note said `cargo test` ran `5/5`; it runs `7/7` (2026-11-08).

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
- **Shortcut cheat sheet (`P7-15`, `D-031`)**: Help guide section from `src/shortcuts.js`, guarded by `test/shortcuts.test.js`.
- **Open file / folder / project (`D-033`)**: saved folder links, one folder = one project, Reload from disk (`src/projectlink.js`, `src/app/project-links.js`).
- **File / Edit menus (`D-032`)**: toolbar regrouped (`src/app/menus.js`).
- **Format (`P7-14`, `D-030`)**: **Edit > Format file** and `Alt+Shift+F`; HTML and CSS rebuilt, JS re-indented only (`src/format.js`, `src/app/format-ui.js`).
- **Network preview (`P7-12`, `D-029`)**: **Preview** dialog; desktop **Start sharing** runs a token-gated read-only server on the LAN with live reload, browser build opens a snapshot tab (`src/app/preview-ui.js`, `src/preview.js`, `src-tauri/src/preview.rs`).
- **Asset manager (`P7-02`, `D-023`)**: Assets modal, picker, uploads and deletes for blob images in the browser build (`src/app/asset-ui.js`, `src/imagelib.js`).

### In flight
- Nothing half-built.

### Known issues & gotchas

- **Network preview is plain HTTP and unverified on real devices (`D-029`)**: while sharing, anyone on the network with the link can read the project. HTTP behaviour has Rust tests over a loopback socket; a real phone, Tauri window, macOS/Windows openers, and firewall prompts were not exercised. No QR code.
- **WebKitGTK HTML5 Drag-and-Drop**: Native `draggable="true"` / `dragover` / `drop` inside an `iframe[srcdoc]` is unreliable on Linux WebKitGTK (`D-008`). Keep Stage drag-and-drop on deterministic pointer events (`mousedown` / `mousemove` / `mouseup` in [`src/app/stage.js`](../src/app/stage.js)).
- **500-Line Module Cap**: [`test/structure.test.js`](../test/structure.test.js) enforces a hard 500-line ceiling on every `.js` file under `src/app/` (`D-001`). [`src/app/stage.js`](../src/app/stage.js) (~458 lines) and [`src/app/core.js`](../src/app/core.js) are near the limit; extract helpers before adding large features.
- **Browser folder open was not driven end to end**: `showDirectoryPicker` cannot be automated, so `P7-09` was checked by calling `activateImportedFolderProject` with a real PNG. Try it by hand in Chromium with a folder of images.
- **Console line mapping (`D-011`)**: relies on document-relative `lineno` for inline scripts. Verified in Chromium only; check WebKitGTK (Tauri on Linux) when next running the desktop app. `stage.js` is ~466 lines; put new Stage code in `stage-live.js` or a new file.
- **Insert drag was driven with synthetic pointer events (`D-020`)**: try a real mouse drag, and a drag in the Tauri WebKitGTK shell (pointer capture on `document.body`, `elementFromPoint` into the Stage).
- **Hints are heuristics (`D-028`)**: no contrast, ARIA, or content-model checks; a clean Problems tab is not an accessibility audit. Labels are matched within one page only.
- **Explorer drag driven with synthetic pointer events (`D-027`)**: try a real mouse drag and Tauri WebKitGTK; Moves leave old copies on disk after export (`D-024`).
- **Breakpoint bar only supports exact `(max-width: Npx)` queries (`D-026`)**: other media blocks are ignored by the Designer. `inspector-ui.js` is at 487/500 lines; put new Designer code in its own file.
- **Gap handles driven with synthetic pointer events (`D-025`)**: try a real mouse drag and the Tauri WebKitGTK shell (pointer capture inside the iframe, `MutationObserver` redraws). `stage.js` is still at the line limit; put new Stage code in its own file.
- **Desktop image add/rename not driven in a real Tauri window (`D-024`)**: the base64 `assets` export, `adoptDiskImage` (fetch from the localhost server) is unverified there; the Rust decoder and path guard have unit tests. Deleting disk-only images is deliberately not offered, and export never deletes files.
- **Dialogs in the desktop shell (`D-017`)**: names are asked with `askText` and confirmations with `askConfirm` (in-app modals, `src/app/dialogs.js`); neither was driven in a real Tauri window.
- **Syntax colours can still switch off (`D-002`)**: `checkShade` permanently disables colouring on a detected wrap mismatch. The known cause (dropped `/` in `/>`) is fixed and guarded by a round-trip test, but any new tokenizer change must keep run text identical to the source. Settings > Syntax colours off/on re-enables without reload.
- **Stage Focus vs. Editor Selection**: Selecting or typing in a Stage element must keep `focusEditor: false` / `keepFocus: true` so keyboard focus stays inside the Stage iframe (`D-009`).

### Next up
1. **Phase 7 backlog** ([`ROADMAP.md`](../ROADMAP.md)) is complete (`P7-01`..`P7-16`). `P8-01` (enforce the invariants that have no check) is open; otherwise ask the maintainer what to plan next.

### Open questions
- None blocking. `Q-001` (Phase order) was resolved 2026-11-02: Phase 5 first. (See [`docs/DECISIONS.md`](DECISIONS.md).)

---

## Session log

<!-- Prepend new entries directly below this comment. Keep the last 10 entries here; move older ones to `docs/archive/handoff-log.md`. -->

### Session 2zb: 2026-11-08: adopt the expanded Manifold standard (docs only)

- **Did**: ported the new rules from `the-manifold` into [`AGENTS.md`](../AGENTS.md) (Zones, fore-conceptions, session ownership, pre-execution inquiry rules, consolidation step, new terms); added Held tensions and the Review trigger field to [`DECISIONS.md`](DECISIONS.md); `tools/check_docs.py` now checks `T-NNN` and invisible control characters and counts alphanumeric session IDs (`2za`); moved sessions 1 through 2q to `docs/archive/handoff-log.md`; gave Current state a session owner, a dated Verified table, and Corrections.
- **Verified**: `npm test` 106/106, `cargo test` 7/7, `check_docs.py` clean.
- **Corrections**: `cargo test` count was recorded as 5/5; it is 7/7. The old checker's `\d+` session pattern skipped IDs like `2za`, so the 10-entry limit never fired.
- **Also done**: [`TESTING.md`](TESTING.md) now has the suites table (Proves / Does not prove), Before any run, a change-to-check matrix, manual checks, and environment recipes (the stale "103 tests" count removed); [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`SECURITY.md`](SECURITY.md) follow the template's sections; `ARCHITECTURE.md` has the Claims-vs-code rule.
- **Then (maintainer: "go ahead")**: recorded `T-001` (source of truth against the Studio copy) and `T-002` (network preview against plain HTTP) in [`DECISIONS.md`](DECISIONS.md); added [`INVARIANTS.md`](INVARIANTS.md) (`INV-001`..`INV-006`, each with what enforces it) and a checker rule that every `INV-NNN` is defined once, ascending, cited elsewhere, and never cited undefined. Four invariants have no check; filed as `P8-01`.
- **Left undone**: proof badges (`[OBSERVED]` and so on) on Verified claims and a bidirectional handoff-to-roadmap check from the Vedas variants are not adopted; `P8-01`.
- **Next**: `P8-01`, or maintainer's choice.

### Session 2za: 2026-11-06: ports from the sister repo plainchant-scribe

- **Did**: reviewed `plainchant-scribe` (forked from this repo at `4c30d7b`). `askText` was already here; added `askConfirm` and used it for asset delete (the last `window.confirm`); ported the network-first, own-cache-only service worker ([`sw.js`](../sw.js), `D-035`) with fake-cache tests.
- **Not ported yet** (offered to the maintainer): QR code for the network preview (`src/qr.js`), deflate support in `src/zip.js`, a CSS lint, light/dark manuscript theming, a round-trip corpus test.
- **Verified**: `npm test` (`106/106`). Not driven in a browser or the desktop window.
- **Next**: maintainer picks from the not-ported list.

### Session 2z: 2026-11-03: Prism for syntax colours (maintainer request)

- **Did**: vendored Prism 1.30.0 (`src/vendor/prism/`), rewrote [`src/code-shade.js`](../src/code-shade.js) around `Prism.tokenize()` with the same output shape, added a Third-Party Notices section to `LICENSE`, and [`test/codeshade.test.js`](../test/codeshade.test.js).
- **Decided**: `D-034`: the maintainer allowed a local Prism or a credited facsimile; I vendored the real file. This is the only exception to the zero-dependency rule.
- **Verified**: `npm test`; browser check of three file types, tab switches, and that Prism's auto-highlighting is off. Not run in the desktop window.
- **Next**: the file-switch fix `82d2ef5` is still unpushed.

### Session 2y: 2026-11-03: fix mashed file text after a tab switch (maintainer report)

- **Did**: [`src/app/shade.js`](../src/app/shade.js) `drawShade` now empties the colour layer when the language changes, and `paintShade` repaints from scratch if the layer's line count disagrees with its keys. Cause: `shadeKeys = []` was reset without clearing the DOM, so the incremental painter inserted the new lines and kept the old ones.
- **Verified**: reproduced in the browser pane (the layer gained lines on every switch), then 9 switches including rapid ones and edit-then-switch matched the editor text. The file contents were never affected.
- **Next**: more maintainer feedback.

### Session 2x: 2026-11-03: home page and quick guide

- **Did**: rewrote [`index.html`](../index.html) and trimmed [`src/home.css`](../src/home.css) (it began as an exact copy of the sister `plainchant` site's stylesheet; screenplay-only classes were replaced by code, Stage, step, and feature blocks).
- **Verified**: `npm test`; browser check at desktop and phone width (no horizontal overflow). Copy was written from what the app does; the desktop app has only been run on Linux, so the page names no platforms.
- **Next**: more maintainer feedback. The manual link (`docs/manual.html`) is not in the service worker cache and is not in the Tauri `dist` build, so it works on a web host only.

### Session 2w: 2026-11-03: Open file / folder / project and one folder = one project (maintainer feedback)

- **Did**: folder links saved in the existing `files` store; reopening a known folder opens its project with **Reload from disk** when the disk changed; **Open file…**; canonical folder paths and `use_project_folder` in Rust ([`src/projectlink.js`](../src/projectlink.js), [`src/app/project-links.js`](../src/app/project-links.js)).
- **Decided**: `D-033` (maintainer chose: open the Studio copy and offer a reload; standalone one-file projects).
- **Verified**: `npm test`, `cargo test`; browser check with a faked Tauri bridge (first open, reopen without a duplicate, disk change, reload and undo, switch away and back, link survives a page reload, Open file with css, html, and several files). No real desktop window or directory picker.
- **Next**: more maintainer feedback. Folders opened before this change have no saved link.

### Session 2v: 2026-11-03: toolbar File and Edit menus (maintainer feedback)

- **Did**: **File ▾** and **Edit ▾** menus replace the New, Projects, Folder, Export, Preview, Copy, and Format buttons ([`src/app/menus.js`](../src/app/menus.js)); the Format button left the tab strip.
- **Decided**: `D-032` (maintainer chose File / Edit menus). Insert, Assets, and Save stay on the toolbar (Undo and Redo moved into Edit).
- **Verified**: `npm test`; browser check of open, switch, close, focus, arrow keys, Escape, and each moved item. Desktop window not checked.
- **Next**: more maintainer feedback on odd behaviour.

### Session 2u: 2026-11-03: Explorer polish (maintainer feedback)

- **Did**: Folders collapse (`explorerCollapsed`, `toggleExplorerDir`, `expandExplorerTo` in `src/app/core.js`); clicking an image opens the Assets dialog filtered to it instead of inserting `<img>`.
- **Verified**: `npm test`; browser check of collapse, filter, auto-expand on open, and image click (HTML unchanged). Collapsed state is per session and not remembered.
- **Next**: more maintainer feedback on odd behaviour.

### Session 2t: 2026-11-03: P7-15 keyboard shortcut cheat sheet

- **Did**: [`src/shortcuts.js`](../src/shortcuts.js); shortcut section in the Help guide ([`src/app/help.js`](../src/app/help.js)); [`test/shortcuts.test.js`](../test/shortcuts.test.js).
- **Decided**: `D-031`.
- **Verified**: `npm test` (`92/92`); browser check that `F1` shows 5 groups and 25 rows. Full check results are in this session's final report.
- **Next**: Phase 7 is complete; ask the maintainer what to plan next.

### Session 2s: 2026-11-03: P7-14 format the current file

- **Did**: [`src/format.js`](../src/format.js) (HTML, CSS, JS formatters); [`src/app/format-ui.js`](../src/app/format-ui.js), the **Format** button, and `Alt+Shift+F`.
- **Decided**: `D-030` (JS is re-indentation only; no JSON).
- **Verified**: `npm test` (`90/90`); browser check of the shortcut, all three file types, stage update, and undo. Full check results are in this session's final report.
- **Next**: ask whether `P7-15` is next.

Older sessions (1 through 2r) are in [archive/handoff-log.md](archive/handoff-log.md).
