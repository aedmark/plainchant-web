# Security

Security model, trust boundaries, and known limitations for Plainchant Web.

## Threat model & trust boundaries

Plainchant Web is a local web and desktop application (Tauri v2 + Rust backend) that opens, previews, and exports user-authored or third-party HTML/CSS/JS project folders.

### Trust boundaries

1. **Untrusted Project Files vs. Studio Shell**:
   - Users may open downloaded or third-party HTML/CSS/JS folders.
   - Untrusted project markup and scripts are rendered inside the `#stageFrame` iframe (`sandbox="allow-scripts allow-same-origin"`), separate from the parent [`app.html`](../app.html) window.
2. **Design Mode Script Stripping (`D-003`)**:
   - When `designMode` is enabled (the default in Split and Design views), [`Project.assemblePreview`](../src/project.js) strips all user `<script>` tags from the HTML before injecting the studio bridge script (`src/app/stage.js`).
   - User scripts only run when the user explicitly switches the Stage to **Live JS** mode.
3. **Localhost Asset Server Path Traversal Protection (`D-006`)**:
   - [`src-tauri/src/main.rs`](../src-tauri/src/main.rs) runs an HTTP server bound strictly to `127.0.0.1:0` (loopback only, ephemeral port).
   - Every incoming request path is percent-decoded, stripped of query strings, and checked to reject `..` (`Component::ParentDir`) and root/prefix components before joining with the active project root directory.
4. **Isolated Studio Workspace (`D-006`)**:
   - Opening a local directory via `open_project_folder` reads text files into memory and sets the asset server root, but **never** automatically writes back to disk during editing. Disk writes occur only when the user explicitly triggers **Export** (`save_project_folder` in [`src-tauri/src/main.rs`](../src-tauri/src/main.rs)).

5. **Opt-in Network Preview Server (`D-029`)**:
   - [`src-tauri/src/preview.rs`](../src-tauri/src/preview.rs) runs only after the user presses **Start sharing** in the Preview dialog. It binds `0.0.0.0` on an ephemeral port, serves read-only `GET`/`HEAD`, and answers only under `/<token>/`, where the token is 128 random bits; any other path or token gets `404`.
   - It serves the Studio working copy held in memory (including unsaved text and added images), plus non-text files from the linked folder. Paths are checked with `is_safe_relative`, so `..`, absolute paths, and encoded variants are refused.
   - Traffic is plain HTTP, so anyone on the same network who has the link can read the project. The dialog says so. **Stop sharing** or quitting the app ends the listener and clears the content. The always-on asset server in item 3 stays on loopback.

6. **Vendored Third-Party Code (`D-034`)**:
   - [`src/vendor/prism/prism.js`](../src/vendor/prism/prism.js) is an unmodified copy of Prism 1.30.0 that runs in the Studio window. It only tokenizes text; its HTML output is never used (a test enforces this), and the coloured copy is built with `textContent`, so file text cannot inject markup. Its regexes can be slow on adversarial input, so files over 150,000 characters are not coloured.

## Secrets & configuration

- Plainchant Web requires no API keys, cloud credentials, or external services. The only network listeners are the loopback asset server and the opt-in preview server above.
- Never commit `.env` files, private keys, or user project exports into the repository.

## Reporting

Report security issues by opening a private security advisory on the GitHub repository (`https://github.com/aedmark/plainchant-web`).
