# Invariants

The rules that make Plainchant Web what it is. [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`HANDOFF.md`](HANDOFF.md) change
as the code does; these do not. An agent never edits, relaxes, or works around an invariant without an explicit
maintainer decision, and a change that would break one stops and asks (see Zones and "While working" in
[`AGENTS.md`](../AGENTS.md)).

Identifiers are `INV-NNN`, permanent, never renumbered. A retired invariant stays, marked `retired by D-NNN`. Each entry
states what enforces it; "Nothing yet" is an honest answer and is tracked in the roadmap (`P8-01`).

---

## INV-001 No build step, no runtime frontend dependencies
- **Rule:** The app is static HTML, CSS, and vanilla JavaScript that runs from a file or a plain static server. The only
  third-party runtime code is the vendored, unmodified Prism.
- **Why:** Direct `file://` and offline use, a codebase one person can read, and nothing to break on upgrade (D-001, D-034).
- **Enforced by:** The Prism vendoring, licence, and load-order checks in `test/structure.test.js`. Nothing yet stops a
  new dependency or build tool from being added.

## INV-002 Editing never rewrites what the user did not touch
- **Rule:** Visual edits splice exact byte ranges in the user's HTML and CSS. Studio artifacts (`data-pc-id`, the bridge
  script, forced-state selector twins) exist only in the preview document and never in a source buffer or export.
- **Why:** Round-trip editing is the product; serializing the live DOM destroys formatting and comments (D-003).
- **Enforced by:** Round-trip and splice unit tests in `test/html-ast.test.js` and `test/css-ast.test.js`. Nothing yet
  proves that no artifact reaches a source buffer or an export.

## INV-003 Disk is written only on an explicit Export
- **Rule:** Opening a folder creates an isolated Studio copy in IndexedDB. Auto-save writes only to that copy; project
  files on disk change only when the user triggers Export, and Export never deletes files already on disk.
- **Why:** Opening a real project must be safe (D-006, D-024).
- **Enforced by:** Nothing yet. Held in tension with "source files are the single source of truth" (T-001).

## INV-004 The always-on asset server is loopback-only
- **Rule:** The localhost asset server binds `127.0.0.1` and rejects `..` and root components. Anything reachable from
  the network is the separate, opt-in, token-gated, read-only preview server and exists only while sharing.
- **Why:** An always-on listener must not widen the machine's exposure (D-006, D-029).
- **Enforced by:** `test/structure.test.js` (no `0.0.0.0` bind in `main.rs`, loopback address present) and the Rust
  tests for the path guard and preview token and gating.

## INV-005 Untrusted project scripts run only in Live JS mode
- **Rule:** Design mode strips user `<script>` tags before the studio bridge is injected. User scripts run only after
  the user switches the Stage to Live JS, inside the sandboxed `#stageFrame`.
- **Why:** Users open third-party folders (D-003; `docs/SECURITY.md`).
- **Enforced by:** Nothing yet; the stripping is in `Project.assemblePreview` with no dedicated test.

## INV-006 Pure modules are pure, and the app scripts stay small and unambiguous
- **Rule:** `src/*.js` modules load in Node without a DOM (except the IndexedDB wrapper `src/store.js`). Every
  `src/app/*.js` file is listed in `app.html` in load order, is at most 500 lines, and redeclares no top-level
  identifier. No inline `<script>` or `<style>` in `app.html`, and every linked asset is in `sw.js` `APP_FILES`.
- **Why:** Node tests can `require()` the logic, classic scripts share one global scope, and the offline cache stays
  honest (D-001, D-002, D-035).
- **Enforced by:** `test/run.js` (no DOM shim) and `test/structure.test.js`.
