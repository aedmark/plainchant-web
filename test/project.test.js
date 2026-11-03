test('project: pack, unpack, assemblePreview, and exportSingleHtml preserve multi-file structure', () => {
    const start = Project.starter();
    const packed = Project.pack(start);
    const unpacked = Project.unpack(packed);
    assert.equal(unpacked.html, start.html);
    assert.equal(unpacked.css, start.css);
    assert.equal(unpacked.js, start.js);

    const designDoc = Project.assemblePreview(start, { liveJs: false, bridgeScript: 'window.__BRIDGE = 1;' });
    assert.includes(designDoc, 'id="pc-project-css"');
    assert.includes(designDoc, 'data-pc-id="');
    assert.includes(designDoc, 'window.__BRIDGE = 1;');
    assert.ok(!designDoc.includes('id="pc-project-js"'), 'user JS disabled in Design mode');

    const liveDoc = Project.assemblePreview(start, { liveJs: true });
    assert.includes(liveDoc, 'id="pc-project-js"');

    const bundled = Project.exportSingleHtml(start);
    assert.includes(bundled, '<style>');
    assert.includes(bundled, '<script>');
    assert.ok(!bundled.includes('href="styles.css"'), 'external stylesheet link replaced by inline style');
});

test('project: resolves linked style.css, multi-file entries, and baseUrl for real folders like portfolio', () => {
    const portfolioWorkspace = {
        entries: {
            'index.html': '<!DOCTYPE html><html><head><link rel="stylesheet" href="style.css"></head><body><h1>Portfolio</h1></body></html>',
            'resume.html': '<!DOCTYPE html><html><head><link rel="stylesheet" href="style.css"></head><body><h1>Resume</h1></body></html>',
            'style.css': 'body { background: #123456; }',
            'styles.css': '',
            'script.js': 'console.log("loaded");'
        }
    };
    assert.equal(Project.primaryCssFile(portfolioWorkspace, 'index.html'), 'style.css');
    const preview = Project.assemblePreview(portfolioWorkspace, {
        activeHtml: 'resume.html',
        baseUrl: 'http://127.0.0.1:45678/',
        liveJs: false
    });
    assert.includes(preview, '<base href="http://127.0.0.1:45678/">');
    assert.includes(preview, 'background: #123456;');
    assert.includes(preview, '>Resume</h1>');
});

test('dom-outline: builds hierarchical DOM tree and ancestor breadcrumbs', () => {
    const html = '<html><body><main id="app"><section class="hero"><h1 class="title">Welcome</h1></section></main></body></html>';
    const ast = HtmlAst.parse(html);
    const h1 = ast.elements.find((e) => e.tag === 'h1');
    const crumbs = DomOutline.breadcrumbs(ast, h1.id);
    assert.deepEqual(crumbs.map((c) => c.label), ['body', 'main#app', 'section.hero', 'h1.title']);

    const tree = DomOutline.build(ast);
    assert.equal(tree.length, 3);
    assert.equal(tree[2].label, 'h1.title');
    assert.equal(tree[2].depth, 2);
});

test('editing & code-shade: expands HTML abbreviations on Tab, indents between tags on Enter, and shades HTML/CSS/JS', () => {
    const exp = Editing.expandAbbrev('  section#intro.hero', 20, 'html');
    assert.ok(exp, 'expanded section#intro.hero');
    assert.equal(exp.insert, '<section id="intro" class="hero"></section>');

    const ent = Editing.enter('  <div></div>', 7, 7, 'html');
    assert.ok(ent, 'smart enter between opening and closing tags');
    assert.equal(ent.insert, '\n    \n  ');

    const shadedHtml = CodeShade.shade('<div class="box">Hello</div>', 'html');
    assert.equal(shadedHtml.length, 1);
    assert.equal(shadedHtml[0].kind, 'html');
    assert.ok(shadedHtml[0].runs.some((r) => r.mark === 'tag'), 'shaded tag');
    assert.ok(shadedHtml[0].runs.some((r) => r.mark === 'attr'), 'shaded attr');
    assert.ok(shadedHtml[0].runs.some((r) => r.mark === 'string'), 'shaded string');
});

test('project: Live JS preview injects the console bridge first and maps error lines to project files', () => {
    const files = {
        entries: {
            'index.html': '<html>\n<head></head>\n<body>\n  <script src="app.js"></script>\n</body></html>',
            'app.js': 'var a = 1;\nconsole.log(a);\nthrow new Error("boom");'
        }
    };
    const live = Project.assemblePreview(files, { liveJs: true });
    assert.ok(live.indexOf('id="pc-console-bridge"') < live.indexOf('id="pc-project-js"'), 'bridge runs before user JS');
    assert.excludes(live, 'pc-runtime-error');
    const map = JSON.parse(live.match(/\)\((\[\{.*?\}\])\);/)[1]);
    assert.equal(map.length, 1);
    assert.equal(map[0].file, 'app.js');
    assert.equal(live.split('\n')[map[0].first - 1], 'var a = 1;', 'first mapped line is the first line of the file');
    assert.equal(map[0].lines, 3);

    const design = Project.assemblePreview(files, { liveJs: false });
    assert.excludes(design, 'pc-console-bridge');
});

test('project: console bridge forwards console calls, errors with file lines, and rejections', () => {
    const vm = require('vm');
    const sent = [];
    const listeners = {};
    const logged = [];
    const win = {
        console: { log: (x) => logged.push(x), info() {}, warn() {}, error() {} },
        parent: { postMessage: (m) => sent.push(m) },
        addEventListener: (t, fn) => { listeners[t] = fn; }
    };
    win.window = win;
    vm.createContext(win);
    vm.runInContext('(' + Project.consoleBridge.toString() + ')([{ file: "app.js", first: 10, lines: 3 }]);', win);

    const circular = { n: 1 };
    circular.self = circular;
    win.console.log('hi', 5, { a: [1, 'x'] }, circular, undefined);
    assert.deepEqual(logged, ['hi'], 'original console.log still runs');
    assert.equal(sent[0].type, 'pc-console');
    assert.equal(sent[0].level, 'log');
    assert.deepEqual(sent[0].args, ['hi', '5', '{a: [1, "x"]}', '{n: 1, self: [Circular]}', 'undefined']);

    win.onerror('Uncaught Error: boom', '', 12, 1, { name: 'Error', message: 'boom' });
    assert.equal(sent[1].level, 'error');
    assert.deepEqual(sent[1].args, ['Error: boom']);
    assert.equal(sent[1].line, 3);
    assert.equal(sent[1].source, 'app.js');

    win.onerror('x', '', 99, 1, null);
    assert.equal(sent[2].source, null, 'lines outside a project script have no source');

    listeners.unhandledrejection({ reason: 'nope' });
    assert.equal(sent[3].level, 'error');
    assert.includes(sent[3].args[0], 'nope');
});
