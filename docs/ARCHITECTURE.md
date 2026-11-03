# Architecture

How Plainchant Web fits together, for a session that has never seen it. This is the map, not the territory: it names
the parts and the rules between them, and leaves the detail to the code.

Why things are this way lives in [DECISIONS.md](DECISIONS.md); this file says *what* is, and points there.

## The shape, in one paragraph

The browser or Tauri v2 desktop window loads `app.html`, which loads 12 pure UMD modules (`src/*.js`) followed by 19 classic application scripts (`src/app/*.js`) sharing a single global scope (D-001). Multi-file project state lives in `projectFiles.entries` (`src/app/core.js`). On every edit, `render()` parses the active HTML (`HtmlAst.parse`) and linked CSS (`CssAst.parse`), paints syntax colors and line highlights behind the transparent code `<textarea>` (`src/app/shade.js`, D-002), and assembles an ephemeral preview document (`Project.assemblePreview`) stamped with `data-pc-id` attributes for `<iframe id="stageFrame">` (`src/app/stage.js`, D-003). Visual interactions on the Stage communicate back to the parent window via `postMessage`, splicing exact byte ranges in the HTML or CSS source and persisting to IndexedDB (`src/store.js`, D-004).

## Code map

| Area | Where | Entry point | Talks to |
| --- | --- | --- | --- |
| HTML5 AST & splicer | `src/html-ast.js` | `HtmlAst.parse()`, `stamp()`, `setAttr()`, `setText()`, `insertElement()`, `moveElement()`, `duplicateElement()` | Pure string/AST transforms; no DOM (D-003) |
| CSS AST & splicer | `src/css-ast.js` | `CssAst.parse()`, `findRulesForElement()`, `findRuleBySelector()`, `setProperty()` | Pure string/AST transforms; no DOM (D-003) |
| Syntax shader | `src/code-shade.js`, `src/app/shade.js` | `CodeShade.shade()`, `drawShade()`, `highlightCodeRange()` | `#editor` and `.editor-shade` (D-002) |
| Project & preview bundler | `src/project.js` | `Project.pack()`, `unpack()`, `assemblePreview()`, `primaryCssFile()` | `HtmlAst` (`stamp` only in preview) (D-004, D-006) |
| Core state & File Explorer | `src/app/core.js` | `loadProjectIntoEditor()`, `openFileInEditor()`, `applyHtmlTransform()`, `applyCssTransform()`, `render()` | `HtmlAst`, `CssAst`, `Project`, `shade.js`, `stage.js`, `typing.js` |
| Code typing & Undo/Redo | `src/app/typing.js`, `src/editing.js`, `src/suggest.js` | `applyEdit()`, `performUndo()`, `performRedo()`, `insertSnippet()` | `Editing`, `Suggest`, `core.js` (D-010) |
| Stage bridge & WYSIWYG | `src/app/stage.js` | `drawStageNow()`, `buildBridgeScript()` | `#stageFrame` via `srcdoc` and `window.postMessage` (D-008, D-009) |
| Properties & CSS Designer | `src/app/inspector-ui.js`, `src/app/panes.js` | `refreshInspector()`, `jumpToActiveCssRule()`, `openContextMenuAt()` | `HtmlAst`, `CssAst`, `core.js`, `layout.js` (D-007) |
| Storage & Snapshots | `src/store.js`, `src/library.js`, `src/versions.js`, `src/app/persistence.js` | `Store.open()`, `saveScript()`, `restoreLastScript()` | IndexedDB (`plainchant_web_db`) and `localStorage` emergency buffer (D-004) |
| Tauri desktop & Folder I/O | `src-tauri/src/main.rs`, `src/app/tauri-files.js`, `src/app/export.js` | `openProjectFolder()`, `exportProjectToFolder()`, `spawn_asset_server()` | Tauri IPC (`open_project_folder`, `save_project_folder`) and localhost HTTP asset server (D-005, D-006) |

## Interfaces and data flow

```text
Code / Stage / Inspector input -> HtmlAst / CssAst byte-range splice -> projectFiles.entries[file] -> render() + Undo snapshot + IndexedDB auto-save
```

| Interface | Producer | Consumer | Contract / compatibility |
| --- | --- | --- | --- |
| Stage `postMessage` (`pc-select`, `pc-inline-input`, `pc-move-to`, `pc-contextmenu`, `pc-undo`, `pc-redo`) | `#stageFrame` bridge script (`src/app/stage.js`) | `window.addEventListener('message')` in `src/app/stage.js` | JSON object with `type`, `id` (`data-pc-id`), and action payload |
| Tauri IPC (`open_project_folder`, `save_project_folder`) | `src/app/tauri-files.js` | `src-tauri/src/main.rs` | `ProjectFolderPayload { path, base_url, files, tree }` |
| Multi-file bundle string | `Project.pack()` (`src/project.js`) | `Project.unpack()`, `Store.saveScript()` | `/* === PLAINCHANT:FILE:<relPath> === */` markers (D-004) |

## Invariants

- **Pure `src/*.js` modules never touch the DOM** (except `src/store.js` which wraps IndexedDB). Enforced by: Node unit execution in `test/run.js` without a DOM globals shim (D-001).
- **Single global scope in `src/app/*.js` with no duplicate top-level declarations and max 500 lines per file.** Enforced by: `test/structure.test.js` (D-001).
- **No inline `<script>` or `<style>` in `app.html`, and `sw.js` `APP_FILES` matches all linked assets.** Enforced by: `test/structure.test.js` (P4-01).
- **Opening a local folder never auto-writes to local disk.** Auto-save writes only to the Studio workspace in IndexedDB; disk writes occur only via explicit Export (`src/app/tauri-files.js`, D-006).
- **Clicking on the Design Stage never steals keyboard focus to `#editor`.** Enforced by `selectElementById` (`focusEditor: false`) in `src/app/layout.js` and `applyEdit` (`keepFocus: true`) in `src/app/typing.js` (D-009).

## Boundaries

| Boundary | Comes in as | Checked by | Rule |
| --- | --- | --- | --- |
| User HTML/CSS/JS in `#stageFrame` | `stageFrame.srcdoc` | `<iframe sandbox="allow-scripts allow-same-origin">` + Design Mode script stripping (`Project.assemblePreview`) | In Design Mode, `<script>` tags in user HTML are stripped so user JS cannot interfere with the inspection bridge |
| Localhost asset server (`src-tauri/src/main.rs`) | HTTP `GET /<relPath>` | `Component::ParentDir` / `RootDir` / `Prefix` rejection in `spawn_asset_server` | Requests containing `..` or root prefixes are rejected with `404` |
| Folder export paths (`save_project_folder`) | Relative file paths in `projectFiles.entries` | `Component::ParentDir` / `RootDir` / `Prefix` check in `save_project_folder` | Never writes outside the chosen target directory |

## Dependencies

| Dependency | Version | For | Why this one (and not writing it) |
| --- | --- | --- | --- |
| Frontend runtime | None | `app.html`, `src/*.js`, `src/app/*.js` | Zero frontend dependencies by design (D-001) |
| `tauri` / `tauri-build` | `2` | Native desktop window & IPC (`src-tauri/Cargo.toml`) | Lightweight OS webview wrapper (D-005) |
| `rfd` | `0.15` | Native OS folder picker dialog in `src-tauri` | Standard Rust native file dialog crate |
| `serde` / `serde_json` | `1` | Tauri IPC payload serialization | Required by Tauri command macros |

## State and caches

| What | Where | Written by | Reset by | Committed? |
| --- | --- | --- | --- | --- |
| Studio projects & snapshots | Browser/WebView IndexedDB (`plainchant_web_db`) | `src/store.js`, `src/app/persistence.js` | Clearing site data or deleting in Projects modal | No |
| Emergency unsaved buffer | `localStorage['plainchant_web_emergency']` | `src/app/persistence.js` | Reconciled and cleared on next IndexedDB open | No |
| UI & Inspector settings | `localStorage['plainchant_web_settings']`, `localStorage['plainchant_web_inspector_ui']` | `src/app/settings.js`, `src/app/panes.js` | Browser storage clear | No |
| Staged Tauri frontend assets | `src-tauri/dist/` | `src-tauri/build.rs` | Overwritten on every `cargo build` | No, gitignored (D-005) |
| Rust build artifacts | `src-tauri/target/` | `cargo build` | `cargo clean` | No, gitignored |

## Failure modes and observability

| Failure | User-visible behaviour | Detection | Recovery / runbook |
| --- | --- | --- | --- |
| Syntax shader line-wrap mismatch | Editor turns off syntax colors and falls back to plain textarea text | `checkShade()` in `src/app/shade.js` logs warning | Reload page or adjust zoom/font size |
| Live JS runtime error in Stage | Red notice banner at bottom-right (`JS Runtime Error: ...`) | `window.onerror` bridge in `src/project.js` | Switch back to Design Mode or fix `script.js` |
| IndexedDB unavailable (private window) | Error state on Save button; emergency `localStorage` fallback | `openStorage()` in `src/app/persistence.js` | Export project to disk via **Export** |

## Claims vs. code

- None currently known; all documented features are implemented and verified in `test/`.
