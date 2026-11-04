# Architecture

How Plainchant Web fits together, for a session that has never seen it. This is the map, not the territory: it names
the parts and the rules between them, and leaves the detail to the code.

Why things are this way lives in [DECISIONS.md](DECISIONS.md); this file says *what* is, and points there.

## The shape, in one paragraph

The browser or Tauri v2 desktop window loads `app.html`, which loads 23 pure UMD modules (`src/*.js`) followed by 40 classic application scripts (`src/app/*.js`) sharing a single global scope (D-001). Multi-file project state lives in `projectFiles.entries` (`src/app/core.js`). On every edit, `render()` parses the active HTML (`HtmlAst.parse`) and linked CSS (`CssAst.parse`), paints syntax colors and line highlights behind the transparent code `<textarea>` (`src/app/shade.js`, D-002), and assembles an ephemeral preview document (`Project.assemblePreview`) stamped with `data-pc-id` attributes for `<iframe id="stageFrame">` (`src/app/stage.js`, D-003). Visual interactions on the Stage communicate back to the parent window via `postMessage`, splicing exact byte ranges in the HTML or CSS source and persisting to IndexedDB (`src/store.js`, D-004).

## Code map

| Area | Where | Entry point | Talks to |
| --- | --- | --- | --- |
| HTML5 AST & splicer | `src/html-ast.js` | `HtmlAst.parse()`, `stamp()`, `setAttr()`, `setText()`, `insertElement()`, `moveElement()`, `duplicateElement()` | Pure string/AST transforms; no DOM (D-003) |
| CSS AST & splicer | `src/css-ast.js` | `CssAst.parse()`, `findRulesForElement()`, `findRuleBySelector()`, `setProperty()` | Pure string/AST transforms; no DOM (D-003) |
| Syntax shader & line gutter | `src/code-shade.js`, `src/app/shade.js` | `CodeShade.shade()`, `drawShade()`, `highlightCodeRange()`, `drawGutter()` | `#editor`, `.editor-shade`, `#editorGutter` (D-002, D-015) |
| Find / Replace | `src/finding.js`, `src/app/find.js`, `src/app/find-project.js` | `Finding.findAll()`, `findInFiles()`, `replaceInFiles()`, `openFind()`, `replaceCurrentMatch()`, `replaceAcrossProject()` | `#findBar`, `#findResults`, `.editor-find` layer, `applyEdit()` in `typing.js`, `commitPartEntries()` in `parts-ui.js` (D-015, D-019) |
| Project & preview bundler | `src/project.js` | `Project.pack()`, `unpack()`, `assemblePreview()`, `primaryCssFile()` | `HtmlAst` (`stamp` only in preview) (D-004, D-006) |
| Explorer folders, moves & tab order | `src/app/explorer-move.js`, `Project.moveFolder()` / `deriveTree()` / `validateFolderPath()`, `treeAfter` `mkdir` / `moveDir` | `newProjectFolder()`, `moveProjectPath()`, `moveProjectFolderTo()`, `moveAssetTo()`, `decorateExplorerDir()` | Explorer pointer drag, `commitFileChange` `apply` hook, export `dirs` (D-027) |
| Explorer file operations & dirty marks | `src/app/explorer-ui.js`, `Project.renameFile()` / `duplicateFile()` / `deleteFile()` / `treeAfter()`, `FileSync.dirtyPaths()` | `renameProjectFile()`, `duplicateProjectFile()`, `deleteProjectFile()`, `markFilesSaved()`, `refreshDirtyMarks()` | `core.js` (`renderExplorer`, `renderFileTabs`), `typing.js` undo snapshots, `persistence.js` and `tauri-files.js` (baseline resets) (D-017) |
| Core state & File Explorer | `src/app/core.js` | `loadProjectIntoEditor()`, `openFileInEditor()`, `applyHtmlTransform()`, `applyCssTransform()`, `render()` | `HtmlAst`, `CssAst`, `Project`, `shade.js`, `stage.js`, `typing.js` |
| Code typing & Undo/Redo | `src/app/typing.js`, `src/editing.js`, `src/suggest.js` | `applyEdit()`, `performUndo()`, `performRedo()`, `insertSnippet()` | `Editing`, `Suggest`, `core.js` (D-010) |
| Stage bridge & WYSIWYG | `src/app/stage.js` | `drawStageNow()`, `buildBridgeScript()` | `#stageFrame` via `srcdoc` and `window.postMessage` (D-008, D-009) |
| Properties & CSS Designer | `src/app/inspector-ui.js`, `src/app/panes.js`, `src/app/dock-ui.js` | `refreshInspector()`, `jumpToActiveCssRule()`, `openContextMenuAt()`, `setInspectorDock()` | `HtmlAst`, `CssAst`, `core.js`, `layout.js` (D-007, D-016) |
| Flex and grid gap handles | `src/layout.js` (pure geometry, `Layout.source` is embedded in the iframe), `src/app/stage-layout.js`, `src/app/layout-ui.js` | `layoutBridgeMain()`, `buildLayoutBridgeScript()`, `showLayoutInfo()` | Stage bridge messages `pc-layout-info` and `pc-layout-gap`; edits go through `applyCssPropertyChange()` (D-025) |
| CSS breakpoints | `src/app/css-media.js`, `CssAst` `media` arguments, `mediaQuery()`, `blocks` from `CssAst.parse`, `MEDIA_PRESETS` | `cssEditMedia()`, `setCssMedia()`, `refreshCssMediaUi()` | `inspector-ui.js` (CSS Designer), Stage viewport buttons (D-026) |
| CSS pseudo-states | `src/app/css-states.js`, `CssAst.withState()` / `baseSelector()` / `stateOf()` / `forceStates()`, `Project.assemblePreview` `forceStates` option | `cssEditSelector()`, `setCssState()`, `sendForceState()`, bridge `applyForce()` | `inspector-ui.js` (CSS Designer), Stage bridge `pc-force-state` message and `data-pc-force` attribute (D-021) |
| Insert drag-to-Stage | `src/app/insert-drag.js`, `HtmlAst.insertElementAt()`, `DomOutline.dropPlacement()` | `describeInsertDrop()`, `dropInsertedSnippet()` | Stage document via `stageFrame.contentDocument`, `data-pc-drop-target` in the bridge CSS, `applyHtmlTransform()` (D-020) |
| Stage link navigation | `src/app/stage-live.js`, `Project.resolveRelativePath` in `src/project.js` | `buildLiveBridgeScript()`, `followProjectLink()`, `projectLinkTarget()` | `#stageFrame` via `postMessage`, `openFileInEditor()` in `core.js`, `inspector-ui.js` (D-012) |
| JS Console | `src/app/console-ui.js`, `Project.consoleBridge` in `src/project.js` | `addConsoleEntry()`, `clearConsole()`, `jumpToSourceLine()` | `#stageFrame` via `postMessage`, `core.js`, `inspector-ui.js` (D-011) |
| Link checker & Problems | `src/links.js`, `src/hints.js` (accessibility and markup hints, D-028), `src/app/problems-ui.js` | `Links.createChecker().check()`, `runProblemsCheck()`, `scheduleProblemsCheck()`, `jumpToProblem()` | `HtmlAst`, `Project.resolveRelativePath`, `render()` in `core.js`, `projectAssets` (D-018) |
| Shared parts | `src/parts.js`, `src/app/parts-ui.js` | `Parts.scan()`, `sync()`, `pull()`, `makePartFromSelection()`, `insertPart()`, `propagatePartEdits()` | `Project.resolveRelativePath`, `render()` in `core.js`, `typing.js` undo (D-014) |
| Asset manager | `src/imagelib.js`, `src/app/asset-ui.js`, `addProjectAsset()` / `removeProjectAsset()` in `src/app/assets.js`, `Store.putAsset()` / `deleteAsset()`, `Links.usage()`, `Project.renameAsset()`, `assetsForSnapshot()` / `restoreProjectAssets()` (asset undo, D-024) | `openAssetManager()`, `addImageFiles()`, `ImageLib.list()` | `#assets-modal`, `projectAssets`, `projectFiles.tree`, `importFiles()` in `import.js`, Properties **Browse…** (D-023) |
| Binary assets (browser) | `src/app/assets.js`, `Store.putAssets()` / `loadAssets()` / `copyAssets()` in `src/store.js`, `Project.rewriteAssetUrls()` | `setProjectAssets()`, `adoptProjectAssets()`, `saveProjectAssets()` | IndexedDB `assets` store, `Project.assemblePreview` `assetUrls` option, `tauri-files.js` folder scan and export (D-013) |
| Storage & Snapshots | `src/store.js`, `src/library.js`, `src/versions.js`, `src/app/persistence.js` | `Store.open()`, `saveScript()`, `restoreLastScript()` | IndexedDB (`plainchant_web_db`) and `localStorage` emergency buffer (D-004) |
| Shortcut cheat sheet | `src/shortcuts.js`, `renderShortcuts()` in `src/app/help.js` | `Shortcuts.GROUPS`, `Shortcuts.all()` | Help modal `#shortcutList`; each entry names its handler file and needle, checked by `test/shortcuts.test.js` (D-031) |
| Folder links (one folder = one project) | `src/projectlink.js`, `src/app/project-links.js`, `Store.putLink()` / `loadLinks()` / `removeLink()`, Rust `use_project_folder` | `ProjectLink.findByPath()`, `changedOnDisk()`, `hashEntries()`, `folderOwner()`, `openExistingFolderProject()`, `reloadFolderFromDisk()`, `restoreProjectLink()` | `src/app/tauri-files.js` open and export flows, `persistence.js` startup, `commitFileChange()` (D-033) |
| Toolbar menus | `src/app/menus.js`, `.menu-wrap` / `.menu-panel` in `app.html` | `setAppMenu()`, `closeAppMenus()` | Existing button ids and listeners (`newBtn`, `exportBtn`, `previewBtn`, `copyBtn`, `formatBtn`), `openFind()`, `setInsertMenuOpen()` (D-032) |
| Format | `src/format.js`, `src/app/format-ui.js` | `Format.formatHtml()` / `formatCss()` / `formatJs()` / `byPath()` / `detectIndent()`, `formatActiveFile()` | `Editing.diffEdit()`, `applyEdit()` in `typing.js`, `activeFile` (D-030) |
| Network and tab preview | `src/preview.js`, `src/app/preview-ui.js`, `src-tauri/src/preview.rs` | `Preview.urls()` / `entryFor()` / `assetSignature()`, `startPreview()`, `schedulePreviewPush()`, `openPreviewTab()`, Rust `preview_start` / `preview_update` / `preview_stop` / `preview_open` | `render()` and asset changes in `core.js` / `assets.js`, `encodeProjectAssets()`, `projectFiles.entries`, `Project.assemblePreview` (D-029) |
| Zip export | `src/zip.js`, `src/app/zip-ui.js` | `Zip.build()`, `Zip.list()`, `downloadProjectZip()` | Export dialog (`export.js` `downloadFile`), `projectFiles.entries`, `projectAssets` (D-022) |
| Tauri desktop & Folder I/O | `src-tauri/src/main.rs`, `src/app/tauri-files.js`, `src/app/export.js` | `openProjectFolder()`, `exportProjectToFolder()` (sends added images as base64 `assets`, D-024), `spawn_asset_server()` | Console `postMessage` (`pc-console`: `level`, `args[]`, `line`, `source`, `time`) | Live JS bridge (`Project.consoleBridge`, injected only in Live JS mode) | `addConsoleEntry()` in `src/app/console-ui.js` via `src/app/stage.js` | `level` is `log`, `info`, `warn`, or `error`; `line`/`source` are set only for `window.onerror` (D-011) |
| Link `postMessage` (`pc-navigate`: `href`; `pc-follow-link`: `id`) | Live JS bridge (`src/app/stage-live.js`), Design bridge (`Ctrl/Cmd+Click`, badge `Follow ↗`) | `followProjectLink()` / `followSelectedLink()` via `src/app/stage.js` | `href` is the raw attribute; resolution and project lookup happen only in the Studio (D-012) |
| Tauri IPC (`open_project_folder`, `save_project_folder`) and localhost HTTP asset server (D-005, D-006) |

## Interfaces and data flow

```text
Code / Stage / Inspector input -> HtmlAst / CssAst byte-range splice -> projectFiles.entries[file] -> render() + Undo snapshot + IndexedDB auto-save
```

| Interface | Producer | Consumer | Contract / compatibility |
| --- | --- | --- | --- |
| Stage `postMessage` (`pc-force-state` from the page to the bridge: `state`; `pc-select`, `pc-inline-input`, `pc-move-to`, `pc-contextmenu`, `pc-undo`, `pc-redo`) | `#stageFrame` bridge script (`src/app/stage.js`) | `window.addEventListener('message')` in `src/app/stage.js` | JSON object with `type`, `id` (`data-pc-id`), and action payload |
| Tauri IPC (`open_project_folder`, `save_project_folder`) | `src/app/tauri-files.js` | `src-tauri/src/main.rs` | `ProjectFolderPayload { path, base_url, files, tree }` |
| Tauri IPC (`preview_start`, `preview_update`, `preview_stop`, `preview_open`) | `src/app/preview-ui.js` | `src-tauri/src/preview.rs` | `files: {path: text}`, `assets: {path: base64} or null` (null keeps images), `entry: path`; `preview_start` returns `{ port, token, addresses }` (D-029) |
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
| Network preview server (`src-tauri/src/preview.rs`) | HTTP `GET`/`HEAD` `/<token>/<relPath>` from any host on the network | 128-bit token prefix, `is_safe_relative`, method check | Off until **Start sharing**; read-only; serves memory plus non-text disk files; stops on **Stop sharing** or quit (D-029) |
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
| Unsaved-file baseline | In memory (`savedFileEntries`) | `markFilesSaved()` on load, explicit Save, and Export | Project switch | No |
| Emergency unsaved buffer | `localStorage['plainchant_web_emergency']` | `src/app/persistence.js` | Reconciled and cleared on next IndexedDB open | No |
| UI & Inspector settings | `localStorage['plainchant_web_settings']` (includes Inspector visibility, dock, and side width) | `src/app/settings.js`, `src/app/panes.js`, `src/app/dock-ui.js` | Browser storage clear | No |
| Project binary assets (browser build) | IndexedDB `assets` store (`plainchant_web` v2) and in-memory Blob URLs (`projectAssetUrls`) | `src/app/tauri-files.js` folder scan, `src/app/assets.js` | Deleting the project (trash purge) or clearing site data; Blob URLs are revoked on every project load | No |
| Staged Tauri frontend assets | `src-tauri/dist/` | `src-tauri/build.rs` | Overwritten on every `cargo build` | No, gitignored (D-005) |
| Rust build artifacts | `src-tauri/target/` | `cargo build` | `cargo clean` | No, gitignored |

## Failure modes and observability

| Failure | User-visible behaviour | Detection | Recovery / runbook |
| --- | --- | --- | --- |
| Syntax shader line-wrap mismatch | Editor turns off syntax colors and falls back to plain textarea text | `checkShade()` in `src/app/shade.js` logs warning | Reload page or adjust zoom/font size |
| Live JS runtime error in Stage | Red `error` row in the Console tab with a clickable `file:line`, plus a red notice banner (`JS Error: ...`) | `window.onerror` in `Project.consoleBridge` (D-011) | Click the `file:line` link, fix the script, or switch to Design Mode |
| IndexedDB unavailable (private window) | Error state on Save button; emergency `localStorage` fallback | `openStorage()` in `src/app/persistence.js` | Export project to disk via **Export** |

## Claims vs. code

- None currently known; all documented features are implemented and verified in `test/`.
