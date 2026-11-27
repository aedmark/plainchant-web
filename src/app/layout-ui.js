const cssLayoutGroup = document.getElementById('cssLayoutGroup');
const layoutSelects = {
    'flex-direction': document.getElementById('cssFlexDir'),
    'flex-wrap': document.getElementById('cssFlexWrap'),
    'justify-content': document.getElementById('cssJustify'),
    'align-items': document.getElementById('cssAlign')
};
const LAYOUT_ALIASES = { start: 'flex-start', end: 'flex-end', 'self-start': 'flex-start', 'self-end': 'flex-end' };

function layoutShownValue(prop, value, info) {
    if (!value) return '';
    const alias = LAYOUT_ALIASES[value];
    return alias && !(info.kind === 'grid' && prop !== 'justify-content' && prop !== 'align-items') ? alias : value;
}

function showLayoutInfo(info) {
    const live = Boolean(info && info.display && info.id === selectedPcId && stageMode === 'design');
    cssLayoutGroup.hidden = !live;
    if (!live) return;
    const node = selectedPcId ? HtmlAst.findById(currentHtmlAst, selectedPcId) : null;
    let decls = {};
    if (activeCssTarget === 'inline') decls = node && node.attrs ? CssAst.parseInlineStyle(node.attrs.style || '') : {};
    else if (activeCssTarget) decls = CssAst.getDeclarations(currentCssAst, cssEditSelector(node), cssEditMedia());
    const current = { 'flex-direction': info.direction, 'flex-wrap': info.wrap, 'justify-content': info.justify, 'align-items': info.align };
    Object.keys(layoutSelects).forEach((prop) => {
        const select = layoutSelects[prop];
        select.closest('.insp-field').hidden = info.kind === 'grid' && (prop === 'flex-direction' || prop === 'flex-wrap');
        Array.from(select.options).forEach((o) => { if (o.dataset.temp === '1') o.remove(); });
        const value = layoutShownValue(prop, decls[prop] || '', info);
        if (value && !Array.from(select.options).some((o) => o.value === value)) {
            const opt = new Option(value, value);
            opt.dataset.temp = '1';
            select.add(opt);
        }
        select.value = value;
        select.title = current[prop] ? 'Computed: ' + current[prop] : '';
    });
}

Object.keys(layoutSelects).forEach((prop) => {
    layoutSelects[prop].addEventListener('change', () => applyCssPropertyChange(prop, layoutSelects[prop].value));
});

window.addEventListener('message', (e) => {
    if (e.source !== stageFrame.contentWindow) return;
    const data = e.data || {};
    if (data.type === 'pc-layout-info') {
        showLayoutInfo(data);
    } else if (data.type === 'pc-layout-gap' && data.id === selectedPcId && typeof data.prop === 'string' && Number.isFinite(data.value)) {
        applyCssPropertyChange(data.prop, data.value + 'px');
        populateCssValues(selectedPcId ? HtmlAst.findById(currentHtmlAst, selectedPcId) : null);
        showNotice('Set ' + data.prop + ' to ' + data.value + 'px.');
    }
});
document.querySelectorAll('.mode-btn').forEach((b) => b.addEventListener('click', () => { if (b.dataset.mode !== 'design') cssLayoutGroup.hidden = true; }));
