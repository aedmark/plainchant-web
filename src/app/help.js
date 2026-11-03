const helpModal = document.getElementById('help-modal');
const helpBtn = document.getElementById('helpBtn');
const helpLoadStarter = document.getElementById('helpLoadStarter');

function openHelp() {
    openModal(helpModal);
}

helpBtn.addEventListener('click', openHelp);
helpLoadStarter.addEventListener('click', () => {
    loadStarterProject();
    closeModal(helpModal);
    showNotice('Loaded starter landing page project.');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'F1' || ((e.ctrlKey || e.metaKey) && e.key === '/')) {
        e.preventDefault();
        openHelp();
    }
});
