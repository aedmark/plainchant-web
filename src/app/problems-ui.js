const inspProblemsPane = document.getElementById('inspProblemsPane');
const problemsList = document.getElementById('problemsList');
const problemsSummary = document.getElementById('problemsSummary');
const problemsCountBadge = document.getElementById('problemsCountBadge');
const linkChecker = Links.createChecker();
let problemsTimer = null;
let problemsResult = { problems: [], errors: 0, warnings: 0 };

function knownProjectPaths() {
    const tree = Array.isArray(projectFiles.tree) ? projectFiles.tree.filter((i) => i.kind === 'file').map((i) => i.path) : [];
    return tree.concat(Object.keys(typeof projectAssets === 'object' ? projectAssets : {}));
}

function runProblemsCheck() {
    clearTimeout(problemsTimer);
    problemsTimer = null;
    ensureEntries();
    const entries = Object.assign({}, projectFiles.entries);
    if (activeFile in entries) entries[activeFile] = editor.value;
    problemsResult = linkChecker.check(entries, knownProjectPaths());
    renderProblems();
}

function scheduleProblemsCheck() {
    clearTimeout(problemsTimer);
    problemsTimer = setTimeout(runProblemsCheck, 500);
}

function jumpToProblem(problem) {
    if (panesShown() === 'preview') setPanes('both');
    openFileInEditor(problem.file);
    editor.focus({ preventScroll: true });
    editor.setSelectionRange(problem.start, problem.end);
    editor.scrollTop = Math.max(0, textTopIn(editor.value, problem.start) - editor.clientHeight / 3);
    shadeLayer.scrollTop = editor.scrollTop;
}

function renderProblems() {
    const { problems, errors, warnings } = problemsResult;
    problemsCountBadge.hidden = problems.length === 0;
    problemsCountBadge.textContent = String(problems.length);
    problemsCountBadge.classList.toggle('has-error', errors > 0);
    if (inspProblemsPane.hidden) return;
    problemsSummary.textContent = problems.length
        ? errors + (errors === 1 ? ' error' : ' errors') + ', ' + warnings + (warnings === 1 ? ' warning' : ' warnings')
        : 'No broken links or missing files found.';
    problemsList.textContent = '';
    problems.forEach((p) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'console-row problem-row problem-' + p.severity;
        const level = document.createElement('span');
        level.className = 'console-level';
        level.textContent = p.severity === 'error' ? 'error' : 'warn';
        const msg = document.createElement('span');
        msg.className = 'console-msg';
        msg.textContent = p.message;
        const where = document.createElement('span');
        where.className = 'console-src';
        where.textContent = p.file + ':' + p.line;
        row.title = 'Jump to ' + p.file + ' line ' + p.line;
        row.append(level, msg, where);
        row.addEventListener('click', () => jumpToProblem(p));
        problemsList.appendChild(row);
    });
}

document.getElementById('problemsRecheckBtn').addEventListener('click', runProblemsCheck);
