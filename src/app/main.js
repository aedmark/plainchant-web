let startup = null;

async function start() {
    fitToViewport();
    await restoreLastScript();
    render(false);
    syncElementState();
    startSafekeeping();
}

function whenReady() {
    return startup || Promise.resolve();
}

window.addEventListener('DOMContentLoaded', () => { startup = start(); });
