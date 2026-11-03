let applyingEdit = false;
let tabReleased = false;
let shiftDown = false;
const elementBar = document.querySelector('.element-bar');
const breadcrumbBar = document.getElementById('breadcrumbBar');
const insertBar = document.querySelector('.insert-bar');
const suggestBox = elementBar.querySelector('.suggestions');
const suggestSay = document.getElementById('suggestSay');
let suggestion = null;
let dismissedFor = '';

function caretLine() {
    return editor.value.slice(0, editor.selectionStart).split('\n').length - 1;
}

function applyEdit(edit, options = {}) {
    const before = editor.value;
    const expected = before.slice(0, edit.from) + edit.insert + before.slice(edit.to);
    const previous = document.activeElement;
    applyingEdit = true;
    try {
        if (options.keepFocus) editor.inputMode = 'none';
        editor.focus({ preventScroll: true });
        editor.setSelectionRange(edit.from, edit.to);
        let done = false;
        try { done = document.execCommand('insertText', false, edit.insert); } catch (e) { done = false; }
        if (!done || editor.value !== expected) {
            editor.value = expected;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
        }
        editor.setSelectionRange(edit.selStart, edit.selEnd);
    } finally {
        applyingEdit = false;
        if (options.keepFocus) {
            editor.inputMode = '';
            if (previous && previous !== editor && document.contains(previous)) previous.focus({ preventScroll: true });
        }
    }
    syncBufferFromEditor();
}

function updateBreadcrumbs() {
    if (!breadcrumbBar) return;
    let targetId = selectedPcId;
    if (!targetId && activeTab === 'html') {
        const hit = HtmlAst.nodeAtOffset(currentHtmlAst, editor.selectionStart);
        if (hit) targetId = hit.id;
    }
    const crumbs = DomOutline.breadcrumbs(currentHtmlAst, targetId);
    breadcrumbBar.textContent = '';
    if (!crumbs.length) {
        const span = document.createElement('span');
        span.className = 'crumb-empty';
        span.textContent = activeTab === 'html' ? 'document > body' : activeTab + ' buffer';
        breadcrumbBar.appendChild(span);
        return;
    }
    crumbs.forEach((c, idx) => {
        if (idx > 0) {
            const sep = document.createElement('span');
            sep.className = 'crumb-sep';
            sep.textContent = '›';
            breadcrumbBar.appendChild(sep);
        }
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'crumb-btn' + (c.id === selectedPcId ? ' active' : '');
        btn.dataset.pcId = c.id;
        btn.textContent = '<' + c.label + '>';
        btn.addEventListener('click', () => {
            selectElementById(c.id, { revealCode: true, focusEditor: false });
        });
        breadcrumbBar.appendChild(btn);
    });
}

function insertSnippet(kind) {
    const snippet = Editing.SNIPPETS[kind];
    if (!snippet) return;
    if (activeTab !== 'html') switchFileTab('html');
    const nextHtml = HtmlAst.insertElement(projectFiles.html, selectedPcId, 'inside-end', snippet);
    applyHtmlTransform(nextHtml, selectedPcId);
    showNotice('Inserted <' + kind + '>');
}

function suggestionKey(hit) {
    return activeTab + ':' + caretLine() + ':' + editor.value.slice(hit.from, hit.to);
}

function showSuggestions(hit) {
    suggestion = hit;
    suggestBox.hidden = !hit;
    elementBar.classList.toggle('suggesting', !!hit);
    const labels = hit ? (hit.labels || hit.options) : [];
    suggestSay.textContent = hit ? 'Suggestions: ' + labels.join(', ') : '';
    suggestBox.replaceChildren(...labels.map((label, i) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'suggest-chip';
        chip.dataset.index = String(i);
        chip.textContent = label;
        return chip;
    }));
}

function syncSuggestions() {
    let hit = null;
    if (document.activeElement === editor && editor.selectionStart === editor.selectionEnd) {
        hit = Suggest.at(editor.value, editor.selectionStart, activeTab, projectFiles);
    }
    const key = hit ? suggestionKey(hit) : '';
    if (key !== dismissedFor) dismissedFor = '';
    showSuggestions(hit && key !== dismissedFor ? hit : null);
}

function acceptSuggestion(index) {
    if (!suggestion || !suggestion.options[index]) return;
    applyEdit(Suggest.edit(suggestion, suggestion.options[index]));
    syncElementState();
}

let syncQueued = false;
function syncElementState() {
    syncQueued = false;
    if (activeTab === 'html' && document.activeElement === editor) {
        const node = HtmlAst.nodeAtOffset(currentHtmlAst, editor.selectionStart);
        if (node && node.tag !== 'html' && node.tag !== 'head' && node.id !== selectedPcId) {
            selectedPcId = node.id;
            refreshInspector();
            highlightOnStage(selectedPcId);
        }
    }
    updateBreadcrumbs();
    syncSuggestions();
}

function scheduleSync() {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(syncElementState);
}

insertBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.ins-btn');
    if (btn && btn.dataset.insert) insertSnippet(btn.dataset.insert);
});

suggestBox.addEventListener('mousedown', (e) => e.preventDefault());
suggestBox.addEventListener('click', (e) => {
    const chip = e.target.closest('.suggest-chip');
    if (chip) acceptSuggestion(Number(chip.dataset.index));
});

editor.addEventListener('keydown', (e) => {
    shiftDown = e.shiftKey;
    if (e.isComposing) return;
    if (e.key === 'Escape') {
        if (suggestion) { dismissedFor = suggestionKey(suggestion); syncSuggestions(); }
        else tabReleased = true;
        return;
    }
    if (e.key === 'Tab' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (tabReleased) { tabReleased = false; return; }
        e.preventDefault();
        if (!e.shiftKey) {
            syncSuggestions();
            if (suggestion && suggestion.tab !== false) { acceptSuggestion(0); return; }
            if (settings.indent && activeTab === 'html') {
                const exp = Editing.expandAbbrev(editor.value, editor.selectionStart, activeTab);
                if (exp) { applyEdit(exp); syncElementState(); return; }
            }
        }
        const pos = editor.selectionStart;
        applyEdit({ from: pos, to: editor.selectionEnd, insert: '  ', selStart: pos + 2, selEnd: pos + 2 });
        return;
    }
    if (e.key !== 'Shift') tabReleased = false;
});

editor.addEventListener('keyup', (e) => { shiftDown = e.shiftKey; scheduleSync(); });
editor.addEventListener('blur', () => { tabReleased = false; shiftDown = false; dismissedFor = ''; showSuggestions(null); });
['click', 'focus', 'pointerup'].forEach((name) => editor.addEventListener(name, scheduleSync));

editor.addEventListener('beforeinput', (e) => {
    if (applyingEdit || e.isComposing || !settings.indent) return;
    if (e.inputType !== 'insertLineBreak' && e.inputType !== 'insertParagraph') return;
    if (shiftDown) return;
    const edit = Editing.enter(editor.value, editor.selectionStart, editor.selectionEnd, activeTab);
    if (!edit) return;
    e.preventDefault();
    applyEdit(edit);
    syncElementState();
});

editor.addEventListener('input', () => {
    render(true);
    scheduleSync();
    scheduleAutoSave();
});
