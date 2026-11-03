const exportModal = document.getElementById('export-modal');
const copyBtn = document.getElementById('copyBtn');

function slugifyTitle(title) {
    return String(title || 'project')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'project';
}

function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyText(text, label) {
    try {
        await navigator.clipboard.writeText(text);
        showNotice('Copied ' + (label || 'to clipboard') + '.');
        return true;
    } catch (e) {
        showNotice('Could not copy to clipboard.', true);
        return false;
    }
}

document.getElementById('exportBtn').addEventListener('click', () => {
    syncBufferFromEditor();
    openModal(exportModal);
});

document.getElementById('exportBundleBtn').addEventListener('click', () => {
    syncBufferFromEditor();
    const title = Project.extractTitle(projectFiles);
    const bundled = Project.exportSingleHtml(projectFiles);
    downloadFile(slugifyTitle(title) + '.html', bundled, 'text/html;charset=utf-8');
    showNotice('Downloaded standalone HTML.');
});

document.getElementById('copyBundleBtn').addEventListener('click', () => {
    syncBufferFromEditor();
    copyText(Project.exportSingleHtml(projectFiles), 'bundled HTML');
});

document.getElementById('exportHtmlBtn').addEventListener('click', () => {
    syncBufferFromEditor();
    downloadFile('index.html', projectFiles.html, 'text/html;charset=utf-8');
});

document.getElementById('exportCssBtn').addEventListener('click', () => {
    syncBufferFromEditor();
    downloadFile('styles.css', projectFiles.css, 'text/css;charset=utf-8');
});

document.getElementById('exportJsBtn').addEventListener('click', () => {
    syncBufferFromEditor();
    downloadFile('script.js', projectFiles.js, 'text/javascript;charset=utf-8');
});

copyBtn.addEventListener('click', () => {
    syncBufferFromEditor();
    copyText(editor.value, activeTab + ' source');
});
