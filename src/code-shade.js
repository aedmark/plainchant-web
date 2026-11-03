(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.CodeShade = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const JS_KEYWORDS = new Set([
        'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
        'switch', 'case', 'break', 'continue', 'new', 'class', 'extends', 'import', 'export',
        'from', 'default', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'typeof',
        'instanceof', 'in', 'of', 'true', 'false', 'null', 'undefined', 'this', 'super'
    ]);

    function pushRun(runs, text, mark) {
        if (!text) return;
        const prev = runs[runs.length - 1];
        if (prev && (prev.mark || null) === (mark || null)) {
            prev.text += text;
        } else {
            runs.push(mark ? { text: text, mark: mark } : { text: text });
        }
    }

    function tokenizeHtmlLine(line, state) {
        const runs = [];
        let i = 0;
        const len = line.length;

        while (i < len) {
            if (state.inComment) {
                const close = line.indexOf('-->', i);
                if (close === -1) {
                    pushRun(runs, line.slice(i), 'comment');
                    break;
                }
                pushRun(runs, line.slice(i, close + 3), 'comment');
                state.inComment = false;
                i = close + 3;
                continue;
            }
            if (line.startsWith('<!--', i)) {
                const close = line.indexOf('-->', i + 4);
                if (close === -1) {
                    pushRun(runs, line.slice(i), 'comment');
                    state.inComment = true;
                    break;
                }
                pushRun(runs, line.slice(i, close + 3), 'comment');
                i = close + 3;
                continue;
            }
            const lt = line.indexOf('<', i);
            if (lt === -1) {
                pushRun(runs, line.slice(i), null);
                break;
            }
            if (lt > i) {
                pushRun(runs, line.slice(i, lt), null);
                i = lt;
            }
            const tagMatch = line.slice(i).match(/^<\/?[a-zA-Z0-9:-]+|^<![a-zA-Z0-9:-]*/);
            if (!tagMatch) {
                pushRun(runs, '<', null);
                i++;
                continue;
            }
            pushRun(runs, tagMatch[0], 'tag');
            i += tagMatch[0].length;
            while (i < len) {
                const gt = line.indexOf('>', i);
                const selfClose = gt > i && line[gt - 1] === '/';
                const slice = gt === -1 ? line.slice(i) : line.slice(i, selfClose ? gt - 1 : gt);
                const attrRe = /(\s+)|([^\s=<>"']+)|(=)|("[^"]*"|'[^']*')|([\s\S])/g;
                let m;
                while ((m = attrRe.exec(slice)) !== null) {
                    if (m[1]) pushRun(runs, m[1], null);
                    else if (m[2]) pushRun(runs, m[2], 'attr');
                    else if (m[3]) pushRun(runs, m[3], 'punct');
                    else if (m[4]) pushRun(runs, m[4], 'string');
                    else pushRun(runs, m[5], null);
                }
                if (gt === -1) {
                    i = len;
                    break;
                }
                pushRun(runs, (selfClose ? '/' : '') + '>', 'tag');
                i = gt + 1;
                break;
            }
        }
        return { kind: 'html', runs: runs.length ? runs : [{ text: '' }] };
    }

    function tokenizeCssLine(line, state) {
        const runs = [];
        let i = 0;
        const len = line.length;

        while (i < len) {
            if (state.inComment) {
                const close = line.indexOf('*/', i);
                if (close === -1) {
                    pushRun(runs, line.slice(i), 'comment');
                    break;
                }
                pushRun(runs, line.slice(i, close + 2), 'comment');
                state.inComment = false;
                i = close + 2;
                continue;
            }
            const cStart = line.indexOf('/*', i);
            if (cStart === i) {
                const close = line.indexOf('*/', i + 2);
                if (close === -1) {
                    pushRun(runs, line.slice(i), 'comment');
                    state.inComment = true;
                    break;
                }
                pushRun(runs, line.slice(i, close + 2), 'comment');
                i = close + 2;
                continue;
            }
            if (!state.inRule) {
                const brace = line.indexOf('{', i);
                if (brace === -1) {
                    pushRun(runs, line.slice(i), 'selector');
                    break;
                }
                pushRun(runs, line.slice(i, brace), 'selector');
                pushRun(runs, '{', 'punct');
                state.inRule = true;
                i = brace + 1;
                continue;
            }
            const closeBrace = line.indexOf('}', i);
            const colon = line.indexOf(':', i);
            if (closeBrace !== -1 && (colon === -1 || closeBrace < colon)) {
                pushRun(runs, line.slice(i, closeBrace), 'string');
                pushRun(runs, '}', 'punct');
                state.inRule = false;
                i = closeBrace + 1;
                continue;
            }
            if (colon !== -1) {
                pushRun(runs, line.slice(i, colon), 'prop');
                pushRun(runs, ':', 'punct');
                const semi = line.indexOf(';', colon + 1);
                if (semi !== -1 && (closeBrace === -1 || semi < closeBrace)) {
                    pushRun(runs, line.slice(colon + 1, semi), 'string');
                    pushRun(runs, ';', 'punct');
                    i = semi + 1;
                    continue;
                }
                if (closeBrace !== -1) {
                    pushRun(runs, line.slice(colon + 1, closeBrace), 'string');
                    pushRun(runs, '}', 'punct');
                    state.inRule = false;
                    i = closeBrace + 1;
                    continue;
                }
                pushRun(runs, line.slice(colon + 1), 'string');
                break;
            }
            pushRun(runs, line.slice(i), null);
            break;
        }
        return { kind: 'css', runs: runs.length ? runs : [{ text: '' }] };
    }

    function tokenizeJsLine(line, state) {
        const runs = [];
        let i = 0;
        const len = line.length;

        while (i < len) {
            if (state.inComment) {
                const close = line.indexOf('*/', i);
                if (close === -1) {
                    pushRun(runs, line.slice(i), 'comment');
                    break;
                }
                pushRun(runs, line.slice(i, close + 2), 'comment');
                state.inComment = false;
                i = close + 2;
                continue;
            }
            if (line.slice(i, i + 2) === '//') {
                pushRun(runs, line.slice(i), 'comment');
                break;
            }
            if (line.slice(i, i + 2) === '/*') {
                const close = line.indexOf('*/', i + 2);
                if (close === -1) {
                    pushRun(runs, line.slice(i), 'comment');
                    state.inComment = true;
                    break;
                }
                pushRun(runs, line.slice(i, close + 2), 'comment');
                i = close + 2;
                continue;
            }
            const ch = line[i];
            if (ch === '"' || ch === "'" || ch === '`') {
                let j = i + 1;
                while (j < len) {
                    if (line[j] === ch && line[j - 1] !== '\\') { j++; break; }
                    j++;
                }
                pushRun(runs, line.slice(i, j), 'string');
                i = j;
                continue;
            }
            const word = line.slice(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
            if (word) {
                const w = word[0];
                pushRun(runs, w, JS_KEYWORDS.has(w) ? 'keyword' : null);
                i += w.length;
                continue;
            }
            const num = line.slice(i).match(/^\d+(?:\.\d+)?/);
            if (num) {
                pushRun(runs, num[0], 'number');
                i += num[0].length;
                continue;
            }
            pushRun(runs, ch, null);
            i++;
        }
        return { kind: 'js', runs: runs.length ? runs : [{ text: '' }] };
    }

    function shade(text, lang) {
        const s = String(text || '');
        const lines = s.split('\n');
        const mode = String(lang || 'html').toLowerCase();
        const state = { inComment: false, inRule: false };

        return lines.map((line) => {
            if (!line.trim()) return { kind: 'blank', runs: [{ text: line }] };
            let shaded;
            if (mode === 'css') shaded = tokenizeCssLine(line, state);
            else if (mode === 'js' || mode === 'javascript') shaded = tokenizeJsLine(line, state);
            else shaded = tokenizeHtmlLine(line, state);
            // The coloured copy must contain exactly the editor's characters, or its wrapping drifts from the textarea.
            return shaded.runs.map((r) => r.text).join('') === line ? shaded : { kind: 'plain', runs: [{ text: line }] };
        });
    }

    return { shade: shade };
});
