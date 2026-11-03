# Plainchant Web

Lightweight, Dreamweaver-inspired HTML5, CSS, and JavaScript WYSIWYG studio spun off from Plainchant (`aedmark/plainchant`). Built for web designers and developers who want true round-trip visual and code editing where the project's `.html`, `.css`, and `.js` source files remain the single source of truth. Static HTML, CSS, and vanilla JavaScript with zero frontend build step and zero runtime frontend dependencies, running in any modern browser or as a native desktop app via Tauri v2 (see [docs/DECISIONS.md](docs/DECISIONS.md)).

This is the canonical instruction file for coding agents. `CLAUDE.md` imports it; do not duplicate these rules in tool-specific files. Project facts belong in the documents linked below, not in an agent's private memory.

## Start here

1. Read [docs/HANDOFF.md](docs/HANDOFF.md) for the current state, active work, and gotchas.
2. Read the relevant item in [ROADMAP.md](ROADMAP.md) and the parts of [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/TESTING.md](docs/TESTING.md) that apply.
3. Inspect `git status` and recent history. Do not overwrite work you did not create.
4. Verify important inherited claims before relying on them. Use the fastest relevant check first (`npm test`).
5. State the intended scope briefly, then work on one independently reviewable change at a time.

If the repository is new or unfamiliar, read [README.md](README.md) and [docs/README.md](docs/README.md) first. If the request conflicts with these instructions or the working tree contains overlapping edits, stop and ask the maintainer.

## While working

- Reference roadmap IDs (`P1-01`, etc.) where one exists. Do not invent an ID for an incidental, self-contained fix.
- Keep changes scoped. Do not mix opportunistic refactors with requested work.
- Preserve user changes. Never reset, clean, or rewrite history without explicit permission.
- Record a decision in [docs/DECISIONS.md](docs/DECISIONS.md) when reasonable maintainers could revisit the choice later.
- Update documentation in the same change when behaviour, interfaces, commands, risks, or project structure change.
- Distinguish observed facts from inference. Include the command, date, environment, or source behind volatile claims.
- Prefer enforcement to prose: important invariants should have a test in `test/` (`test/structure.test.js` or unit tests).
- Treat all external input as untrusted at its boundary. Never expose secrets in logs, fixtures, prompts, or commits.
- Add newly discovered work to [ROADMAP.md](ROADMAP.md) only when it is genuinely out of scope for the current change.

## Finishing a change

1. Run the checks appropriate to the change, following [docs/TESTING.md](docs/TESTING.md) (`npm test` and, when touching desktop or frontend assets, `cargo build --manifest-path src-tauri/Cargo.toml`). Record failures and anything not run.
2. Review the diff for unrelated edits, generated files, credentials, stale names, and documentation drift.
3. Update [docs/HANDOFF.md](docs/HANDOFF.md) if work will continue in another session or if the repository's current state changed.
4. Update the roadmap item, decision record, architecture, security notes, and changelog only when their documented update trigger applies (see [docs/README.md](docs/README.md)).
5. Run `python3 tools/check_docs.py` and report the result.

Do not manufacture ceremony: typo-only or mechanical changes do not need a decision, changelog entry, or handoff rewrite unless they alter a claim those documents make.

## Working agreement

Direct-to-`master` workflow with maintainer review in-session. Agents may commit and push when requested by the maintainer, but must never add runtime frontend dependencies, delete user project data, or force-push.

- Default branch: `master`.
- Working branch pattern: `feature/<topic>` when branching is requested; otherwise `master`.
- Commit format: concise imperative summary referencing roadmap IDs when applicable.
- Release/version scheme: SemVer in `package.json` and `src-tauri/Cargo.toml` (`1.0.0`).

Never force-push, rewrite shared history, publish, or rotate/delete production data without explicit permission.

## Maintainer preferences

Record durable preferences here so they survive agent and session changes. Keep temporary task instructions in the task or handoff instead.

- **Writing:** Concise, direct explanations without fluff. Format file and symbol references as clickable links.
- **Code comments:** Self-documenting vanilla JS; comment only non-obvious invariants or parser edge cases.
- **Asking vs. doing:** Ask before destructive actions or changing core product workflows; otherwise implement and verify end-to-end.
- **Reporting:** State what changed, which files were updated, and exact verification results (`npm test`, `cargo build`, `check_docs.py`).

## Protected areas

Things an agent must not change without explicit permission. Every rule includes its reason or decision.

| Path or thing | Rule | Why |
| --- | --- | --- |
| `LICENSE`, `fonts/*.txt` | Do not edit | Legal and font licensing terms (D-001) |
| `test/structure.test.js` invariants | Do not weaken | Enforces no-build, global-scope, 500-line limit, and offline cache rules (D-001, D-002) |

## Names and terms

| Canonical term | Meaning | Formerly / not to be confused with |
| --- | --- | --- |
| Plainchant Web | This HTML5, CSS, and JS WYSIWYG studio (`aedmark/plainchant-web`) | Plainchant Prime (`aedmark/plainchant`, the Fountain screenwriting app) |
| Stage | The live iframe preview (`#stageFrame`) operating in either **Design** mode or **Live JS** mode | Screenplay `#page` preview in Plainchant Prime |
| Studio Project Environment | The in-app working copy stored in IndexedDB (`projectFiles.entries`), isolated from local disk until exported | Direct auto-overwriting disk sync |

## Layout

| Path | Purpose |
| --- | --- |
| `index.html`, `src/home.css` | Public landing page and self-contained styling |
| `app.html` | Studio application markup and script/style links (no inline `<script>` or `<style>`) |
| `src/styles.css` | Studio stylesheet (dark, light, and retro themes; responsive layout; Inspector and context menus) |
| `src/html-ast.js` | Non-destructive HTML5 parser, `data-pc-id` stamper, and surgical byte-range splicer (UMD, no DOM) |
| `src/css-ast.js` | Non-destructive CSS rule/declaration parser, selector matcher, and rule splicer (UMD, no DOM) |
| `src/code-shade.js` | Line-by-line syntax classifier and token shader for HTML, CSS, and JS (UMD, no DOM) |
| `src/dom-outline.js` | Hierarchical DOM tree builder and ancestor breadcrumb formatter (UMD, no DOM) |
| `src/project.js` | Multi-file project bundle packer/unpacker, preview assembler, and single-file HTML exporter (UMD) |
| `src/editing.js` | Tab abbreviation expander, smart Enter auto-indenter, diff calculator, and HTML5 snippets (UMD) |
| `src/suggest.js` | Context-aware autocomplete for HTML tags, CSS properties, and project selectors (UMD) |
| `src/library.js` | Project library rules: search, soft delete, restore, 30-day purge, duplicate, rename (UMD) |
| `src/store.js` | IndexedDB persistence wrapper and emergency buffer reconciliation (UMD) |
| `src/versions.js` | Project snapshot retention and pruning rules (UMD) |
| `src/filesync.js` | Disk vs. studio content comparison helpers (UMD) |
| `src/importing.js` | Text/code file extension filter and UTF-8/UTF-16/Windows-1252 decoder (UMD) |
| `src/app/explorer-ui.js` | Explorer Rename / Duplicate / Delete, file context menu, and unsaved-file dots |
| `src/finding.js` | Plain-text search and replace offset helpers for the find bar (UMD, no DOM) |
| `src/app/find-project.js` | Project scope of the find bar: results list, per-file selection, and Replace All in Project |
| `src/app/find.js` | Find/Replace bar, match highlight layer, and `Ctrl/Cmd+F` / `Ctrl/Cmd+H` shortcuts |
| `src/links.js` | Static link and missing-file checker for HTML and CSS (UMD, no DOM) |
| `src/app/problems-ui.js` | Problems Inspector tab: results list, badge, re-check, and click-to-jump |
| `src/parts.js` | Shared page parts: marker-region finder, status scanner, and synchronizer (UMD, no DOM) |
| `src/app/parts-ui.js` | Parts Inspector tab, Make Part, Insert Part, and part-edit propagation |
| `src/app/assets.js` | Binary project assets (Blobs, `blob:` preview URLs, IndexedDB persistence) for the browser build |
| `src/app/css-states.js` | CSS Designer pseudo-state bar: state-aware rule selector and forced-state preview messages |
| `src/app/insert-drag.js` | Pointer-based drag from the Insert menu onto the Design Stage (drop guide, ghost label, insert) |
| `src/app/stage-live.js` | Live JS link bridge and project link following (loaded after `stage.js`) |
| `src/app/console-ui.js` | Console Inspector tab: log rows, filters, unread badge, click-to-jump (loaded after `inspector-ui.js`) |
| `src/app/` | Classic scripts sharing one global scope, loaded in order by `app.html` (`core.js` first, `main.js` last) |
| `src-tauri/` | Tauri v2 Rust desktop shell, recursive project folder loader, and localhost static asset server |
| `test/` | Node unit and structural test runner (`test/run.js`, `test/*.test.js`) |
| `AGENTS.md` | Canonical agent instructions |
| `CLAUDE.md` | Imports `AGENTS.md` for Claude/agent tooling |
| `ROADMAP.md` | Planned and completed work with stable IDs |
| `docs/README.md` | Documentation map and update triggers |
| `docs/HANDOFF.md` | Current state, next steps, gotchas, and bounded session history |
| `docs/ARCHITECTURE.md` | Components, boundaries, invariants, state, and failure modes |
| `docs/DECISIONS.md` | Append-only architectural and product decisions; open questions |
| `docs/TESTING.md` | Test strategy, commands, limitations, and environment recipes |
| `docs/SECURITY.md` | Assets, trust boundaries, secret handling, and reporting |
| `docs/CONTRIBUTING.md` | Human and agent contribution workflow |
| `docs/CHANGELOG.md` | User-visible release notes |
| `docs/plainchant-web.manual.json`, `docs/manual.html` | 3x What / How / Why manual source and generated standalone HTML manual |
| `docs/manual.schema.json` | JSON Schema for the 3x manual source |
| `docs/archive/` | Historical material no longer current |
| `tools/check_docs.py` | Documentation consistency checks |
| `tools/manual.py`, `tools/test_manual.py`, `tools/manual.LICENSE` | 3x manual generator, unit tests, and upstream license |

## Engineering conventions

- Vanilla JavaScript (ES2020+), zero frontend frameworks, zero npm runtime dependencies (D-001).
- Classic `<script>` files in `src/app/*.js` (no ES modules, so `file://` and offline execution work everywhere) and UMD modules in `src/*.js` so Node tests can `require()` them directly (D-001, D-002).
- Every file in `src/app/*.js` must be listed in `app.html` in load order (`core.js` first, `main.js` last), must stay at or under 500 lines, and must not redeclare any top-level identifier declared in another `src/app/*.js` file (`test/structure.test.js`).
- Any asset linked in `app.html` must also be listed in `sw.js` `APP_FILES` (`test/structure.test.js`).
- `src-tauri/build.rs` stages frontend assets into `src-tauri/dist/` during `cargo build`; `src-tauri/dist/` and `src-tauri/target/` are build artifacts and must remain gitignored (D-005).

## Environments

| Environment | Can access | Cannot access / caveats |
| --- | --- | --- |
| Local development (Linux) | Node.js, Rust/Cargo (`src-tauri`), Python 3, local filesystem | Headless CI may lack a display server for live GUI window inspection |
| Browser (`app.html`) | IndexedDB, Service Worker (over HTTP/HTTPS), Chromium File System Access API | Cannot spawn the Tauri localhost asset server for binary assets outside Tauri |
| Tauri v2 Desktop | Native folder dialogs (`rfd`), recursive directory read/write, localhost asset server (`127.0.0.1:<port>`) | WebKitGTK drag-and-drop quirks (handled via pointer-based drag on Stage, D-008) |

## Run and verify

- Setup: No npm install needed for tests; Rust toolchain required only for Tauri desktop builds.
- Run in browser: `python3 -m http.server 8080` (then open `http://localhost:8080/app.html`).
- Run Tauri desktop app: `npm run tauri:dev`.
- Fast checks: `npm test`, `python3 tools/check_docs.py`, and `python3 tools/manual.py check docs/plainchant-web.manual.json`.
- Rebuild 3x manual: `python3 tools/manual.py build docs/plainchant-web.manual.json --output docs/manual.html`.
- Full checks: `npm test && python3 tools/check_docs.py && python3 -m unittest tools/test_manual.py && cargo build --manifest-path src-tauri/Cargo.toml`.
- Detailed test guidance: [docs/TESTING.md](docs/TESTING.md).
