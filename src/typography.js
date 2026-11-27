(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.Typography = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const FONT_PRESETS = [
        { label: 'System UI', value: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" },
        { label: 'Inter', value: "'Inter', system-ui, sans-serif" },
        { label: 'Arial / Helvetica', value: 'Arial, Helvetica, sans-serif' },
        { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
        { label: 'Georgia', value: "Georgia, 'Times New Roman', serif" },
        { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
        { label: 'Palatino', value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
        { label: 'Courier Prime', value: "'Courier Prime', Courier, monospace" },
        { label: 'Monospace', value: "ui-monospace, 'Cascadia Code', Consolas, monospace" }
    ];

    const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px', '48px', '0.875rem', '1rem', '1.25rem', '1.5rem', '2rem', '3rem'];
    const LINE_HEIGHTS = ['1', '1.15', '1.35', '1.5', '1.75', '2', 'normal'];
    const LETTER_SPACINGS = ['-0.03em', '-0.01em', 'normal', '0.03em', '0.08em', '0.15em'];

    function isBoldValue(val) {
        const s = String(val || '').trim().toLowerCase();
        if (!s) return false;
        if (s === 'bold' || s === 'bolder') return true;
        const n = parseFloat(s);
        return Number.isFinite(n) && n >= 600;
    }

    function toggleBold(declaredVal, computedVal) {
        const decl = String(declaredVal || '').trim();
        if (decl) return isBoldValue(decl) ? '' : '700';
        return isBoldValue(computedVal) ? '400' : '700';
    }

    function isItalicValue(val) {
        return /^(italic|oblique)\b/i.test(String(val || '').trim());
    }

    function toggleItalic(declaredVal, computedVal) {
        const decl = String(declaredVal || '').trim();
        if (decl) return isItalicValue(decl) ? '' : 'italic';
        return isItalicValue(computedVal) ? 'normal' : 'italic';
    }

    function decorationLines(val) {
        const tokens = String(val || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
        return {
            underline: tokens.indexOf('underline') !== -1,
            lineThrough: tokens.indexOf('line-through') !== -1
        };
    }

    function toggleDecoration(declaredVal, computedVal, lineName, tagName) {
        const decl = String(declaredVal || '').trim();
        const hasDecl = decl !== '';
        const state = hasDecl ? decorationLines(decl) : decorationLines(computedVal);
        if (lineName === 'underline') state.underline = !state.underline;
        else if (lineName === 'line-through') state.lineThrough = !state.lineThrough;
        const out = [];
        if (state.underline) out.push('underline');
        if (state.lineThrough) out.push('line-through');
        if (out.length) return out.join(' ');
        return (hasDecl && String(tagName || '').toLowerCase() !== 'a') ? '' : 'none';
    }

    function parseSize(val) {
        const m = /^\s*(\d+(?:\.\d+)?|\.\d+)\s*(px|rem|em|pt|%)\s*$/i.exec(String(val || ''));
        if (!m) return null;
        return { num: parseFloat(m[1]), unit: m[2].toLowerCase() };
    }

    function stepFontSize(declaredVal, computedVal, delta) {
        const dir = delta < 0 ? -1 : 1;
        const parsed = parseSize(declaredVal) || parseSize(computedVal) || { num: 16, unit: 'px' };
        let next = parsed.num;
        if (parsed.unit === 'rem' || parsed.unit === 'em') {
            next = Math.max(0.5, Math.round((parsed.num + dir * 0.125) * 1000) / 1000);
        } else if (parsed.unit === '%') {
            next = Math.max(50, Math.round(parsed.num + dir * 10));
        } else {
            const step = (parsed.num < 12 || (parsed.num === 12 && dir < 0)) ? 1 : 2;
            next = Math.max(6, Math.round((parsed.num + dir * step) * 100) / 100);
        }
        return next + parsed.unit;
    }

    function normFontStr(val) {
        return String(val || '').toLowerCase().replace(/["']/g, '').replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').trim();
    }

    function matchFontPreset(declaredVal) {
        const norm = normFontStr(declaredVal);
        if (!norm) return '';
        const hit = FONT_PRESETS.find((p) => normFontStr(p.value) === norm);
        return hit ? hit.value : String(declaredVal || '').trim();
    }

    function normalizeAlign(val) {
        const s = String(val || '').trim().toLowerCase();
        if (s === 'start') return 'left';
        if (s === 'end') return 'right';
        if (s === 'left' || s === 'center' || s === 'right' || s === 'justify') return s;
        return '';
    }

    function toggleAlign(declaredVal, dir) {
        const cleanDir = normalizeAlign(dir);
        if (!cleanDir) return '';
        return normalizeAlign(declaredVal) === cleanDir ? '' : cleanDir;
    }

    return {
        FONT_PRESETS: FONT_PRESETS,
        FONT_SIZES: FONT_SIZES,
        LINE_HEIGHTS: LINE_HEIGHTS,
        LETTER_SPACINGS: LETTER_SPACINGS,
        isBoldValue: isBoldValue,
        toggleBold: toggleBold,
        isItalicValue: isItalicValue,
        toggleItalic: toggleItalic,
        decorationLines: decorationLines,
        toggleDecoration: toggleDecoration,
        stepFontSize: stepFontSize,
        matchFontPreset: matchFontPreset,
        normalizeAlign: normalizeAlign,
        toggleAlign: toggleAlign
    };
});
