const folderBtn = document.getElementById('folderBtn');
const exportFolderBtn = document.getElementById('exportFolderBtn');
const fileBar = document.getElementById('file-bar');
const fileBarText = document.getElementById('fileBarText');
const fileSyncNowBtn = document.getElementById('fileSyncNowBtn');
const fileUnlinkBtn = document.getElementById('fileUnlinkBtn');

let linkedFolder = null;

function hasTauri() {
    return Boolean(window.__TAURI_INTERNALS__ || window.__TAURI__);
}

function tauriInvoke(cmd, args) {
    if (window.__TAURI__ && window.__TAURI__.core && typeof window.__TAURI__.core.invoke === 'function') {
        return window.__TAURI__.core.invoke(cmd, args);
    }
    if (window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__.invoke === 'function') {
        return window.__TAURI_INTERNALS__.invoke(cmd, args);
    }
    return Promise.reject(new Error('Tauri runtime not available'));
}

function updateFolderBar() {
    if (!linkedFolder) {
        fileBar.hidden = true;
        if (explorerTitle) explorerTitle.textContent = 'Project Files';
        return;
    }
    fileBar.hidden = false;
    const shortName = String(linkedFolder.name || '').split(/[\\/]/).filter(Boolean).pop() || linkedFolder.name;
    if (explorerTitle) explorerTitle.textContent = shortName;
    fileBarText.textContent = 'Folder: ' + linkedFolder.name + ' (' + Object.keys(projectFiles.entries || {}).length + ' editable files)';
}

async function scanBrowserDir(dirHandle, prefix, files, tree, depth) {
    if (depth > 5) return;
    const IGNORED = new Set(['.git', 'node_modules', 'target', '.venv', 'venv', '.idea', '.vscode', 'dist']);
    const entries = [];
    for await (const [name, handle] of dirHandle.entries()) {
        if (name.startsWith('.') || IGNORED.has(name)) continue;
        entries.push([name, handle]);
    }
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    for (const [name, handle] of entries) {
        const relPath = prefix ? prefix + '/' + name : name;
        if (handle.kind === 'directory') {
            tree.push({ path: relPath, kind: 'dir', is_text: false });
            await scanBrowserDir(handle, relPath, files, tree, depth + 1);
        } else if (handle.kind === 'file') {
            const isText = Importing.accept(name) || /\.(svg|md|xml|webmanifest)$/i.test(name);
            if (isText) {
                try {
                    const file = await handle.getFile();
                    if (file.size <= 2 * 1024 * 1024) {
                        files[relPath] = await file.text();
                    }
                } catch (e) {
                }
            }
            tree.push({ path: relPath, kind: 'file', is_text: isText });
        }
    }
}

async function openProjectFolder() {
    if (hasTauri()) {
        try {
            const res = await tauriInvoke('open_project_folder', {});
            if (!res || !res.path) return;
            linkedFolder = {
                kind: 'Tauri disk',
                name: res.path,
                path: res.path,
                baseUrl: res.base_url || ''
            };
            loadProjectIntoEditor(
                { entries: res.files || {}, tree: res.tree || [] },
                { baseUrl: res.base_url || '' }
            );
            if (fileExplorer) {
                fileExplorer.hidden = false;
                if (toggleExplorerBtn) toggleExplorerBtn.setAttribute('aria-pressed', 'true');
            }
            updateFolderBar();
            saveScript(false);
            render(false);
            showNotice('Opened folder: ' + res.path + ' (' + Object.keys(res.files || {}).length + ' files)');
        } catch (err) {
            showNotice('Folder open failed: ' + (err.message || err), true);
        }
        return;
    }

    if (typeof window.showDirectoryPicker === 'function') {
        try {
            const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
            const files = {};
            const tree = [];
            await scanBrowserDir(dirHandle, '', files, tree, 0);
            linkedFolder = { kind: 'Browser Directory', name: dirHandle.name, handle: dirHandle };
            loadProjectIntoEditor({ entries: files, tree: tree }, { baseUrl: '' });
            if (fileExplorer) {
                fileExplorer.hidden = false;
                if (toggleExplorerBtn) toggleExplorerBtn.setAttribute('aria-pressed', 'true');
            }
            updateFolderBar();
            saveScript(false);
            render(false);
            showNotice('Opened folder: ' + dirHandle.name + ' (' + Object.keys(files).length + ' files)');
        } catch (err) {
            if (err && err.name !== 'AbortError') {
                showNotice('Could not open folder: ' + err.message, true);
            }
        }
        return;
    }

    showNotice('Direct folder access requires the Tauri Desktop app or a Chromium browser.', true);
}

async function writeLinkedFolder(silent = false) {
    if (!linkedFolder) {
        if (!silent) await openProjectFolder();
        return;
    }
    syncBufferFromEditor();
    if (linkedFolder.kind === 'Tauri disk' && hasTauri()) {
        try {
            await tauriInvoke('save_project_folder', {
                path: linkedFolder.path,
                files: projectFiles.entries
            });
            if (!silent) showNotice('Saved all project files to ' + linkedFolder.path);
        } catch (err) {
            if (!silent) showNotice('Disk write failed: ' + (err.message || err), true);
        }
        return;
    }
    if (linkedFolder.handle) {
        try {
            for (const [relPath, content] of Object.entries(projectFiles.entries || {})) {
                if (relPath.includes('/')) continue;
                const fh = await linkedFolder.handle.getFileHandle(relPath, { create: true });
                const writable = await fh.createWritable();
                await writable.write(content || '');
                await writable.close();
            }
            if (!silent) showNotice('Saved files to ' + linkedFolder.name);
        } catch (err) {
            if (!silent) showNotice('Could not write to folder: ' + err.message, true);
        }
    }
}

function syncLinkedFolderAuto() {
    if (linkedFolder) writeLinkedFolder(true);
}

folderBtn.addEventListener('click', openProjectFolder);
exportFolderBtn.addEventListener('click', () => writeLinkedFolder(false));
fileSyncNowBtn.addEventListener('click', () => writeLinkedFolder(false));
fileUnlinkBtn.addEventListener('click', () => {
    linkedFolder = null;
    projectBaseUrl = '';
    updateFolderBar();
    render(false);
    showNotice('Unlinked local folder.');
});
