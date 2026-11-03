const shadeLayer = document.createElement('div');
shadeLayer.className = 'editor-shade';
shadeLayer.setAttribute('aria-hidden', 'true');
editor.before(shadeLayer);

let shadeBase = [];
let shadeKeys = [];
let shadeText = null;
let shadeLang = null;
let shadeBroken = false;
let highlightedLines = [-1, -1];

function shadeLine(line, last) {
    const el = document.createElement('span');
    el.className = 'sh-' + line.kind;
    line.runs.forEach((r, i) => {
        let text = r.text;
        if (i === line.runs.length - 1) text += (line.runs.some((x) => x.text) ? '' : '\u200b') + (last ? '' : '\n');
        if (!r.mark) { el.appendChild(document.createTextNode(text)); return; }
        const m = el.appendChild(document.createElement('span'));
        m.className = 'sh-' + r.mark;
        m.textContent = text;
    });
    return el;
}

function lineKey(line) {
    return line.kind + '\u0001' + line.runs.map((r) => (r.mark || '') + '\u0002' + r.text).join('\u0003');
}

function drawShade() {
    if (shadeBroken || !settings.colours) return;
    try {
        const text = editor.value;
        if (shadeLang !== activeTab) shadeKeys = [];
        shadeBase = CodeShade.shade(text, activeTab);
        shadeText = text;
        shadeLang = activeTab;
        paintShade();
    } catch (e) {
        stopShade('the syntax colours could not be drawn', e);
    }
}

function paintShade() {
    if (shadeBroken || !settings.colours || !shadeBase.length) return;
    const lines = shadeBase.slice();
    const keys = lines.map(lineKey);
    keys[keys.length - 1] += '\u0004';
    let head = 0;
    while (head < keys.length && head < shadeKeys.length && keys[head] === shadeKeys[head]) head++;
    let tail = 0;
    while (tail < keys.length - head && tail < shadeKeys.length - head &&
        keys[keys.length - 1 - tail] === shadeKeys[shadeKeys.length - 1 - tail]) tail++;
    const old = shadeLayer.children;
    for (let k = shadeKeys.length - tail - 1; k >= head; k--) old[k].remove();
    const fresh = document.createDocumentFragment();
    for (let k = head; k < keys.length - tail; k++) fresh.appendChild(shadeLine(lines[k], k === keys.length - 1));
    shadeLayer.insertBefore(fresh, old[head] || null);
    shadeKeys = keys;
    applyLineHighlightClasses();
    placeShade();
    checkShade();
}

function highlightCodeRange(fromOffset, toOffset) {
    if (typeof fromOffset !== 'number' || fromOffset < 0 || (activeTab !== 'html' && activeTab !== 'css')) {
        highlightedLines = [-1, -1];
        applyLineHighlightClasses();
        return;
    }
    const text = editor.value;
    const startLine = text.slice(0, fromOffset).split('\n').length - 1;
    const endLine = text.slice(0, Math.max(fromOffset, toOffset)).split('\n').length - 1;
    highlightedLines = [startLine, endLine];
    applyLineHighlightClasses();
}

function applyLineHighlightClasses() {
    const children = shadeLayer.children;
    const [sLine, eLine] = highlightedLines;
    for (let i = 0; i < children.length; i++) {
        const active = sLine !== -1 && i >= sLine && i <= eLine;
        children[i].classList.toggle('sh-selected-line', active);
    }
}

function placeShade() {
    if (shadeBroken || shadeText === null || editor.offsetParent === null) return;
    copyEditorType(shadeLayer);
    Object.assign(shadeLayer.style, { top: editor.offsetTop + 'px', left: editor.offsetLeft + 'px', height: editor.clientHeight + 'px' });
    shadeLayer.scrollTop = editor.scrollTop;
    document.body.classList.add('shaded');
}

function checkShade() {
    if (shadeText === null || editor.offsetParent === null || editor.scrollHeight <= editor.clientHeight + 1) return;
    const cs = getComputedStyle(editor);
    const padTop = parseFloat(cs.paddingTop), padBottom = parseFloat(cs.paddingBottom);
    const layer = getComputedStyle(shadeLayer);
    const textHeight = shadeLayer.scrollHeight - parseFloat(layer.paddingTop) - parseFloat(layer.paddingBottom) -
        (parseFloat(getComputedStyle(shadeLayer, '::after').height) || 0);
    const rest = editor.scrollHeight - padTop - textHeight;
    if (Math.abs(rest - padBottom) > 4 && Math.abs(rest) > 4) stopShade('the syntax colours wrap differently from the editor', rest - padBottom);
}

function setShadeOn(on) {
    if (on) { drawShade(); return; }
    document.body.classList.remove('shaded');
    shadeLayer.textContent = '';
    shadeBase = [];
    shadeKeys = [];
    shadeText = null;
}

function stopShade(why, detail) {
    shadeBroken = true;
    document.body.classList.remove('shaded');
    shadeLayer.textContent = '';
    shadeKeys = [];
    shadeText = null;
    console.warn('Plainchant Web: ' + why + ', so they are off until reload.', detail);
}

editor.addEventListener('scroll', () => { shadeLayer.scrollTop = editor.scrollTop; });
if (typeof ResizeObserver === 'function') new ResizeObserver(() => { placeShade(); checkShade(); }).observe(editor);
window.addEventListener('resize', placeShade);
