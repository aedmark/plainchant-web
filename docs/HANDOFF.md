# Handoff

<!-- Read `Current state` at session start. Update `Current state` in place and prepend one `Session log` entry at session end. -->

## Current state

Last updated: 2026-11-03
- **Phase**: Phases 1-6 complete; `P7-04`, `P7-05`, `P7-06`, `P7-07`, `P7-01`, `P7-03`, `P7-08`, `P7-11`, `P7-12`, `P7-14`, `P7-15`, `P7-02`, `P7-09`, `P7-10`, `P7-13`, `P7-16` done; Phase 7 backlog continues (`P6-01`, `P6-02`) ([`ROADMAP.md`](../ROADMAP.md))
- **Verified with**:
  - `npm test` — passed (`103/103` unit & structural tests); `cargo test --manifest-path src-tauri/Cargo.toml` — passed (`5/5`)
  - `python3 tools/check_docs.py` — passed (`0 error(s), 0 warning(s)`)
  - `python3 tools/manual.py check docs/plainchant-web.manual.json && python3 -m unittest tools/test_manual.py` — passed (`3` sections, `22` entries, `6/6` tests)
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
- **Service worker is cache-first (`sw.js`)**: after changing any app file, a browser that already installed the app can keep serving old scripts; hard-reload when testing. `CACHE_NAME` has never been bumped, so consider a version bump per release.
- **Browser folder open was not driven end to end**: `showDirectoryPicker` cannot be automated, so `P7-09` was checked by calling `activateImportedFolderProject` with a real PNG. Try it by hand in Chromium with a folder of images.
- **Console line mapping (`D-011`)**: relies on document-relative `lineno` for inline scripts. Verified in Chromium only; check WebKitGTK (Tauri on Linux) when next running the desktop app. `stage.js` is ~466 lines; put new Stage code in `stage-live.js` or a new file.
- **Insert drag was driven with synthetic pointer events (`D-020`)**: try a real mouse drag, and a drag in the Tauri WebKitGTK shell (pointer capture on `document.body`, `elementFromPoint` into the Stage).
- **Hints are heuristics (`D-028`)**: no contrast, ARIA, or content-model checks; a clean Problems tab is not an accessibility audit. Labels are matched within one page only.
- **Explorer drag driven with synthetic pointer events (`D-027`)**: try a real mouse drag and Tauri WebKitGTK; `window.prompt` for New/Rename folder is unverified there. Moves leave old copies on disk after export (`D-024`).
- **Breakpoint bar only supports exact `(max-width: Npx)` queries (`D-026`)**: other media blocks are ignored by the Designer. `inspector-ui.js` is at 487/500 lines; put new Designer code in its own file.
- **Gap handles driven with synthetic pointer events (`D-025`)**: try a real mouse drag and the Tauri WebKitGTK shell (pointer capture inside the iframe, `MutationObserver` redraws). `stage.js` is still at the line limit; put new Stage code in its own file.
- **Desktop image add/rename not driven in a real Tauri window (`D-024`)**: the base64 `assets` export, `adoptDiskImage` (fetch from the localhost server) and `window.prompt`/`confirm` are unverified there; the Rust decoder and path guard have unit tests. Deleting disk-only images is deliberately not offered, and export never deletes files.
- **Dialogs in the desktop shell (`D-017`)**: Rename, New File, and Make Part use `window.prompt`; not verified in Tauri WebKitGTK. If it returns `null` there, replace with an in-app modal.
- **Syntax colours can still switch off (`D-002`)**: `checkShade` permanently disables colouring on a detected wrap mismatch. The known cause (dropped `/` in `/>`) is fixed and guarded by a round-trip test, but any new tokenizer change must keep run text identical to the source. Settings > Syntax colours off/on re-enables without reload.
- **Stage Focus vs. Editor Selection**: Selecting or typing in a Stage element must keep `focusEditor: false` / `keepFocus: true` so keyboard focus stays inside the Stage iframe (`D-009`).

### Next up

1. **Phase 7 backlog** ([`ROADMAP.md`](../ROADMAP.md)) is complete (`P7-01`..`P7-16`). Ask the maintainer what to plan next.

### Open questions

- None blocking. `Q-001` (Phase order) was resolved 2026-11-02: Phase 5 first. (See [`docs/DECISIONS.md`](DECISIONS.md).)

---

## Session log

<!-- Prepend new entries directly below this comment. Keep the last 10 entries here; move older ones to `docs/archive/handoff-log.md`. -->

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

### Session 2r: 2026-11-03: P7-12 preview in a browser or on a phone

- **Did**: [`src-tauri/src/preview.rs`](../src-tauri/src/preview.rs) (opt-in token-gated LAN server, 4 commands); [`src/preview.js`](../src/preview.js); [`src/app/preview-ui.js`](../src/app/preview-ui.js) and the Preview dialog; push hooks in `render()` and asset changes.
- **Decided**: `D-029` (maintainer chose the desktop LAN server).
- **Verified**: `npm test` (`84/84`); `cargo test` (`5/5`, including real loopback HTTP); browser check of the dialog, a mocked Tauri bridge, and the new-tab snapshot. Full check results are in this session's final report.
- **Next**: ask which of `P7-14`, `P7-15` is next.

### Session 2q: 2026-11-03: P7-11 accessibility and markup hints

- **Did**: [`src/hints.js`](../src/hints.js) (element rules and a tag-balance scan); Problems tab merges link and hint problems with a **Show** filter ([`src/app/problems-ui.js`](../src/app/problems-ui.js)); `problemsFilter` setting.
- **Decided**: `D-028`.
- **Verified**: `npm test` (`82/82`); browser check of a faulty page (merged list, counts, filter, saved setting, jump). Full check results are in this session's final report.
- **Next**: ask which backlog item is next.

### Session 2p: 2026-11-03: P7-08 Explorer folders, moves, and tab reorder

- **Did**: `Project.moveFolder`, `deriveTree`, `validateFolderPath`, `treeAfter` `mkdir` / `moveDir`; [`src/app/explorer-move.js`](../src/app/explorer-move.js) (new folder, folder rows, pointer drag for files, folders, and tabs); `moveProjectFileTo` and `moveAssetTo` split out of the rename prompts; empty folders exported (browser and Tauri `dirs`); undo snapshots compare the tree.
- **Decided**: `D-027` (reorder means file tabs; Delete folder removes empty folders only; moves never delete disk copies).
- **Verified**: `npm test` (`75/75`); browser check of new folder, drag-move with link rewrite and undo/redo, folder rename and drag to root, refused self-drop, delete, image and image-folder moves, tab reorder. Full check results are in this session's final report.
- **Next**: ask which backlog item is next.

### Session 2o: 2026-11-03: P7-03 breakpoint switcher

- **Did**: `media` argument, `blocks`, `mediaQuery`, `MEDIA_PRESETS`, and ordered block creation in [`src/css-ast.js`](../src/css-ast.js); [`src/app/css-media.js`](../src/app/css-media.js) and the **Breakpoint** bar; Designer reads and writes through `cssEditMedia()`.
- **Decided**: `D-026`.
- **Verified**: `npm test` (`71/71`); browser check writing and reading back base, tablet, and mobile values and the Stage computing the mobile value. Full check results are in this session's final report.
- **Next**: ask which backlog item is next.

### Session 2n: 2026-11-03: P7-01 flex and grid gap handles

- **Did**: [`src/layout.js`](../src/layout.js) (geometry, drag rules, embeddable source); [`src/app/stage-layout.js`](../src/app/stage-layout.js) (in-iframe guides and handles); [`src/app/layout-ui.js`](../src/app/layout-ui.js) and the **Layout** group in the CSS Designer; one-line hook in `drawStageNow`.
- **Decided**: `D-025`.
- **Verified**: `npm test` (`67/67`); browser check of a flex row and a grid (handles, drag writing the right rule, Layout selects, handles hidden under `space-between`). Full check results are in this session's final report.
- **Next**: ask which backlog item is next.

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
