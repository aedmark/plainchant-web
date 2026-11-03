(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./html-ast.js'), require('./css-ast.js'));
    else root.Project = factory(root.HtmlAst, root.CssAst);
})(typeof self !== 'undefined' ? self : this, function (HtmlAst, CssAst) {
    'use strict';

    const DEFAULT_HTML = [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '  <title>Studio Landing Page</title>',
        '  <link rel="stylesheet" href="styles.css">',
        '</head>',
        '<body>',
        '  <header class="site-header">',
        '    <div class="brand">Polyphony Studio</div>',
        '    <nav class="site-nav">',
        '      <a href="#features" class="nav-link">Features</a>',
        '      <a href="#work" class="nav-link">Work</a>',
        '      <a href="#contact" class="nav-link">Contact</a>',
        '    </nav>',
        '  </header>',
        '  <main class="hero">',
        '    <span class="badge">HTML5 · CSS · JS</span>',
        '    <h1 class="hero-title">Design visually. Keep clean code.</h1>',
        '    <p class="hero-lead">Click any element on the stage to inspect its box model, tweak CSS rules, or double-click text to edit inline.</p>',
        '    <div class="hero-actions">',
        '      <button id="ctaBtn" class="btn-primary" type="button">Run Interactive Demo</button>',
        '      <a href="#features" class="btn-secondary">Explore Structure</a>',
        '    </div>',
        '  </main>',
        '  <section id="features" class="card-grid">',
        '    <article class="card">',
        '      <h2>True Source of Truth</h2>',
        '      <p>Every property change splices the exact byte range in your HTML and CSS files.</p>',
        '    </article>',
        '    <article class="card">',
        '      <h2>Live &amp; Design Modes</h2>',
        '      <p>Switch between visual layout inspection and live JavaScript execution at any time.</p>',
        '    </article>',
        '    <article class="card">',
        '      <h2>Tauri &amp; Web Ready</h2>',
        '      <p>Work in your browser with IndexedDB or open native project folders on desktop.</p>',
        '    </article>',
        '  </section>',
        '  <script src="script.js"></script>',
        '</body>',
        '</html>'
    ].join('\n');

    const DEFAULT_CSS = [
        ':root {',
        '  --surface: #0f172a;',
        '  --card: #1e293b;',
        '  --accent: #38bdf8;',
        '  --text: #f8fafc;',
        '  --muted: #94a3b8;',
        '}',
        '',
        'body {',
        '  margin: 0;',
        '  font-family: system-ui, -apple-system, sans-serif;',
        '  background-color: #f8fafc;',
        '  color: #0f172a;',
        '  line-height: 1.6;',
        '}',
        '',
        '.site-header {',
        '  display: flex;',
        '  justify-content: space-between;',
        '  align-items: center;',
        '  padding: 1.25rem 2.5rem;',
        '  background-color: #ffffff;',
        '  border-bottom: 1px solid #e2e8f0;',
        '}',
        '',
        '.brand {',
        '  font-weight: 700;',
        '  font-size: 1.125rem;',
        '  letter-spacing: -0.02em;',
        '}',
        '',
        '.site-nav {',
        '  display: flex;',
        '  gap: 1.5rem;',
        '}',
        '',
        '.nav-link {',
        '  color: #475569;',
        '  text-decoration: none;',
        '  font-weight: 500;',
        '}',
        '',
        '.hero {',
        '  max-width: 760px;',
        '  margin: 0 auto;',
        '  padding: 4rem 2rem 3rem;',
        '  text-align: center;',
        '}',
        '',
        '.badge {',
        '  display: inline-block;',
        '  padding: 0.25rem 0.75rem;',
        '  border-radius: 999px;',
        '  background-color: #e0f2fe;',
        '  color: #0369a1;',
        '  font-size: 0.75rem;',
        '  font-weight: 600;',
        '  letter-spacing: 0.05em;',
        '}',
        '',
        '.hero-title {',
        '  font-size: 2.5rem;',
        '  margin: 1rem 0 0.75rem;',
        '  letter-spacing: -0.03em;',
        '  color: #0f172a;',
        '}',
        '',
        '.hero-lead {',
        '  font-size: 1.125rem;',
        '  color: #475569;',
        '  margin: 0 0 2rem;',
        '}',
        '',
        '.hero-actions {',
        '  display: flex;',
        '  justify-content: center;',
        '  gap: 1rem;',
        '}',
        '',
        '.btn-primary {',
        '  padding: 0.75rem 1.5rem;',
        '  background-color: #0284c7;',
        '  color: #ffffff;',
        '  border: none;',
        '  border-radius: 0.5rem;',
        '  font-weight: 600;',
        '  cursor: pointer;',
        '}',
        '',
        '.btn-secondary {',
        '  padding: 0.75rem 1.5rem;',
        '  background-color: #e2e8f0;',
        '  color: #1e293b;',
        '  border-radius: 0.5rem;',
        '  text-decoration: none;',
        '  font-weight: 600;',
        '}',
        '',
        '.card-grid {',
        '  display: grid;',
        '  grid-template-columns: repeat(3, 1fr);',
        '  gap: 1.5rem;',
        '  max-width: 960px;',
        '  margin: 0 auto;',
        '  padding: 1rem 2rem 4rem;',
        '}',
        '',
        '.card {',
        '  background-color: #ffffff;',
        '  border: 1px solid #e2e8f0;',
        '  border-radius: 0.75rem;',
        '  padding: 1.5rem;',
        '}',
        '',
        '.card h2 {',
        '  font-size: 1.125rem;',
        '  margin: 0 0 0.5rem;',
        '}',
        '',
        '.card p {',
        '  margin: 0;',
        '  color: #475569;',
        '  font-size: 0.925rem;',
        '}'
    ].join('\n');

    const DEFAULT_JS = [
        '// Interactive script for Live Mode',
        'const ctaBtn = document.getElementById("ctaBtn");',
        'let clicks = 0;',
        '',
        'if (ctaBtn) {',
        '  ctaBtn.addEventListener("click", () => {',
        '    clicks += 1;',
        '    ctaBtn.textContent = "Clicked " + clicks + (clicks === 1 ? " time!" : " times!");',
        '  });',
        '}'
    ].join('\n');

    function resolveRelPath(baseFile, href) {
        const raw = String(href || '').trim().split('?')[0].split('#')[0];
        if (!raw || /^(?:https?:|data:|mailto:|tel:|\/\/)/i.test(raw)) return null;
        const clean = raw.replace(/^\.\//, '').replace(/^\//, '');
        if (!baseFile || baseFile.indexOf('/') === -1) return clean;
        const dirParts = baseFile.split('/').slice(0, -1);
        const relParts = raw.split('/');
        const stack = raw.startsWith('/') ? [] : dirParts;
        for (let i = 0; i < relParts.length; i++) {
            const seg = relParts[i];
            if (!seg || seg === '.') continue;
            if (seg === '..') stack.pop();
            else stack.push(seg);
        }
        return stack.join('/');
    }

    function normalizeEntries(files) {
        const f = files || {};
        const entries = Object.assign({}, f.entries || {});
        if (typeof f.html === 'string' && !('index.html' in entries)) entries['index.html'] = f.html;
        if (typeof f.css === 'string' && !('styles.css' in entries) && !('style.css' in entries)) entries['styles.css'] = f.css;
        if (typeof f.js === 'string' && !('script.js' in entries)) entries['script.js'] = f.js;
        return entries;
    }

    function linkedStylesheets(html, entries, activeHtmlPath) {
        const text = String(html || '');
        const found = [];
        const linkRe = /<link\b([^>]*?)>/gi;
        let m;
        while ((m = linkRe.exec(text)) !== null) {
            const tagAttrs = m[1];
            if (!/\brel\s*=\s*["']?stylesheet["']?/i.test(tagAttrs)) continue;
            const hrefMatch = tagAttrs.match(/\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
            if (!hrefMatch) continue;
            const rawHref = hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || '';
            const resolved = resolveRelPath(activeHtmlPath || 'index.html', rawHref);
            if (resolved) {
                found.push({ rawHref: rawHref, path: resolved, fullMatch: m[0] });
            }
        }
        return found;
    }

    function primaryCssFile(files, activeHtmlPath) {
        const entries = normalizeEntries(files);
        const htmlFile = activeHtmlPath || 'index.html';
        const html = entries[htmlFile] || (files && files.html) || '';
        const links = linkedStylesheets(html, entries, htmlFile);
        for (let i = 0; i < links.length; i++) {
            if (links[i].path in entries) return links[i].path;
        }
        if ('style.css' in entries && (!('styles.css' in entries) || (entries['style.css'] && !entries['styles.css']))) {
            return 'style.css';
        }
        if ('styles.css' in entries) return 'styles.css';
        const anyCss = Object.keys(entries).find((k) => k.toLowerCase().endsWith('.css'));
        return anyCss || (links[0] ? links[0].path : 'styles.css');
    }

    function starter() {
        return {
            html: DEFAULT_HTML,
            css: DEFAULT_CSS,
            js: DEFAULT_JS,
            entries: {
                'index.html': DEFAULT_HTML,
                'styles.css': DEFAULT_CSS,
                'script.js': DEFAULT_JS
            }
        };
    }

    function blank() {
        const h = [
            '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
            '  <meta charset="UTF-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '  <title>Untitled Page</title>',
            '  <link rel="stylesheet" href="styles.css">',
            '</head>',
            '<body>',
            '  <main class="container">',
            '    <h1>Hello World</h1>',
            '    <p>Start typing HTML or insert elements from the toolbar.</p>',
            '  </main>',
            '  <script src="script.js"></script>',
            '</body>',
            '</html>'
        ].join('\n');
        const c = [
            'body {',
            '  margin: 0;',
            '  font-family: system-ui, -apple-system, sans-serif;',
            '  background-color: #ffffff;',
            '  color: #0f172a;',
            '  line-height: 1.6;',
            '}',
            '',
            '.container {',
            '  max-width: 760px;',
            '  margin: 0 auto;',
            '  padding: 3rem 1.5rem;',
            '}'
        ].join('\n');
        const j = '// Write your JavaScript here\n';
        return {
            html: h,
            css: c,
            js: j,
            entries: {
                'index.html': h,
                'styles.css': c,
                'script.js': j
            }
        };
    }

    function pack(files) {
        const f = files || {};
        const entries = normalizeEntries(f);
        if (typeof f.html === 'string') entries[f.activeHtml || 'index.html'] = f.html;
        if (typeof f.css === 'string') entries[f.activeCss || primaryCssFile(f, f.activeHtml)] = f.css;
        if (typeof f.js === 'string') entries[f.activeJs || 'script.js'] = f.js;
        return JSON.stringify({
            plainchantWeb: 2,
            html: String(f.html == null ? (entries['index.html'] || '') : f.html),
            css: String(f.css == null ? (entries[primaryCssFile({ entries: entries }, 'index.html')] || '') : f.css),
            js: String(f.js == null ? (entries['script.js'] || '') : f.js),
            entries: entries
        });
    }

    function unpack(raw) {
        const s = String(raw || '');
        if (!s.trim()) return blank();
        if (s.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(s);
                if (parsed && typeof parsed === 'object' && ('html' in parsed || 'plainchantWeb' in parsed || 'entries' in parsed)) {
                    const entries = Object.assign({}, parsed.entries || {});
                    const html = String(parsed.html != null ? parsed.html : (entries['index.html'] || ''));
                    if (!('index.html' in entries) && html) entries['index.html'] = html;
                    const cssFile = primaryCssFile({ entries: entries, html: html }, 'index.html');
                    const css = String(parsed.css != null ? parsed.css : (entries[cssFile] || ''));
                    if (!(cssFile in entries) && css) entries[cssFile] = css;
                    const js = String(parsed.js != null ? parsed.js : (entries['script.js'] || ''));
                    if (!('script.js' in entries) && js) entries['script.js'] = js;
                    return {
                        html: html,
                        css: css,
                        js: js,
                        entries: entries
                    };
                }
            } catch (e) {
            }
        }
        let html = s;
        let css = '';
        let js = '';
        const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        if (styleMatch) css = styleMatch[1].trim();
        const scriptMatch = html.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/i);
        if (scriptMatch) js = scriptMatch[1].trim();
        return {
            html: html,
            css: css,
            js: js,
            entries: {
                'index.html': html,
                'styles.css': css,
                'script.js': js
            }
        };
    }

    function extractTitle(rawOrFiles) {
        const files = typeof rawOrFiles === 'string' ? unpack(rawOrFiles) : (rawOrFiles || {});
        const entries = normalizeEntries(files);
        const html = files.html || entries['index.html'] || Object.values(entries)[0] || '';
        return HtmlAst.extractTitle(html);
    }

    function setTitle(rawOrFiles, title) {
        const isStr = typeof rawOrFiles === 'string';
        const files = isStr ? unpack(rawOrFiles) : Object.assign({}, rawOrFiles);
        files.html = HtmlAst.setTitle(files.html || '', title);
        if (files.entries) files.entries['index.html'] = files.html;
        return isStr ? pack(files) : files;
    }

    function assemblePreview(files, options) {
        const f = typeof files === 'string' ? unpack(files) : (files || {});
        const opts = options || {};
        const entries = normalizeEntries(f);
        const activeHtmlPath = opts.activeHtml || f.activeHtml || 'index.html';
        const rawHtml = (opts.activeHtml && entries[opts.activeHtml] != null)
            ? entries[opts.activeHtml]
            : (f.html != null ? f.html : (entries['index.html'] || ''));

        const ast = opts.ast || HtmlAst.parse(rawHtml);
        let html = HtmlAst.stamp(rawHtml, ast);

        const links = linkedStylesheets(html, entries, activeHtmlPath);
        const inlinedCssPaths = new Set();

        links.forEach((lnk) => {
            if (entries[lnk.path] != null) {
                inlinedCssPaths.add(lnk.path);
                html = html.replace(
                    lnk.fullMatch,
                    '<style id="pc-project-css" data-pc-href="' + lnk.path + '">\n' + entries[lnk.path] + '\n</style>'
                );
            }
        });

        const fallbackCss = f.css != null ? f.css : (entries['styles.css'] || entries['style.css'] || '');
        const hasInjectedStyle = html.indexOf('id="pc-project-css"') !== -1;
        const styleBlock = !hasInjectedStyle
            ? '<style id="pc-project-css">\n' + String(fallbackCss) + '\n</style>'
            : '';

        html = html.replace(/<script\b([^>]*)\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)')([^>]*)>\s*<\/script>/gi, (full, pre, s1, s2) => {
            const srcPath = resolveRelPath(activeHtmlPath, s1 || s2);
            if (!opts.liveJs) return '';
            if (srcPath && entries[srcPath] != null) {
                return '<script id="pc-project-js" data-pc-src="' + srcPath + '">\ntry {\n' + entries[srcPath] + '\n} catch (err) {\n  window.parent.postMessage({ type: "pc-runtime-error", message: String(err && err.message || err) }, "*");\n}\n<\/script>';
            }
            return full;
        });

        if (!opts.liveJs) {
            html = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
        }

        const baseTag = opts.baseUrl ? '<base href="' + opts.baseUrl + '">' : '';
        const bridgeBlock = opts.bridgeCss ? '<style id="pc-bridge-css">\n' + opts.bridgeCss + '\n</style>' : '';
        const headTop = baseTag ? baseTag + '\n' : '';
        const headBottom = [styleBlock, bridgeBlock].filter(Boolean).join('\n');

        if (headTop) {
            if (/<head[^>]*>/i.test(html)) {
                html = html.replace(/(<head[^>]*>)/i, '$1\n' + headTop);
            } else {
                html = headTop + html;
            }
        }

        if (headBottom) {
            if (/<\/head>/i.test(html)) {
                html = html.replace(/<\/head>/i, headBottom + '\n</head>');
            } else {
                html = headBottom + '\n' + html;
            }
        }

        const hasInjectedJs = html.indexOf('id="pc-project-js"') !== -1;
        const fallbackJs = f.js != null ? f.js : (entries['script.js'] || '');
        const userJsBlock = (opts.liveJs && !hasInjectedJs && String(fallbackJs).trim())
            ? '<script id="pc-project-js">\ntry {\n' + String(fallbackJs) + '\n} catch (err) {\n  window.parent.postMessage({ type: "pc-runtime-error", message: String(err && err.message || err) }, "*");\n}\n<\/script>'
            : '';

        const bridgeJsBlock = opts.bridgeScript
            ? '<script id="pc-bridge-script">\n' + opts.bridgeScript + '\n<\/script>'
            : '';
        const tailInsert = [userJsBlock, bridgeJsBlock].filter(Boolean).join('\n');

        if (tailInsert) {
            if (/<\/body>/i.test(html)) {
                html = html.replace(/<\/body>/i, tailInsert + '\n</body>');
            } else {
                html = html + '\n' + tailInsert;
            }
        }
        return html;
    }

    function exportSingleHtml(files) {
        const f = typeof files === 'string' ? unpack(files) : (files || {});
        const entries = normalizeEntries(f);
        let html = String(f.html || entries['index.html'] || '');
        const cssFile = primaryCssFile(f, 'index.html');
        const css = String(f.css != null ? f.css : (entries[cssFile] || '')).trim();
        const js = String(f.js != null ? f.js : (entries['script.js'] || '')).trim();

        if (css) {
            const styleTag = '<style>\n' + css + '\n  </style>';
            const links = linkedStylesheets(html, entries, 'index.html');
            if (links.length) {
                html = html.replace(links[0].fullMatch, styleTag);
            } else if (/<\/head>/i.test(html)) {
                html = html.replace(/<\/head>/i, '  ' + styleTag + '\n</head>');
            } else {
                html = styleTag + '\n' + html;
            }
        }
        if (js) {
            const scriptTag = '<script>\n' + js + '\n  <\/script>';
            if (/<script\b[^>]*src=["'][^"']+["'][^>]*>\s*<\/script>/i.test(html)) {
                html = html.replace(/<script\b[^>]*src=["'][^"']+["'][^>]*>\s*<\/script>/i, scriptTag);
            } else if (/<\/body>/i.test(html)) {
                html = html.replace(/<\/body>/i, '  ' + scriptTag + '\n</body>');
            } else {
                html = html + '\n' + scriptTag;
            }
        }
        return html;
    }

    function stats(rawOrFiles) {
        const f = typeof rawOrFiles === 'string' ? unpack(rawOrFiles) : (rawOrFiles || {});
        const entries = normalizeEntries(f);
        const cssFile = primaryCssFile(f, 'index.html');
        const htmlText = f.html != null ? f.html : (entries['index.html'] || '');
        const cssText = f.css != null ? f.css : (entries[cssFile] || '');
        const jsText = f.js != null ? f.js : (entries['script.js'] || '');
        const htmlAst = HtmlAst.parse(htmlText);
        const cssAst = CssAst.parse(cssText);
        const jsLines = String(jsText).trim() ? String(jsText).split('\n').length : 0;
        const bodyElements = htmlAst.elements.filter((el) =>
            ['html', 'head', 'meta', 'title', 'link', 'style', 'script', 'body'].indexOf(el.tag) === -1
        );
        return {
            elements: bodyElements.length,
            rules: cssAst.rules.length,
            jsLines: jsLines,
            htmlLines: String(htmlText).split('\n').length,
            cssLines: String(cssText).split('\n').length,
            fileCount: Object.keys(entries).length
        };
    }

    return {
        DEFAULT_HTML: DEFAULT_HTML,
        DEFAULT_CSS: DEFAULT_CSS,
        DEFAULT_JS: DEFAULT_JS,
        resolveRelPath: resolveRelPath,
        normalizeEntries: normalizeEntries,
        linkedStylesheets: linkedStylesheets,
        primaryCssFile: primaryCssFile,
        starter: starter,
        blank: blank,
        pack: pack,
        unpack: unpack,
        extractTitle: extractTitle,
        setTitle: setTitle,
        assemblePreview: assemblePreview,
        exportSingleHtml: exportSingleHtml,
        stats: stats
    };
});
