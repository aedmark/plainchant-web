const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'app.html'), 'utf8');
const appDir = path.join(root, 'src', 'app');
const onDisk = fs.readdirSync(appDir).filter((f) => f.endsWith('.js')).sort();
const listed = Array.from(html.matchAll(/<script src="src\/app\/([^"]+)"><\/script>/g)).map((m) => m[1]);
const MAX_LINES = 500;

test('structure: app.html loads every file in src/app exactly once, and no file that does not exist', () => {
    assert.deepEqual(listed.slice().sort(), onDisk, 'the script tags and src/app/ disagree');
    assert.equal(new Set(listed).size, listed.length, 'a script is listed twice');
});

test('structure: the app scripts are loaded after the src/ modules they use, and main.js is last', () => {
    const order = Array.from(html.matchAll(/<script src="([^"]+)"><\/script>/g)).map((m) => m[1]);
    [
        'src/html-ast.js', 'src/css-ast.js', 'src/code-shade.js', 'src/dom-outline.js',
        'src/project.js', 'src/editing.js', 'src/suggest.js', 'src/library.js',
        'src/store.js', 'src/versions.js', 'src/filesync.js', 'src/importing.js'
    ].forEach((m) => {
        assert.ok(order.indexOf(m) !== -1 && order.indexOf(m) < order.indexOf('src/app/core.js'), m + ' must load before the app scripts');
    });
    assert.equal(order[order.length - 1], 'src/app/main.js');
    assert.equal(order.indexOf('src/app/core.js'), order.indexOf('src/importing.js') + 1, 'core.js must be the first app script');
});

test('structure: no inline script has crept into app.html', () => {
    const inline = Array.from(html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)).filter((m) => m[1].trim() !== '');
    assert.equal(inline.length, 0, inline.length + ' inline script(s) with code');
});

test('structure: each app script is valid JavaScript', () => {
    listed.forEach((f) => {
        try { new vm.Script(fs.readFileSync(path.join(appDir, f), 'utf8'), { filename: f }); }
        catch (e) { assert.ok(false, f + ': ' + e.message); }
    });
});

test('structure: together they are one program, so no name is declared twice across files', () => {
    const combined = listed.map((f) => fs.readFileSync(path.join(appDir, f), 'utf8')).join('\n;\n');
    try { new vm.Script(combined, { filename: 'src/app/*.js (concatenated in load order)' }); }
    catch (e) { assert.ok(false, e.message); }
});

test('structure: no app script has grown past ' + MAX_LINES + ' lines', () => {
    listed.forEach((f) => {
        const lines = fs.readFileSync(path.join(appDir, f), 'utf8').split('\n').length;
        assert.ok(lines <= MAX_LINES, f + ' is ' + lines + ' lines');
    });
});

test('structure: the app stylesheet is linked and no inline <style> is in app.html', () => {
    const links = Array.from(html.matchAll(/<link rel="stylesheet" href="(src\/[^"]+)">/g)).map((m) => m[1]);
    assert.deepEqual(links, ['src/styles.css']);
    assert.ok(fs.existsSync(path.join(root, 'src', 'styles.css')), 'src/styles.css is linked but missing');
    assert.ok(!/<style[\s>]/.test(html), 'an inline <style> block is present');
});

const readRoot = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const css = readRoot('src/styles.css');
const fontUrls = Array.from(css.matchAll(/url\('\.\.\/(fonts\/[^']+)'\)/g)).map((m) => m[1]);
const manifest = JSON.parse(readRoot('manifest.webmanifest'));

test('offline: the page and the stylesheet load nothing from another site', () => {
    assert.ok(!/(?:src|href)="(?:https?:)?\/\//i.test(html), 'app.html links to another site');
    assert.ok(!/url\(\s*['"]?(?:https?:)?\/\//i.test(css), 'styles.css loads something from another site');
    assert.ok(!/@import/.test(css), 'styles.css imports another stylesheet');
});

test('offline: the service worker keeps a copy of exactly the files the app uses, and all of them exist', () => {
    const sw = readRoot('sw.js');
    const swListed = Array.from(sw.match(/const APP_FILES = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)).map((m) => m[1]);
    assert.equal(new Set(swListed).size, swListed.length, 'a file is listed twice');
    const pageLinks = Array.from(html.matchAll(/<link [^>]*href="([^"]+)"/g)).map((m) => m[1]);
    const scripts = Array.from(html.matchAll(/<script src="([^"]+)"><\/script>/g)).map((m) => m[1]);
    const expected = ['./', 'index.html', 'app.html', 'src/home.css', 'manifest.webmanifest'].concat(pageLinks, scripts, fontUrls, manifest.icons.map((i) => i.src));
    assert.deepEqual(swListed.slice().sort(), Array.from(new Set(expected)).sort());
    swListed.filter((f) => f !== './').forEach((f) => assert.ok(fs.existsSync(path.join(root, f)), f + ' is listed but missing'));
});

test('structure: the Console inspector tab, its pane, and its script are wired into app.html (P5-01)', () => {
    ['data-insp="console"', 'id="consoleCountBadge"', 'id="inspConsolePane"', 'id="consoleList"', 'id="consoleClearBtn"'].forEach((needle) => {
        assert.includes(html, needle);
    });
    assert.ok(listed.indexOf('console-ui.js') > listed.indexOf('inspector-ui.js'), 'console-ui.js loads after inspector-ui.js');
});

test('structure: the Live JS link bridge and Follow Link controls are wired in (P5-02)', () => {
    assert.includes(html, 'id="propFollowBtn"');
    assert.ok(listed.indexOf('stage-live.js') > listed.indexOf('stage.js'), 'stage-live.js loads after stage.js');
    const stage = fs.readFileSync(path.join(appDir, 'stage.js'), 'utf8');
    ['pc-navigate', 'pc-follow-link'].forEach((type) => assert.includes(stage, type));
});

test('structure: the Parts tab, Make Part button, and parts scripts are wired in (P7-10)', () => {
    ['data-insp="parts"', 'id="partsCountBadge"', 'id="inspPartsPane"', 'id="partsList"', 'id="inspPartBtn"'].forEach((needle) => assert.includes(html, needle));
    const order = Array.from(html.matchAll(/<script src="([^"]+)"><\/script>/g)).map((m) => m[1]);
    assert.ok(order.indexOf('src/parts.js') > order.indexOf('src/project.js'), 'parts.js loads after project.js');
    assert.ok(order.indexOf('src/parts.js') < order.indexOf('src/app/core.js'), 'parts.js loads before the app scripts');
    assert.ok(listed.indexOf('parts-ui.js') > listed.indexOf('inspector-ui.js'), 'parts-ui.js loads after inspector-ui.js');
});

test('structure: the line-number gutter and find bar are wired in (P6-01)', () => {
    ['id="editorGutter"', 'id="findBar"', 'id="findInput"', 'id="replaceInput"', 'id="replaceBtn"', 'id="replaceAllBtn"', 'id="findCaseBtn"', 'id="findCount"'].forEach((needle) => assert.includes(html, needle));
    const order = Array.from(html.matchAll(/<script src="([^"]+)"><\/script>/g)).map((m) => m[1]);
    assert.ok(order.indexOf('src/finding.js') !== -1 && order.indexOf('src/finding.js') < order.indexOf('src/app/core.js'), 'finding.js loads before the app scripts');
    assert.ok(listed.indexOf('find.js') > listed.indexOf('shade.js'), 'find.js loads after shade.js');
});
