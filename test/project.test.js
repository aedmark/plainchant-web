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
