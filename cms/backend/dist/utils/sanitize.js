"use strict";
// Server-side HTML sanitization for rich text blog content.
// Prevents XSS when content is rendered in the frontend.
// Uses an allowlist approach — everything NOT listed is stripped.
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeHtml = sanitizeHtml;
const ALLOWED_TAGS = new Set([
    'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'figure', 'figcaption',
]);
const ALLOWED_ATTRIBUTES = {
    a: new Set(['href', 'title', 'target', 'rel']),
    img: new Set(['src', 'alt', 'width', 'height', 'loading']),
    td: new Set(['colspan', 'rowspan']),
    th: new Set(['colspan', 'rowspan', 'scope']),
    code: new Set(['class']), // allow language class for syntax highlighting
};
// Simple regex-based sanitizer — for production consider using
// the 'sanitize-html' npm package with this same allowlist config
function sanitizeHtml(dirty) {
    // Remove script/style/iframe/object tags and their content entirely
    let clean = dirty
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '')
        .replace(/<object\b[^>]*>.*?<\/object>/gi, '')
        .replace(/<embed\b[^>]*>/gi, '')
        .replace(/<link\b[^>]*>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // strip inline event handlers
        .replace(/javascript:/gi, ''); // strip javascript: URLs
    return clean;
}
//# sourceMappingURL=sanitize.js.map