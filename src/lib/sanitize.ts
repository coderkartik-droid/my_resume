/**
 * Lightweight, dependency-free rich-text sanitizer.
 *
 * The Privacy Policy CMS stores admin-authored HTML. Even though only
 * authenticated administrators can write content, we sanitize on every write
 * AND on every public read (defense in depth) to guarantee that no script,
 * inline event handler or dangerous URL can ever be rendered on the site.
 *
 * Strategy: allow-list of tags/attributes + tokenised rebuild, so anything not
 * explicitly permitted is dropped rather than merely escaped.
 */

const ALLOWED_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "br",
  "hr",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "del",
  "ins",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "code",
  "pre",
  "small",
  "sup",
  "sub",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "figure",
  "figcaption",
  "span",
  "div",
]);

const VOID_TAGS = new Set(["br", "hr"]);

const DANGEROUS_ELEMENTS =
  "script|style|iframe|object|embed|form|input|textarea|select|option|button|link|meta|base|svg|math|template|noscript|frame|frameset|applet|title|audio|video|source|track|canvas|map|area|portal";

const DANGEROUS_PAIR = new RegExp(
  `<\\s*(${DANGEROUS_ELEMENTS})\\b[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`,
  "gi"
);

const DANGEROUS_SINGLE = new RegExp(
  `<\\s*\\/?\\s*(${DANGEROUS_ELEMENTS})\\b[^>]*>`,
  "gi"
);

const TAG_TOKEN = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*)?)\/?>/g;

function escapeStrayLt(text: string): string {
  return text.replace(/</g, "&lt;");
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sanitizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  // Strip control characters / whitespace tricks used to bypass scheme checks
  const normalised = trimmed.toLowerCase().replace(/[\u0000-\u0020]/g, "");
  if (
    normalised.startsWith("javascript:") ||
    normalised.startsWith("data:") ||
    normalised.startsWith("vbscript:")
  ) {
    return "";
  }
  if (/^[a-z][a-z0-9+.-]*:/.test(normalised)) {
    return /^(https?|mailto|tel):/.test(normalised) ? trimmed : "";
  }
  // Relative / anchor links are safe
  return trimmed;
}

function sanitizeAnchorAttributes(raw: string): string {
  let href = "";
  let title = "";
  const attrRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+)/g;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(raw)) !== null) {
    const name = m[1].toLowerCase();
    const value = m[2].replace(/^["']|["']$/g, "");
    if (name === "href") href = value;
    else if (name === "title") title = value;
  }

  const parts: string[] = [];
  const safeHref = sanitizeUrl(href);
  if (safeHref) parts.push(`href="${escapeAttr(safeHref)}"`);
  if (title.trim()) parts.push(`title="${escapeAttr(title.trim())}"`);
  if (parts.length > 0) parts.push('rel="noopener noreferrer nofollow"');
  return parts.join(" ");
}

/**
 * Sanitizes a rich-text HTML string against the allow-list.
 */
export function sanitizeRichText(input: unknown): string {
  if (typeof input !== "string" || input.length === 0) return "";

  let html = input.replace(/\u0000/g, "");
  // Remove comments
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  // Remove dangerous elements including their inner content
  html = html.replace(DANGEROUS_PAIR, "");
  // Remove any residual dangerous opening/closing/self-closing tags
  html = html.replace(DANGEROUS_SINGLE, "");

  const out: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TAG_TOKEN.lastIndex = 0;

  while ((match = TAG_TOKEN.exec(html)) !== null) {
    out.push(escapeStrayLt(html.slice(lastIndex, match.index)));
    lastIndex = TAG_TOKEN.lastIndex;

    const full = match[0];
    const tag = match[1].toLowerCase();
    const rawAttrs = match[2] || "";

    if (!ALLOWED_TAGS.has(tag)) {
      // Drop the disallowed tag entirely (inner text is preserved separately)
      continue;
    }

    const isClosing = full.startsWith("</");
    if (isClosing) {
      if (!VOID_TAGS.has(tag)) out.push(`</${tag}>`);
      continue;
    }

    if (VOID_TAGS.has(tag)) {
      out.push(`<${tag} />`);
      continue;
    }

    if (tag === "a") {
      const attrs = sanitizeAnchorAttributes(rawAttrs);
      out.push(attrs ? `<a ${attrs}>` : "<a>");
      continue;
    }

    // All other allowed tags drop every attribute (blocks style/class/on* handlers)
    out.push(`<${tag}>`);
  }

  out.push(escapeStrayLt(html.slice(lastIndex)));
  return out.join("");
}

/**
 * Removes all tags and returns plain text (used for excerpts / validation).
 */
export function richTextToPlainText(input: unknown): string {
  const sanitized = sanitizeRichText(input);
  return sanitized
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export interface RichTextValidation {
  valid: boolean;
  error?: string;
}

export const RICH_TEXT_MAX_LENGTH = 60000;

/**
 * Validates admin rich-text input before persisting it.
 */
export function validateRichText(input: unknown): RichTextValidation {
  if (typeof input !== "string") {
    return { valid: false, error: "Content must be a string." };
  }
  if (input.length > RICH_TEXT_MAX_LENGTH) {
    return {
      valid: false,
      error: `Content is too long (maximum ${RICH_TEXT_MAX_LENGTH.toLocaleString()} characters).`,
    };
  }
  const plain = richTextToPlainText(input);
  if (plain.length < 20) {
    return { valid: false, error: "Content is too short to be a meaningful policy." };
  }
  return { valid: true };
}
