# Decisions

Short, append-only record of choices that a future session might otherwise re-litigate. One entry per decision.
Newest at the bottom. To reverse a decision, add a new entry that supersedes it; the old one keeps its text and only
its status changes ("superseded by D-MMM").

---

## D-001 Zero-build vanilla JS frontend with classic scripts and UMD modules (2026-11-02, status: accepted)
**Context:** Plainchant Web is a spinoff of Plainchant (`aedmark/plainchant`) designed as an HTML5, CSS, and JS WYSIWYG studio (P1-01, P4-01).
**Decision:** Keep Plainchant's zero-build, zero-runtime-dependency frontend architecture: pure logic lives in UMD modules under `src/*.js` (so Node tests can `require()` them directly without a bundler) and UI wiring lives in classic `<script>` files under `src/app/*.js` sharing a single global scope loaded by `app.html`.
**Alternatives:** Vite/Webpack + React/Svelte (rejected: adds build steps, bundler complexity, and breaks direct `file://` / static-server simplicity).
**Consequences:** Every file in `src/app/*.js` must stay at or under 500 lines and avoid duplicate top-level identifier declarations, enforced by `test/structure.test.js`.

## D-002 Transparent-textarea syntax shader over heavyweight code editor libraries (2026-11-02, status: accepted)
**Context:** The Code pane needs syntax color hints and Stage-selected line highlighting for HTML, CSS, and JS without pulling in Monaco or CodeMirror (P1-04, P2-01).
**Decision:** Use Plainchant's transparent `<textarea id="editor">` backed by a synchronized `<div class="editor-shade">` (`src/code-shade.js` + `src/app/shade.js`), including a wrap-alignment check (`checkShade`) and `.sh-selected-line` range highlighting (`highlightCodeRange`).
**Alternatives:** Monaco or CodeMirror 6 (rejected: megabytes of bundled JS and incompatible with the zero-dependency rule in D-001).
**Consequences:** Font metrics and padding between `#editor` and `.editor-shade` must stay synchronized via `copyEditorType`.

## D-003 Non-destructive byte-offset AST splicing for round-trip HTML and CSS editing (2026-11-02, status: accepted)
**Context:** Visual WYSIWYG editors often serialize `innerHTML` from the live DOM back to source, destroying user formatting, indentation, comments, and attribute order (P1-01, P1-02).
**Decision:** All visual edits on the Stage and in the Inspector go through `src/html-ast.js` and `src/css-ast.js`, which record exact character offsets (`start`, `end`, `openStart`, `openEnd`, `closeStart`, `attrSpans`) and splice only the modified byte range in the source string.
**Alternatives:** Serializing `stageFrame.contentDocument.documentElement.outerHTML` (rejected: strips formatting, injects runtime bridge attributes into source, and mangles whitespace).
**Consequences:** `HtmlAst.stamp` injects `data-pc-id` attributes only into the ephemeral preview document sent to `stageFrame.srcdoc`, never into the user's source buffer.

## D-004 Multi-file project serialization in IndexedDB via sentinel markers (2026-11-02, status: accepted)
**Context:** Reuse Plainchant's battle-tested IndexedDB `Store`, `Library`, and `Versions` modules (which expect a single `content` string per record) for multi-file web projects (P1-03).
**Decision:** `Project.pack` and `Project.unpack` (`src/project.js`) serialize all text files in `projectFiles.entries` (plus directory tree metadata) using `/* === PLAINCHANT:FILE:<path> === */` markers inside `record.content`.
**Alternatives:** Redesigning the IndexedDB schema with a separate files object store (rejected: breaks direct compatibility with `Store`, `Library`, and `Versions` snapshot diffing).
**Consequences:** Whole-project snapshots and 30-day trash recovery work across arbitrarily many `.html`, `.css`, and `.js` files out of the box.

## D-005 Tauri v2 desktop wrapper with staged `src-tauri/dist` build directory (2026-11-02, status: accepted)
**Context:** Pointing `frontendDist` in `src-tauri/tauri.conf.json` to `..` caused `tauri::generate_context!()` to recursively scan `src-tauri/target/`, making builds take minutes (P3-01).
**Decision:** `src-tauri/build.rs` copies only the static frontend files (`index.html`, `app.html`, `manifest.webmanifest`, `sw.js`, `src/`, `fonts/`, `icons/`) into `src-tauri/dist/` before compilation, and `frontendDist` points to `"dist"`.
**Alternatives:** Pointing `frontendDist` to `..` (rejected: recursive scan of `src-tauri/target/` stalls builds).
**Consequences:** Incremental `cargo build` completes in ~1 second; `src-tauri/dist/` is gitignored and refreshed automatically on every `cargo build`.

## D-006 Isolated Studio project environment for opened folders and localhost asset server (2026-11-02, status: accepted)
**Context:** Real project folders (such as multi-page portfolios) use custom stylesheet names (`style.css`), multiple HTML pages, subdirectories, and relative binary images (`images/gallery/*.jpg`). Furthermore, users expect opening an existing folder to create a safe Studio project workspace rather than silently overwriting their disk files on auto-save (P3-01, P3-02, P3-03).
**Decision:**
1. In Tauri, `open_project_folder` recursively loads text files into `projectFiles.entries` and spawns a localhost HTTP asset server (`127.0.0.1:<port>`) injected via `<base href>` in `Project.assemblePreview` so relative images, fonts, and stylesheets render accurately.
2. Opening a folder creates a new project environment (`currentScriptId = newId()`) in the Studio library. Auto-save and `Ctrl/Cmd+S` save only to the Studio workspace; local disk is untouched until the user explicitly triggers **Export**, which writes all project files back to disk while retaining the existing folder and file structure.
**Alternatives:** Auto-writing to disk on every 1.5s auto-save (rejected: risks unintended modifications to existing projects before the user is ready to export).
**Consequences:** `#file-bar` and `#export-modal` clearly distinguish between the Studio working copy and exporting to local disk.

## D-007 Dockable, collapsible, hideable, and floating Inspector with computed style telemetry (2026-11-02, status: accepted)
**Context:** A fixed bottom Inspector takes up vertical Stage space and only showed rules declared literally in `styles.css` (P2-02).
**Decision:** Support four Inspector states (docked, collapsed header-only, floating draggable window, and hidden via `Ctrl/Cmd+Shift+I`), stream `getComputedStyle` + bounding-box dimensions from the Stage iframe on selection, render amber margin and emerald padding overlays on the Stage, and provide **Go to CSS ↗** (`CssAst.findRuleBySelector`) to jump directly to the rule in the Code editor.
**Alternatives:** Fixed-only bottom panel (rejected: cramps Stage viewport on smaller screens).
**Consequences:** Inspector layout preferences persist in `localStorage`.

## D-008 Pointer-based Stage drag-and-drop and single-pass AST move (2026-11-02, status: accepted)
**Context:** Native HTML5 `draggable="true"` / `dragover` / `drop` inside the Stage iframe aborted drops in WebKitGTK when releasing over margins or dragging links/buttons, leaving the `[data-pc-drop-target]` guide line stuck, and two-pass `insertElement` + `removeElement` suffered from shifting `pc-id` sequence numbers (P2-03).
**Decision:** Replace HTML5 drag events on the Stage with deterministic pointer tracking (`mousedown` / `mousemove` / `mouseup` in `src/app/stage.js`) with sibling-container target resolution, and perform `HtmlAst.moveElement` as a single-pass byte-offset splice.
**Alternatives:** Native HTML5 Drag-and-Drop API (rejected: unreliable across WebKitGTK and iframe boundaries).
**Consequences:** Releasing the mouse button anywhere after a drag guide line appears reliably reorders the element and clears all drop indicators.

## D-009 Focus-preserving Stage selection and single-click inline WYSIWYG text editing (2026-11-02, status: accepted)
**Context:** Clicking an element on the Design Stage previously scheduled `editor.focus()` and selected the HTML tag in `<textarea id="editor">`, causing subsequent keystrokes to overwrite the HTML element in the Code editor instead of editing text on the Design Stage (P2-04).
**Decision:** Clicking on the Design Stage highlights the element's code lines (`.sh-selected-line`) and scrolls the Code editor without focusing `#editor`. Clicking any text-editable leaf element on the Stage immediately activates `contenteditable="true"`, places the text caret at the click coordinates (`caretRangeFromPoint`), and streams live `pc-inline-input` updates to the Code editor (`skipStageRender: true`) without reloading the Stage iframe mid-typing.
**Alternatives:** Requiring double-click to edit text and focusing the code editor on single click (rejected: breaks natural WYSIWYG typing instinct and risks accidental tag deletion).
**Consequences:** Users can click and type directly in the Design View while watching the highlighted HTML code update in real time; dragging a text element while in edit mode uses the `⠿` handle on the floating stage badge.

## D-010 Project-wide multi-file Undo and Redo stack (2026-11-02, status: accepted)
**Context:** Native `<textarea>` undo resets whenever the user switches file tabs (`editor.value = ...`) and does not capture Stage or Inspector edits to non-active files (P2-05).
**Decision:** Maintain an explicit project-wide `undoStack` and `redoStack` (up to 150 snapshots in `src/app/typing.js`) capturing `projectFiles.entries`, `activeFile`, `activeHtmlFile`, `selectedPcId`, and cursor/scroll state, coalescing rapid typing into 600ms bursts while recording discrete checkpoints for every Stage and Inspector action.
**Alternatives:** Relying on browser `document.execCommand('undo')` (rejected: fails across multi-file tab switches and cross-file CSS Inspector edits).
**Consequences:** `Ctrl/Cmd+Z` and `Ctrl/Cmd+Shift+Z` / `Ctrl+Y` (and toolbar `#undoBtn` / `#redoBtn`) work uniformly across Code, Stage, and Inspector.

## D-011 Live JS console bridge injected by `Project.assemblePreview` (2026-11-02, status: accepted)
**Context:** Developers need runtime output from the Stage without opening browser devtools (P5-01). The Design bridge is Design-only and Design mode strips scripts, so Live JS had no channel back to the Studio.
**Decision:** In Live JS mode `Project.assemblePreview` injects `Project.consoleBridge` as the first script in the preview. It wraps `console.log/info/warn/error`, `window.onerror`, and `unhandledrejection`, serialising arguments to strings and posting `{ type: 'pc-console', level, args, line, source, time }` to the parent. `assemblePreview` records where each user script starts in the final document so error lines map back to project files. The old `try/catch` wrapper and `pc-runtime-error` message are removed; the console replaces them. The console clears on every Stage re-render because scripts re-run.
**Alternatives:** Keeping the `try/catch` wrapper (rejected: loses line numbers and makes top-level `let`/`const` block-scoped, unlike a real page); parsing `Error.stack` for lines (rejected: format differs between WebKitGTK and Chromium).
**Consequences:** Console output exists only in Live JS mode; Design mode shows a hint. Line numbers rely on the document-relative `lineno` reported for inline scripts. Verified in Chromium only; WebKitGTK (Tauri on Linux) is unverified.

## D-012 Link navigation: Live JS bridge decides, the Studio resolves (2026-11-02, status: accepted)
**Context:** Clicking a relative link in the Stage iframe would navigate the `srcdoc` frame away from the Studio's active document (P5-02).
**Decision:** In Live JS mode a click bridge (`buildLiveBridgeScript`, `src/app/stage-live.js`) calls `preventDefault` on clicks that no page script already handled, for links that are not `#anchor`, scheme (`http:`, `mailto:`, `javascript:`, ...) or `//` links, and posts `pc-navigate`. In Design mode the click handler posts `pc-navigate` on `Ctrl/Cmd+Click`, and the badge and Properties panel post `pc-follow-link` / call `followProjectLink`. The Studio resolves the target with `Project.resolveRelativePath` (strips `?query` and `#hash`, decodes `%20`, clamps `..` at the project root, maps a trailing `/` to `index.html`) and opens it with `openFileInEditor` only if it is an `.html` file in `projectFiles.entries`; otherwise it shows a notice. Plain Design click is unchanged (D-009).
**Alternatives:** Intercepting only `.html` hrefs in the iframe (rejected: the iframe cannot see project files, and a missed link would navigate the Stage away); adding the bridge to `stage.js` (rejected: file is near the 500-line cap, D-001).
**Consequences:** In Live JS mode every relative non-anchor link is captured, including links to non-HTML files, which now show a notice instead of navigating. A link's `#hash` is dropped, so the target page opens at the top. `Project.resolveRelPath` (used by the preview) is unchanged and still differs from `resolveRelativePath` for edge cases such as `..` at the root.

## D-013 Binary project assets as Blobs in a separate IndexedDB store (2026-11-02, status: accepted; amends D-004)
**Context:** In the browser build, opening a folder loaded only text files, and the `srcdoc` Stage resolves relative URLs against the app's own origin, so project images, fonts, and CSS backgrounds never rendered (P7-09). The Tauri build is unaffected because it serves files over a localhost HTTP server (D-006).
**Decision:** On browser folder open, non-text files up to 25 MB each and 200 MB per project are kept as Blobs (`projectAssets` in `src/app/assets.js`) and saved in a new `assets` object store (`DB_VERSION` 2, keyed by script id and path). `Project.assemblePreview` takes an `assetUrls` map and rewrites relative references to `blob:` URLs: `src`, `srcset`, `poster`, and `<link href>` in tags (not `<a href>`), and CSS `url()` in HTML and in inlined stylesheets (resolved relative to the stylesheet). Larger files are skipped with a notice. Assets follow their project: copied on Duplicate, dropped when the trash purge removes a project, and exported with **Export to a new folder**. Pack format (D-004) is unchanged; binaries never enter `record.content` or snapshots.
**Alternatives:** Memory only (rejected: images vanish on reload); persisting the folder handle (rejected: permission prompt on every reload and ties the project to the disk copy, against D-006).
**Consequences:** Snapshots and Restore do not version binaries; a restored snapshot uses the project's current assets. Images set from user JS (`img.src = 'images/x.png'`) are not rewritten. Adding images to a project by import or drop is not supported yet (P7-02).

## Open questions

- **Q-001** (resolved 2026-11-02: maintainer started Phase 5 first, matching the recommendation) Should Phase 5 (`P5-01` Console Drawer, `P5-02` Multi-Page Link Navigation) be implemented before Phase 6 (`P6-01` Line Numbers & Find/Replace, `P6-02` Explorer File Operations & Dirty Indicators), or in parallel? (asked 2026-11-02, by agent; blocks P5-01; recommendation: execute Phase 5 (`P5-01`, `P5-02`) first, then Phase 6 (`P6-01`, `P6-02`))
