# Handoff

<!-- Read `Current state` at session start. Update `Current state` in place and prepend one `Session log` entry at session end. -->

## Current state

_Last updated: 2026-11-27, session 2zg, on `master`: Tauri v2 bundle config & icons, CI/Release workflows, `1.0.0` changelog & `docs/INVARIANTS.md` updated for `v1.0.0` release._

**Session owner:** none live.
- **Phase**: Phases 1-8 complete (`P1-01`..`P8-01`) ([`ROADMAP.md`](../ROADMAP.md))

**Verified** (2026-11-27, Linux, Node v22.23.4)

| Suite | Result |
| --- | --- |
| `npm test` | **119/119** |
| `cargo test --manifest-path src-tauri/Cargo.toml` | **7/7** |
| `cargo build --manifest-path src-tauri/Cargo.toml` | **passed** |
| `python3 tools/manual.py check ...` & `test_manual.py` | **passed** |
| `python3 tools/check_docs.py` | **0 errors, 0 warnings** |

Browser check (`http://localhost:8080/app.html`): verified `<p>Click here` + Tab stays prose, `li#item*2` + Tab deduplicates IDs (`#item`, `#item-2`), `<a href=/>` reports no stray tag error in Problems, Stage context Duplicate selects `#ctaBtn-copy`, and Format file (`#formatBtn`) completes cleanly with zero console errors. Real Tauri window dialogs remain unexercised here.

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
- **Stage formatting bar (`D-036`)**: [`src/app/style-bar.js`](../src/app/style-bar.js) (`#styleToolbar`) and [`src/typography.js`](../src/typography.js) provide an RTF-style toolbar above the Stage (target rule switcher, scope pill, font family, size presets/stepper, `B`/`I`/`U`/`S`, alignment, line height, letter spacing, and text/background color pickers) mirrored in the CSS Designer.

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
1. **All phases (`P1-01`..`P8-01`) complete.** Review and publish the `v1.0.0` draft GitHub Release once `.github/workflows/release.yml` finishes building desktop bundles.

### Open questions
- None blocking. `Q-001` (Phase order) was resolved 2026-11-02: Phase 5 first. (See [`docs/DECISIONS.md`](DECISIONS.md).)

---

## Session log

<!-- Prepend new entries directly below this comment. Keep the last 10 entries here; move older ones to `docs/archive/handoff-log.md`. -->

### Session 2zg: 2026-11-27: Desktop bundle setup, CI/Release workflows, and v1.0.0 release

- **Did**: Configured cross-platform Tauri v2 `bundle` in [src-tauri/tauri.conf.json](../src-tauri/tauri.conf.json) and generated desktop icons in `src-tauri/icons/`; created [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) and [`.github/workflows/release.yml`](../.github/workflows/release.yml); rolled [`docs/CHANGELOG.md`](CHANGELOG.md) to `1.0.0`, updated `Enforced by:` lines in [`docs/INVARIANTS.md`](INVARIANTS.md) (maintainer-approved) and [`docs/CONTRIBUTING.md`](CONTRIBUTING.md), committed to `master`, and pushed `master` + tag `v1.0.0`.
- **Verified**: `npm test` (119/119), `cargo test --manifest-path src-tauri/Cargo.toml` (7/7), `cargo tauri build --no-bundle`, `python3 tools/check_docs.py` (0 errors, 0 warnings), and manual checks.
- **Next**: Inspect the draft release artifacts produced by GitHub Actions and publish `v1.0.0`.

### Session 2zf: 2026-11-27: Batch 3 parser, formatter, linter, and P8-01 invariant fixes (code review follow-up)

- **Did**: Hardened [src/css-ast.js](../src/css-ast.js) (inline comments, `\\"` escapes, `@import`/`@keyframes`, empty `@media`, `+`/`~`/`:not()` combinators, whitespace decls, `forceStates`/`listSelectors` `[attr]` skips) and [src/html-ast.js](../src/html-ast.js) (`href=/` unquoted slash, descendant `duplicateElement` IDs/labels); fixed [src/format.js](../src/format.js), [src/links.js](../src/links.js), [src/project.js](../src/project.js) (`parseSrcset`, `url(...)` parens), [src/hints.js](../src/hints.js) (`textarea`/`title` RCDATA, `Parts.isPart` skip), [src/parts.js](../src/parts.js) (report nested parts per `D-014`, indent-tolerant sync comparison), [src/editing.js](../src/editing.js) & [src/suggest.js](../src/suggest.js); added `P8-01` invariant tests for `INV-001`..`INV-005` in [test/structure.test.js](../test/structure.test.js) and [test/project.test.js](../test/project.test.js).
- **Verified**: `npm test` (119/119), `cargo test --manifest-path src-tauri/Cargo.toml` (7/7), `cargo build --manifest-path src-tauri/Cargo.toml`, `python3 tools/check_docs.py`, manual checks, and Chromium browser smoke test of Batch 3 flows (zero console errors).
- **Next**: Maintainer confirmation to update `Enforced by:` prose in `docs/INVARIANTS.md`.

### Session 2ze: 2026-11-27: Batch 2 data integrity, persistence, and Tauri backend fixes (code review follow-up)

- **Did**: Hardened multi-page `Project.setTitle`/`exportSingleHtml` and CRLF `FileSync.dirtyPaths` in [src/project.js](../src/project.js) and [src/filesync.js](../src/filesync.js); added 32-bit/CRC/path-traversal bounds in [src/zip.js](../src/zip.js); updated `assetSignature`, `Store.keepVersion`, and `ProjectLink.normalizePath('/')`; hardened persistence, Library delete/trash switching, snapshot restore, mixed drag-drop import, Explorer/+File validation, disk folder sync, asset quotas/paths, Part propagation, Preview sharing stop on project switch, and menu focus; added dynamic modal `z-index` stacking and drag-close guard in [src/app/dialogs.js](../src/app/dialogs.js); added localhost server read timeout, symlink containment guards, exact-byte save comparison, and SVG preview asset key retention in [src-tauri/src/main.rs](../src-tauri/src/main.rs) and [src-tauri/src/preview.rs](../src-tauri/src/preview.rs).
- **Verified**: `npm test` (113/113), `cargo test --manifest-path src-tauri/Cargo.toml` (7/7), `cargo build --manifest-path src-tauri/Cargo.toml`, `python3 tools/check_docs.py`, manual checks, and Chromium browser smoke test of Batch 2 flows (zero console errors).
- **Next**: Proceed to Batch 3 (Parser & `P8-01` hardening) when maintainer confirms.

### Session 2zd: 2026-11-27: Batch 1 WYSIWYG fixes (code review follow-up)

- **Did**: fixed `selectedPcId` ordering in `applyHtmlTransform` and preserved selection when returning to `activeHtmlFile` ([`src/app/core.js`](../src/app/core.js)); added `Project.buildPreviewCss` and Design-mode live CSS patching via `pc-patch-css` ([`src/project.js`](../src/project.js), [`src/app/stage-live.js`](../src/app/stage-live.js), [`src/app/stage.js`](../src/app/stage.js)); switched Stage to click-to-select + `dblclick` leaf edit with `Escape` revert (`pc-inline-cancel`) and safer drag/badge bounds; fixed `rgbToHex` transparent alpha, `Use Selector` pinning, `switchInspectorTab(..., { forceOpen: true })`, split `Alt`/`Title` and `Width`/`Max Width`, `HtmlAst.unescapeHtml` entity decoding, floating drag `bottom`/`right` clearing, Breakpoint/Viewport sync, Layout declared values, and `<a>` `toggleDecoration` preservation (moved `#contextMenu` handlers to [`src/app/menus.js`](../src/app/menus.js) to keep [`src/app/inspector-ui.js`](../src/app/inspector-ui.js) under 500 lines).
- **Decided**: `D-037` (supersedes `D-009` per maintainer choice).
- **Verified**: `npm test` (`113/113`), `python3 tools/check_docs.py`, manual checks, `cargo build`, and Chromium browser verification at `http://localhost:8080/app.html` (zero console errors).
- **Next**: Batch 2 (data integrity & multi-file sync fixes) in the next turn.

### Session 2zc: 2026-11-27: RTF-style Stage formatting toolbar & CSS Designer typography

- **Did**: added [`src/typography.js`](../src/typography.js) (pure UMD helpers + [`test/typography.test.js`](../test/typography.test.js)), `#styleToolbar` above `#canvasBody` in [`app.html`](../app.html) and [`src/styles.css`](../src/styles.css), [`src/app/style-bar.js`](../src/app/style-bar.js) synced with CSS Designer (`#cssFontFamily`, `#cssFontSize`, `#cssStyleToggles`, `#cssTextAlign` with `justify`, `#cssLineHeight`, `#cssLetterSpacing`), computed typography telemetry in [`src/app/stage.js`](../src/app/stage.js) `readComputed()`, and coalesced undo on color-picker drags (`applyCssTransform` in [`src/app/core.js`](../src/app/core.js)). Registered new assets in [`sw.js`](../sw.js) and added a wiring check in [`test/structure.test.js`](../test/structure.test.js).
- **Decided**: `D-036` (maintainer chose Stage formatting bar + CSS Designer parity, full typography + alignment + color controls, targeting the active CSS rule with a compact target switcher in the toolbar).
- **Verified**: `npm test` (`111/111`), `python3 tools/check_docs.py`, manual checks, `cargo build`, and Chromium browser verification at `http://localhost:8080/app.html` (zero console errors).
- **Next**: maintainer feedback on any remaining CSS/UI friction (such as border/spacing/quick-style toolbars).

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

Older sessions (1 through 2w) are in [archive/handoff-log.md](archive/handoff-log.md).
