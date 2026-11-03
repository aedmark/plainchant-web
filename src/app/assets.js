const ASSET_MAX_FILE_BYTES = 25 * 1024 * 1024;
const ASSET_MAX_TOTAL_BYTES = 200 * 1024 * 1024;

let projectAssets = {};
let projectAssetUrls = {};

function releaseProjectAssets() {
    Object.keys(projectAssetUrls).forEach((p) => URL.revokeObjectURL(projectAssetUrls[p]));
    projectAssets = {};
    projectAssetUrls = {};
}

function setProjectAssets(files) {
    releaseProjectAssets();
    Object.keys(files || {}).forEach((path) => {
        const blob = files[path];
        const typed = blob.type ? blob : new Blob([blob], { type: Project.mimeFor(path) });
        projectAssets[path] = typed;
        projectAssetUrls[path] = URL.createObjectURL(typed);
    });
}

function adoptProjectAssets(provided) {
    if (provided) {
        setProjectAssets(provided);
        return;
    }
    releaseProjectAssets();
    if (storageMode !== 'idb') return;
    const id = currentScriptId;
    Store.loadAssets(scriptDb, id).then((files) => {
        if (id !== currentScriptId || !Object.keys(files).length) return;
        setProjectAssets(files);
        drawStageNow();
    }).catch(() => {});
}

function saveProjectAssets() {
    if (storageMode !== 'idb') return;
    const files = projectAssets;
    track(Store.putAssets(scriptDb, currentScriptId, files).catch((e) => { console.error('Asset save error:', e); }));
}
