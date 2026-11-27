const cssStateBar = document.getElementById('cssStateBar');
const cssStateHint = document.getElementById('cssStateHint');
const cssStateButtons = Array.from(cssStateBar.querySelectorAll('.css-state-btn'));

let activeCssState = '';

function selectedNodeForCss() {
    return selectedPcId ? HtmlAst.findById(currentHtmlAst, selectedPcId) : null;
}

function cssEditSelector(node) {
    if (activeCssTarget === 'inline') return 'inline';
    if (!activeCssState) return activeCssTarget;
    return CssAst.withState(activeCssTarget, activeCssState, node === undefined ? selectedNodeForCss() : node);
}

function sendForceState() {
    if (!stageFrame || !stageFrame.contentWindow) return;
    const state = (stageMode === 'design' && activeCssTarget !== 'inline') ? activeCssState : '';
    try {
        stageFrame.contentWindow.postMessage({ type: 'pc-force-state', state: state }, '*');
    } catch (e) {
    }
}

function refreshCssStateUi(node) {
    if (typeof refreshCssMediaUi === 'function') refreshCssMediaUi();
    const inline = activeCssTarget === 'inline';
    const shownState = inline ? '' : activeCssState;
    cssStateButtons.forEach((btn) => {
        btn.setAttribute('aria-pressed', String(btn.dataset.state === shownState));
        btn.disabled = inline && btn.dataset.state !== '';
    });
    sendForceState();
    if (inline) {
        cssStateHint.textContent = 'Inline styles cannot have states.';
    } else if (!activeCssState) {
        cssStateHint.textContent = '';
    } else {
        const rule = CssAst.findRuleBySelector(currentCssAst, cssEditSelector(node), cssEditMedia());
        cssStateHint.textContent = 'Editing ' + cssEditSelector(node) + (rule ? '' : ' (new rule on first change)') +
            (stageMode === 'design' ? ' · previewing :' + activeCssState + ' on the Stage' : ' · switch to Design mode to preview');
    }
}

function setCssState(state) {
    activeCssState = CssAst.STATES.indexOf(state) !== -1 ? state : '';
    const node = selectedNodeForCss();
    refreshCssStateUi(node);
    populateCssValues(node);
    sendForceState();
}

cssStateButtons.forEach((btn) => btn.addEventListener('click', () => setCssState(btn.dataset.state)));
