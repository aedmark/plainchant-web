# Testing

How to verify changes in Plainchant Web. Run the full suite before finishing a task and record the exact command and result in [`docs/HANDOFF.md`](HANDOFF.md).

## Commands

| Scope | Command | Expected budget |
|---|---|---|
| All JS unit + structural tests | `npm test` (runs `node test/run.js`) | < 1s |
| Documentation integrity | `python3 tools/check_docs.py` | < 1s |
| 3x Manual validation & unit tests | `python3 tools/manual.py check docs/plainchant-web.manual.json && python3 -m unittest tools/test_manual.py` | < 1s |
| Native Tauri host compilation | `cargo build --manifest-path src-tauri/Cargo.toml` | ~1–10s (incremental) |

## Test layout

- [`test/run.js`](../test/run.js) — Zero-dependency Node.js test harness that executes all `test/*.test.js` suites (`48` tests total):
  - [`test/html-ast.test.js`](../test/html-ast.test.js) — Unit tests for [`src/html-ast.js`](../src/html-ast.js): `parse`, `stamp`, `setAttr`, `setText`, `insertElement`, `removeElement`, `moveElement` (before/after/inside), and `duplicateElement`.
  - [`test/css-ast.test.js`](../test/css-ast.test.js) — Unit tests for [`src/css-ast.js`](../src/css-ast.js): `parse`, `findRulesForElement`, `findRuleBySelector` (including grouped selectors), `setProperty`, and `addRule`.
  - [`test/project.test.js`](../test/project.test.js) — Unit tests for [`src/project.js`](../src/project.js): multi-file `pack`/`unpack` round-trips, linked stylesheet discovery, preview assembly, `Project.resolveRelativePath` (relative, `..`, hash/query, encoded, external schemes), `Project.rewriteAssetUrls` / `assemblePreview` blob URL rewriting, `Project.mimeFor`, shared-part scanning, syncing, and pulling (`Parts`), search and replace offsets and project-wide search/replace (`Finding.findAll`, `findInFiles`, `replaceInFiles`), the syntax shader round-trip (`CodeShade`: no characters lost, no safety fallback on the repo's own files), file path validation, rename with link rewriting, duplicate, delete, tree updates, `FileSync.dirtyPaths`, link checking (`Links`: missing targets, severities, anchors, case, exact offsets, caching), and the Live JS console bridge (injection order, error-line map, and forwarded console/`onerror`/rejection messages run in a Node `vm` sandbox).
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
    - The Inspector header wraps and the floating window clips overflow (CSS guard; layout itself was checked in a browser).
    - The Live JS bridge cancels `#anchor`, empty, and `?query` links and form submits so the Stage never loads the app page (run in a `vm` sandbox).
- [`tools/check_docs.py`](../tools/check_docs.py) — Validates documentation links, [`ROADMAP.md`](../ROADMAP.md) task IDs (`P1-01`..`P7-16`), [`docs/DECISIONS.md`](DECISIONS.md) IDs (`D-001`..`D-019`, `Q-001`), [`AGENTS.md`](../AGENTS.md) layout paths, and [`docs/HANDOFF.md`](HANDOFF.md) budget.
- [`tools/manual.py`](../tools/manual.py) & [`tools/test_manual.py`](../tools/test_manual.py) — Validates and builds the 3x What / How / Why manual ([`docs/plainchant-web.manual.json`](plainchant-web.manual.json) -> [`docs/manual.html`](manual.html)).

## Writing tests

- **New AST operations**: Every new method added to [`src/html-ast.js`](../src/html-ast.js) or [`src/css-ast.js`](../src/css-ast.js) must have unit tests in [`test/html-ast.test.js`](../test/html-ast.test.js) or [`test/css-ast.test.js`](../test/css-ast.test.js), including edge cases (void tags, nested elements, grouped selectors, no-op moves).
- **Determinism**: Tests must run offline in standard Node.js without a browser or display server.

## Pitfalls

- **UMD purity in `src/*.js`**: `test/run.js` loads `src/*.js` directly via `require()`. Keep `src/*.js` free of DOM-only globals at module load time so they remain testable in Node.js (`D-001`).
- **500-line file limit**: Adding code that pushes any `src/app/*.js` file over 500 lines will fail `test/structure.test.js`. Check line counts with `wc -l src/app/*.js`.
