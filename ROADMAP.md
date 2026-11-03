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

## Phase 5: Future Enhancements (Not Yet Committed)

Not committed. Decide only after maintainer prioritization.

- [ ] P5-01 Visual CSS Grid & Flexbox interactive gap/alignment handles on the Design Stage (proposed 2026-11-02).
- [ ] P5-02 Visual Asset Manager & Image Picker modal browsing local project images with thumbnail previews (proposed 2026-11-02).
- [ ] P5-03 Integrated Stage Console drawer capturing `console.log`, `console.warn`, and uncaught exceptions from Live JS mode (proposed 2026-11-02).
- [ ] P5-04 Responsive Media Query Switcher in the CSS Designer to scope style edits to `@media (max-width: 768px)` or `@media (max-width: 375px)` (proposed 2026-11-02).
