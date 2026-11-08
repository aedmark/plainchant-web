# Testing

How to run every check in Plainchant Web, what each one proves, and what it cannot. Read this before claiming anything
works. Results live in [`docs/HANDOFF.md`](HANDOFF.md) ("Verified", with date and commit); a count written anywhere
else goes stale, so this file carries none.

## The suites

| Suite | File | Proves | Does not prove | Time, needs |
| --- | --- | --- | --- | --- |
| Unit | `test/*.test.js` except `structure` | Parser, splicer, formatter, link, hint, and project rules run in Node (`vm` sandboxes for bridge scripts) | That any UI works in a real browser or window | Under 1 s, Node only |
| Structure | `test/structure.test.js` | Wiring: scripts registered and ordered, 500-line cap, no duplicate globals, offline cache list, per-feature elements present | That the wired feature behaves correctly when used | Under 1 s, Node only |
| Rust | `src-tauri` unit tests | Base64 decoder, path guard, folder path, preview server token, gating, and versions | The Tauri window, native dialogs, WebKitGTK behaviour | Up to a minute, Cargo |
| Docs | `tools/check_docs.py` | The documents agree with each other (IDs, links, layout paths, session log) | That the prose agrees with the code | Under 1 s, Python 3 |
| Manual generator | `tools/manual.py`, `tools/test_manual.py` | The 3x manual source validates and builds | That the manual text is accurate | Under 1 s, Python 3 |

There is no end-to-end browser suite. Anything that needs a real pointer, a real window, or a real device is a manual
check (below).

**The fast set** (before every commit): `npm test` and `python3 tools/check_docs.py`.
**The full set** (after moving or deleting code, touching desktop or frontend assets, and before a release): the
fast set plus the 3x manual checks, `cargo test`, and `cargo build`.

## Before any run

- **Clean state:** tests read only the repository and run offline; nothing needs resetting. A browser check starts
  from a fresh profile or a cleared IndexedDB, because saved projects and folder links change what the app opens.
- **Resource caps:** none needed; the suites are small. A `cargo build` writes to gitignored `src-tauri/target/` and
  `src-tauri/dist/`.
- **Services:** browser checks need `python3 -m http.server 8080` and `http://localhost:8080/app.html`; the service
  worker only registers over HTTP(S).

## Commands

| Scope | Command | Expected budget |
|---|---|---|
| All JS unit + structural tests | `npm test` (runs `node test/run.js`) | < 1s |
| Documentation integrity | `python3 tools/check_docs.py` | < 1s |
| 3x Manual validation & unit tests | `python3 tools/manual.py check docs/plainchant-web.manual.json && python3 -m unittest tools/test_manual.py` | < 1s |
| Native Tauri host compilation | `cargo build --manifest-path src-tauri/Cargo.toml` | ~1–10s (incremental) |
| Rust unit tests (base64 decoder, path guard, canonical folder path, preview server token, gating, and versions) | `cargo test --manifest-path src-tauri/Cargo.toml` | ~1–60s |

## Test layout

- [`test/run.js`](../test/run.js) — Zero-dependency Node.js test harness that executes all `test/*.test.js` suites:
  - [`test/html-ast.test.js`](../test/html-ast.test.js) — Unit tests for [`src/html-ast.js`](../src/html-ast.js): `parse`, `stamp`, `setAttr`, `setText`, `insertElement`, `removeElement`, `moveElement` (before/after/inside), and `duplicateElement`.
  - [`test/css-ast.test.js`](../test/css-ast.test.js) — Unit tests for [`src/css-ast.js`](../src/css-ast.js): `parse`, `findRulesForElement`, `findRuleBySelector` (including grouped selectors), `setProperty`, and `addRule`.
  - [`test/project.test.js`](../test/project.test.js) — Unit tests for [`src/project.js`](../src/project.js): multi-file `pack`/`unpack` round-trips, linked stylesheet discovery, preview assembly, `Project.resolveRelativePath` (relative, `..`, hash/query, encoded, external schemes), `Project.rewriteAssetUrls` / `assemblePreview` blob URL rewriting, `Project.mimeFor`, shared-part scanning, syncing, and pulling (`Parts`), search and replace offsets and project-wide search/replace (`Finding.findAll`, `findInFiles`, `replaceInFiles`), the syntax shader round-trip (`CodeShade`: no characters lost, no safety fallback on the repo's own files), file path validation, rename with link rewriting, duplicate, delete, tree updates, `FileSync.dirtyPaths`, link checking (`Links`: missing targets, severities, anchors, case, exact offsets, caching), `HtmlAst.insertElementAt` offsets and ids, `DomOutline.dropPlacement`, pseudo-state helpers and forced-state preview rewriting (`CssAst.stateOf` / `baseSelector` / `withState` / `forceStates`, `Project.assemblePreview`), the zip writer (`Zip.build` / `Zip.list` / `crc32`), the image library (`ImageLib.list` / `uniquePath` / `formatBytes`), reference usage (`Links.usage`), the tree `add` operation, and the Live JS console bridge (injection order, error-line map, and forwarded console/`onerror`/rejection messages run in a Node `vm` sandbox).
  - [`test/structure.test.js`](../test/structure.test.js) — Enforces architectural invariants (`D-001`, `P4-01`):
    - Every `.js` file in `src/app/` must be listed in [`app.html`](../app.html) in order (`core.js` first, `main.js` last).
    - Every `.js` file in `src/app/` must be **≤ 500 lines**.
    - No duplicate top-level identifier declarations across `src/app/*.js`.
    - No inline `<script>` or `<style>` blocks in [`app.html`](../app.html).
    - [`sw.js`](../sw.js) `APP_FILES` matches all assets linked by [`app.html`](../app.html).
    - The Console tab, pane, badge, and `console-ui.js` are wired into [`app.html`](../app.html) (`P5-01`).
    - The link bridge script and **Follow Link ↗** control are wired in (`P5-02`).
    - The Parts tab, **Make Part…** button, and parts scripts are wired in (`P7-10`).
    - The line-number gutter, find bar, and `finding.js` / `find.js` scripts are wired in (`P6-01`).
    - The Inspector dock menu, resizer, `dock-ui.js`, dock CSS, and `inspectorDock` setting are wired in (`P7-16`).
    - The Explorer file menu, dirty markers, and undo snapshot fields for tabs and tree are wired in (`P6-02`).
    - The Problems tab, `links.js`, and `problems-ui.js` are wired in (`P7-04`).
    - The find bar's Project scope, results list, and `find-project.js` are wired in (`P7-05`).
    - Insert-menu dragging is wired with pointer events only (no HTML5 drag and drop) and the `inside` drop guide exists (`P7-06`).
    - The CSS Designer State bar, forced-state bridge hooks, and `css-states.js` are wired in (`P7-07`).
    - The Export dialog's zip section, `zip.js`, and `zip-ui.js` are wired in (`P7-13`).
    - Prism is vendored unmodified with its licence, loaded before `code-shade.js` with `data-manual`, credited in `LICENSE`, and never used for HTML output (`D-034`).
    - The syntax colour layer is emptied on a language change and when it disagrees with its keys.
    - The home page (`index.html`) has no script, its local links and anchors resolve, and it loads nothing from other sites.
    - The File menu's Open file / Open folder / Open project items, the **Reload from disk** button, `projectlink.js`, `project-links.js`, and the `use_project_folder` command are wired in (`D-033`).
    - The File and Edit menus, their items, and `menus.js` are wired in, and the Format button is no longer in the tab strip (`D-032`).
    - Explorer folders collapse and an image click opens Assets without inserting.
    - The Help guide renders the shortcut cheat sheet from `shortcuts.js`, and each listed shortcut still has its handler (`P7-15`).
    - The Format button, `format.js`, and the `Alt+Shift+F` shortcut are wired in (`P7-14`).
    - The Preview dialog, `preview.js`, the four Tauri preview commands, and the push hooks are wired in, and the always-on asset server stays on loopback (`P7-12`).
    - The Problems **Show** filter, `hints.js`, and the `problemsFilter` setting are wired in (`P7-11`).
    - The **+ Folder** button, `explorer-move.js`, folder rows, and the empty-folder export argument are wired in (`P7-08`).
    - The CSS Designer **Breakpoint** bar and `css-media.js` are wired in (`P7-03`).
    - The flex/grid gap handles, `layout.js`, `stage-layout.js`, and the Layout group are wired in (`P7-01`).
    - The Assets modal, **Browse…** buttons (Source and Bg Image), `imagelib.js`, `asset-ui.js`, the image drop route, asset undo, and the desktop `assets` export argument are wired in (`P7-02`, `D-024`).
    - The Inspector header wraps and the floating window clips overflow (CSS guard; layout itself was checked in a browser).
    - The Live JS bridge cancels `#anchor`, empty, and `?query` links and form submits so the Stage never loads the app page (run in a `vm` sandbox).
- [`tools/check_docs.py`](../tools/check_docs.py) — Validates documentation links, [`ROADMAP.md`](../ROADMAP.md) task IDs (`P1-01`..`P7-16`), [`docs/DECISIONS.md`](DECISIONS.md) IDs (`D-001`..`D-034`, `Q-001`), [`AGENTS.md`](../AGENTS.md) layout paths, and [`docs/HANDOFF.md`](HANDOFF.md) budget.
- [`tools/manual.py`](../tools/manual.py) & [`tools/test_manual.py`](../tools/test_manual.py) — Validates and builds the 3x What / How / Why manual ([`docs/plainchant-web.manual.json`](plainchant-web.manual.json) -> [`docs/manual.html`](manual.html)).

## Change-to-check matrix

| Changed area | Minimum checks | Additional evidence |
| --- | --- | --- |
| Documentation only | `python3 tools/check_docs.py` | Link check is part of the script |
| Pure logic in `src/*.js` | `npm test` | A new test that fails without the fix |
| `src/app/*.js` or `app.html` | `npm test` (structure invariants) | A browser check at `localhost:8080/app.html` |
| `sw.js` or an asset linked in `app.html` | `npm test` | Reload offline in a browser |
| `src-tauri/` | `cargo test` and `cargo build` | A run in the desktop window (`npm run tauri:dev`) |
| Manual source | `python3 tools/manual.py check ...` and `python3 -m unittest tools/test_manual.py` | Rebuild `docs/manual.html` |
| Security boundary (asset server, preview server, sandbox) | Negative tests (traversal, bad token, unsafe path) | Targeted review against [`SECURITY.md`](SECURITY.md) |

## Manual checks (before a release)

Record who checked what, where, and when in [`docs/HANDOFF.md`](HANDOFF.md). The open ones are listed there under
"Known issues & gotchas"; the standing list:

- Real mouse drags (Stage reorder, Insert drag, Explorer move, gap handles) in Chromium and in the Tauri WebKitGTK window.
- Open a folder with images in Chromium and in the desktop window; add, rename, and delete an image.
- Start network sharing and open the link from a real phone; confirm the firewall prompt and **Stop sharing**.
- In the desktop window: `askText` and `askConfirm` dialogs, Export, and Reload from disk.
- Console line numbers for inline scripts in WebKitGTK.

## Environment recipes

- **Node tests:** Node.js only; no `npm install`.
- **Browser checks:** serve the repository root over HTTP as above; Chromium is the reference browser. Firefox and
  Safari are not automated.
- **Desktop:** Rust toolchain; `npm run tauri:dev`. A headless machine cannot show the window.

## Writing tests

- **New AST operations**: Every new method added to [`src/html-ast.js`](../src/html-ast.js) or [`src/css-ast.js`](../src/css-ast.js) must have unit tests in [`test/html-ast.test.js`](../test/html-ast.test.js) or [`test/css-ast.test.js`](../test/css-ast.test.js), including edge cases (void tags, nested elements, grouped selectors, no-op moves).
- **Determinism**: Tests must run offline in standard Node.js without a browser or display server.
- **Make a new check fail first**: undo only the fix and run it. A check that passes either way proves nothing.
- **Assert on what happened** (a returned offset, a file's text), not on words in a message.

## Known pitfalls (already hit, already fixed: don't re-discover these)

- **UMD purity in `src/*.js`**: `test/run.js` loads `src/*.js` directly via `require()`. Keep `src/*.js` free of DOM-only globals at module load time so they remain testable in Node.js (`D-001`).
- **500-line file limit**: Adding code that pushes any `src/app/*.js` file over 500 lines will fail `test/structure.test.js`. Check line counts with `wc -l src/app/*.js`.
- **A mutation check must break the fix, not the test.** Reverting a whole file can fail a test for an unrelated reason. Remove just the fix.
- **Structure tests prove wiring, not behaviour.** A passing `structure.test.js` says the element and script exist; drive the feature in a browser before calling it working.
