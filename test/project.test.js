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

test('project: resolveRelativePath normalizes project links and ignores external or same-page ones', () => {
    const r = Project.resolveRelativePath;
    assert.equal(r('index.html', 'resume.html'), 'resume.html');
    assert.equal(r('index.html', './resume.html'), 'resume.html');
    assert.equal(r('index.html', 'sub/page.html#section'), 'sub/page.html');
    assert.equal(r('index.html', 'gallery.html?x=1'), 'gallery.html');
    assert.equal(r('sub/page.html', '../index.html'), 'index.html');
    assert.equal(r('sub/page.html', 'other.html'), 'sub/other.html');
    assert.equal(r('sub/page.html', '/resume.html'), 'resume.html');
    assert.equal(r('index.html', 'my%20page.html'), 'my page.html');
    assert.equal(r('index.html', 'sub/'), 'sub/index.html');
    assert.equal(r('a/b/c.html', '../../d/e.html'), 'd/e.html');
    assert.equal(r('index.html', '../outside.html'), null, 'cannot climb above the project root');
    ['https://example.com/a.html', 'http://x.test', 'mailto:a@b.test', 'tel:+15550100', 'javascript:void(0)', 'data:text/html,hi', '//cdn.test/x.html', '#top', '', '   ', null, undefined].forEach((href) => {
        assert.equal(r('index.html', href), null, String(href) + ' is not a project path');
    });
});

test('project: rewriteAssetUrls points relative asset references at blob URLs and leaves everything else alone', () => {
    const urls = { 'images/hero.png': 'blob:H', 'img/a b.png': 'blob:AB', 'fonts/x.woff2': 'blob:F', 'sub/pic.jpg': 'blob:P' };
    const html = [
        '<img src="images/hero.png" alt="x">',
        '<img src=\'./images/hero.png?v=2\'>',
        '<img srcset="images/hero.png 1x, missing.png 2x">',
        '<video poster="img/a%20b.png"></video>',
        '<a href="images/hero.png">link</a>',
        '<img src="https://example.com/images/hero.png">',
        '<div style="background:url(images/hero.png)"></div>',
        '<p>src="images/hero.png" in text</p>'
    ].join('\n');
    const out = Project.rewriteAssetUrls(html, 'index.html', urls);
    assert.includes(out, '<img src="blob:H" alt="x">');
    assert.includes(out, '<img src="blob:H">');
    assert.includes(out, 'srcset="blob:H 1x, missing.png 2x"');
    assert.includes(out, 'poster="blob:AB"');
    assert.includes(out, '<a href="images/hero.png">', 'anchor hrefs are not rewritten');
    assert.includes(out, 'src="https://example.com/images/hero.png"');
    assert.includes(out, 'url("blob:H")');
    assert.includes(out, '<p>src="images/hero.png" in text</p>', 'text outside tags is untouched');
    assert.equal(Project.rewriteAssetUrls('<img src="pic.jpg">', 'sub/page.html', urls), '<img src="blob:P">');
});

test('project: assemblePreview rewrites stylesheet urls relative to the stylesheet and mimeFor names types', () => {
    const files = { entries: {
        'index.html': '<html><head><link rel="stylesheet" href="css/site.css"></head><body><img src="images/hero.png"></body></html>',
        'css/site.css': 'body { background: url(../images/hero.png); } @font-face { src: url("../fonts/x.woff2"); }'
    } };
    const urls = { 'images/hero.png': 'blob:H', 'fonts/x.woff2': 'blob:F' };
    const doc = Project.assemblePreview(files, { liveJs: false, assetUrls: urls });
    assert.includes(doc, '<img src="blob:H"');
    assert.includes(doc, 'url("blob:H")');
    assert.includes(doc, 'url("blob:F")');
    assert.excludes(doc, '../images/hero.png');
    const plain = Project.assemblePreview(files, { liveJs: false });
    assert.includes(plain, 'src="images/hero.png"', 'without assetUrls the preview is unchanged');
    assert.equal(Project.mimeFor('a/b/Photo.JPG'), 'image/jpeg');
    assert.equal(Project.mimeFor('f.woff2'), 'font/woff2');
    assert.equal(Project.mimeFor('x.unknown'), 'application/octet-stream');
});

test('parts: find, scan, sync, and pull keep marker regions in step with their part files', () => {
    const header = '<header>\n  <nav>Home</nav>\n</header>';
    const page = (body) => '<html><body>\n  ' + Parts.wrap('parts/header.html', body, '  ') + '\n  <main>x</main>\n</body></html>';
    const entries = {
        'index.html': page(header),
        'about.html': page('<header>OLD</header>'),
        'sub/deep.html': '<html><body>' + Parts.wrap('../parts/header.html', header, '') + '</body></html>',
        'lost.html': '<body><!-- pc:part src="parts/nope.html" -->x<!-- /pc:part --></body>',
        'parts/header.html': header + '\n'
    };
    const info = Parts.scan(entries);
    const state = (page) => info.regions.find((r) => r.page === page).state;
    assert.equal(state('index.html'), 'synced');
    assert.equal(state('about.html'), 'differs');
    assert.equal(state('sub/deep.html'), 'synced', 'relative src resolves from the page folder');
    assert.equal(state('lost.html'), 'missing');
    assert.equal(info.parts['parts/header.html'], 3);
    assert.ok(Parts.isPart(entries, 'parts/header.html'));
    assert.ok(!Parts.isPart(entries, 'index.html'));

    const synced = Parts.sync(entries, { part: 'parts/header.html' });
    assert.deepEqual(synced.changed, ['about.html']);
    assert.equal(synced.entries['about.html'], entries['index.html'], 'region is replaced and the marker indentation is kept');
    assert.equal(synced.entries['index.html'], entries['index.html'], 'synced pages are untouched');
    assert.includes(synced.entries['about.html'], '\n  <main>x</main>');
    assert.includes(synced.entries['about.html'], '-->\n  <header>', 'the first line keeps the region indentation');

    const edited = Object.assign({}, entries, { 'parts/header.html': '<header>NEW</header>\n' });
    const all = Parts.sync(edited, { part: 'parts/header.html' });
    assert.deepEqual(all.changed.sort(), ['about.html', 'index.html', 'sub/deep.html']);
    assert.includes(all.entries['sub/deep.html'], '<header>NEW</header>');
    assert.equal(Parts.scan(all.entries).regions.filter((r) => r.state === 'differs').length, 0);

    const pulled = Parts.pull(entries, 'about.html', 0);
    assert.equal(pulled.entries['parts/header.html'], '<header>OLD</header>\n');
    assert.includes(pulled.entries['index.html'], '<header>OLD</header>', 'pulling a region updates every other page');
    assert.equal(Parts.relPath('sub/deep.html', 'parts/header.html'), '../parts/header.html');
    assert.equal(Parts.relPath('index.html', 'parts/header.html'), 'parts/header.html');
});

test('parts: nested, unclosed, and stray markers are reported and never rewritten', () => {
    const nested = '<!-- pc:part src="a.html" --><!-- pc:part src="b.html" -->x<!-- /pc:part -->';
    const res = Parts.find(nested);
    assert.equal(res.regions.length, 1);
    assert.equal(res.regions[0].src, 'b.html');
    assert.equal(res.invalid.length, 1);
    assert.equal(Parts.find('<!-- pc:part src="a.html" -->never closed').invalid.length, 1);
    assert.equal(Parts.find('stray <!-- /pc:part -->').invalid.length, 1);
    assert.equal(Parts.sync({ 'a.html': '<!-- pc:part src="b.html" -->x', 'b.html': 'y' }, null).changed.length, 0);
});

test('finding: search, navigation, and replacement helpers use exact offsets', () => {
    const text = 'Foo foo FOO\nfoo';
    assert.deepEqual(Finding.findAll(text, 'foo').map((m) => m.start), [0, 4, 8, 12]);
    assert.deepEqual(Finding.findAll(text, 'foo', { caseSensitive: true }).map((m) => m.start), [4, 12]);
    assert.deepEqual(Finding.findAll(text, ''), []);
    assert.deepEqual(Finding.findAll('a.b a+b (a)', 'a.b').map((m) => m.start), [0], 'regex characters are literal');
    assert.deepEqual(Finding.findAll('aaa', 'aa').map((m) => m.start), [0], 'matches do not overlap');
    assert.deepEqual(Finding.findAll('x$&y', '$&').map((m) => m.start), [1]);

    const matches = Finding.findAll(text, 'foo');
    assert.equal(Finding.nearest(matches, 0), 0);
    assert.equal(Finding.nearest(matches, 5), 2);
    assert.equal(Finding.nearest(matches, 13), 0, 'wraps to the first match');
    assert.equal(Finding.nearest([], 3), -1);
    assert.equal(Finding.step(matches, 3, 1), 0);
    assert.equal(Finding.step(matches, 0, -1), 3);
    assert.equal(Finding.step(matches, -1, -1), 3);
    assert.equal(Finding.step([], -1, 1), -1);

    const one = Finding.replaceAt(text, matches[1], 'bar');
    assert.equal(one.text, 'Foo bar FOO\nfoo');
    assert.equal(one.caret, 7);
    const all = Finding.replaceAll(text, 'foo', '$1-baz');
    assert.equal(all.text, '$1-baz $1-baz $1-baz\n$1-baz', 'replacement text is literal');
    assert.equal(all.count, 4);
    assert.deepEqual(Finding.replaceAll('abc', 'x', 'y'), { text: 'abc', count: 0 });
    assert.equal(Finding.findAll('é É', 'é').length, 2, 'case-insensitive search folds accented letters');
    assert.equal(Finding.findAll('é É', 'é', { caseSensitive: true }).length, 1);
});
