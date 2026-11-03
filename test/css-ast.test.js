test('css-ast: parses rules, declarations, and matches elements by tag, class, and id', () => {
    const css = [
        '/* Header styles */',
        '.hero {',
        '  padding: 2rem;',
        '  background-color: #0f172a;',
        '}',
        '#ctaBtn {',
        '  color: #ffffff;',
        '}'
    ].join('\n');

    const ast = CssAst.parse(css);
    assert.equal(ast.rules.length, 2);
    assert.equal(ast.rules[0].selector, '.hero');
    assert.deepEqual(CssAst.getDeclarations(ast, '.hero'), {
        'padding': '2rem',
        'background-color': '#0f172a'
    });

    const htmlAst = HtmlAst.parse('<section class="hero"><button id="ctaBtn">Click</button></section>');
    const btn = htmlAst.elements.find((e) => e.tag === 'button');
    const matched = CssAst.findRulesForElement(ast, btn);
    assert.equal(matched.length, 1);
    assert.equal(matched[0].selector, '#ctaBtn');
});

test('css-ast: setProperty surgically updates existing declarations, appends new ones, removes empty ones, and adds new rules', () => {
    const css = '/* comment */\n.card {\n  padding: 1rem;\n  color: #111111;\n}\n';
    const updated = CssAst.setProperty(css, '.card', 'padding', '2.5rem');
    assert.includes(updated, '/* comment */');
    assert.includes(updated, 'padding: 2.5rem;');
    assert.includes(updated, 'color: #111111;');

    const addedProp = CssAst.setProperty(updated, '.card', 'border-radius', '8px');
    assert.includes(addedProp, 'border-radius: 8px;');

    const removedProp = CssAst.setProperty(addedProp, '.card', 'color', '');
    assert.ok(!removedProp.includes('color: #111111;'), 'color property removed');

    const newRule = CssAst.setProperty(removedProp, '.badge', 'display', 'inline-block');
    assert.includes(newRule, '.badge {\n  display: inline-block;\n}');
});

test('css-ast: parseInlineStyle and formatInlineStyle round-trip inline style attributes', () => {
    const map = CssAst.parseInlineStyle('display: flex; gap: 1rem; align-items: center;');
    assert.deepEqual(map, { display: 'flex', gap: '1rem', 'align-items': 'center' });
    map.gap = '2rem';
    assert.equal(CssAst.formatInlineStyle(map), 'display: flex; gap: 2rem; align-items: center');
});

test('css-ast: findRuleBySelector returns byte offsets and line number for exact or grouped selector', () => {
    const css = 'body {\n  margin: 0;\n}\n\n.card, .panel {\n  padding: 1rem;\n}\n';
    const rule = CssAst.findRuleBySelector(css, '.panel');
    assert.ok(rule, 'found grouped rule');
    assert.equal(rule.line, 4);
    assert.includes(css.slice(rule.start, rule.end), 'padding: 1rem;');
});
