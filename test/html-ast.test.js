test('html-ast: parses nested HTML5 elements with exact offsets and line numbers', () => {
    const html = [
        '<!DOCTYPE html>',
        '<html>',
        '<body>',
        '  <main id="hero" class="container wide">',
        '    <h1>Hello World</h1>',
        '    <img src="logo.png" alt="Logo">',
        '  </main>',
        '</body>',
        '</html>'
    ].join('\n');

    const ast = HtmlAst.parse(html);
    const main = ast.elements.find((e) => e.tag === 'main');
    assert.ok(main, 'found <main>');
    assert.equal(main.line, 3);
    assert.equal(main.attrs.id, 'hero');
    assert.equal(main.attrs.class, 'container wide');

    const img = ast.elements.find((e) => e.tag === 'img');
    assert.ok(img && img.selfClosing, 'void tag <img> is marked selfClosing');
    assert.equal(img.attrs.src, 'logo.png');

    const h1 = ast.elements.find((e) => e.tag === 'h1');
    assert.equal(HtmlAst.innerText(ast, h1.id), 'Hello World');
});

test('html-ast: stamps data-pc-id and data-line on body elements without touching head/script/style', () => {
    const html = '<html><head><title>Hi</title></head><body><div class="box"><p>Text</p></div></body></html>';
    const stamped = HtmlAst.stamp(html);
    assert.includes(stamped, '<div class="box" data-pc-id="');
    assert.includes(stamped, '<p data-pc-id="');
    assert.ok(!/<title[^>]*data-pc-id/.test(stamped), 'title is not stamped');
});

test('html-ast: setAttr surgically adds, updates, and removes attributes while keeping unrelated formatting', () => {
    const html = '<div   id="card"   class="old" >\n  <span>Keep me</span>\n</div>';
    const ast = HtmlAst.parse(html);
    const divId = ast.elements[0].id;

    const updated = HtmlAst.setAttr(html, divId, 'class', 'new-card active');
    assert.includes(updated, 'class="new-card active"');
    assert.includes(updated, 'id="card"');
    assert.includes(updated, '  <span>Keep me</span>');

    const added = HtmlAst.setAttr(updated, divId, 'data-role', 'banner');
    assert.includes(added, 'data-role="banner"');

    const removed = HtmlAst.setAttr(added, divId, 'id', null);
    assert.ok(!/id="card"/.test(removed), 'id attribute removed');
});

test('html-ast: setText, insertElement, wrapElement, and removeElement round-trip cleanly', () => {
    const html = '<body>\n  <section class="hero">\n    <h1>Old Title</h1>\n  </section>\n</body>';
    const ast1 = HtmlAst.parse(html);
    const h1 = ast1.elements.find((e) => e.tag === 'h1');

    const withNewText = HtmlAst.setText(html, h1.id, 'New & Improved');
    assert.includes(withNewText, '<h1>New &amp; Improved</h1>');

    const ast2 = HtmlAst.parse(withNewText);
    const sec = ast2.elements.find((e) => e.tag === 'section');
    const withButton = HtmlAst.insertElement(withNewText, sec.id, 'inside-end', '<button>Go</button>');
    assert.includes(withButton, '<button>Go</button>\n  </section>');

    const ast3 = HtmlAst.parse(withButton);
    const btn = ast3.elements.find((e) => e.tag === 'button');
    const wrapped = HtmlAst.wrapElement(withButton, btn.id, 'div', { class: 'actions' });
    assert.includes(wrapped, '<div class="actions"><button>Go</button></div>');

    const ast4 = HtmlAst.parse(wrapped);
    const wrapper = ast4.elements.find((e) => e.tag === 'div');
    const afterRemove = HtmlAst.removeElement(wrapped, wrapper.id);
    assert.ok(!afterRemove.includes('<div class="actions">'), 'wrapper removed');
});

test('html-ast: extractTitle and setTitle read and update <title>', () => {
    const html = '<!DOCTYPE html><html><head><title>First Title</title></head><body><h1>Heading</h1></body></html>';
    assert.equal(HtmlAst.extractTitle(html), 'First Title');
    const next = HtmlAst.setTitle(html, 'Second Title');
    assert.equal(HtmlAst.extractTitle(next), 'Second Title');
});

test('html-ast: duplicateElement and moveElement reorder and clone elements cleanly', () => {
    const html = '<body>\n  <div class="a">One</div>\n  <div class="b">Two</div>\n  <div class="c">Three</div>\n</body>';
    const ast1 = HtmlAst.parse(html);
    const bNode = ast1.elements.find((e) => e.attrs.class === 'b');

    const movedUp = HtmlAst.moveElement(html, bNode.id, 'up');
    assert.ok(movedUp.moved, 'moved up');
    assert.ok(movedUp.html.indexOf('class="b"') < movedUp.html.indexOf('class="a"'), 'b is now before a');

    const movedDown = HtmlAst.moveElement(movedUp.html, movedUp.newId, 'down');
    assert.ok(movedDown.moved, 'moved back down');
    assert.ok(movedDown.html.indexOf('class="a"') < movedDown.html.indexOf('class="b"'), 'a is before b again');

    const dup = HtmlAst.duplicateElement(movedDown.html, movedDown.newId);
    const matches = dup.html.match(/class="b"/g) || [];
    assert.equal(matches.length, 2, 'element duplicated');
});
