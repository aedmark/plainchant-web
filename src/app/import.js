const importInput = document.getElementById('importInput');
const libImport = document.getElementById('libImport');
const dropHint = document.getElementById('dropHint');

async function importFiles(fileList) {
    const dropped = Array.from(fileList || []);
    const images = dropped.filter((f) => ImageLib.isImage(f.name));
    if (images.length && typeof addImageFiles === 'function') addImageFiles(images);
    const files = dropped.filter((f) => Importing.accept(f.name) && !ImageLib.isImage(f.name));
    if (!files.length) {
        if (!images.length) showNotice('Please choose .html, .css, or .js files.', true);
        return;
    }
    syncBufferFromEditor();
    let importedHtml = false;
    for (const file of files) {
        const buf = await file.arrayBuffer();
        const text = Importing.decode(new Uint8Array(buf));
        const kind = Importing.kindOf(file.name);
        if (kind === 'css') {
            projectFiles.css = text;
            if (activeTab === 'css') editor.value = text;
        } else if (kind === 'js') {
            projectFiles.js = text;
            if (activeTab === 'js') editor.value = text;
        } else {
            const unpacked = Project.unpack(text);
            projectFiles.html = unpacked.html;
            if (unpacked.css && files.length === 1) projectFiles.css = unpacked.css;
            if (unpacked.js && files.length === 1) projectFiles.js = unpacked.js;
            importedHtml = true;
        }
    }
    if (importedHtml) {
        currentScriptId = newId();
        saveProjectAssets();
    }
    editor.value = projectFiles[activeTab] || '';
    saveScript(false);
    render(false);
    closeModal(libraryModal);
    showNotice('Imported ' + files.map((f) => f.name).join(', '));
}

libImport.addEventListener('click', () => importInput.click());
importInput.addEventListener('change', () => {
    if (importInput.files && importInput.files.length) importFiles(importInput.files);
    importInput.value = '';
});

let dragDepth = 0;
window.addEventListener('dragenter', (e) => {
    if (!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes('Files')) return;
    dragDepth++;
    dropHint.hidden = false;
});
window.addEventListener('dragleave', () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) dropHint.hidden = true;
});
window.addEventListener('dragover', (e) => {
    if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) e.preventDefault();
});
window.addEventListener('drop', (e) => {
    dragDepth = 0;
    dropHint.hidden = true;
    if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
    e.preventDefault();
    importFiles(e.dataTransfer.files);
});
