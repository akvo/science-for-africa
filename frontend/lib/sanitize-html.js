/**
 * Tiny allowlist-based HTML sanitizer for user-generated rich text
 * (chat messages, comments, etc.). Keeps basic formatting and safe links,
 * strips everything else.
 *
 * Not a replacement for DOMPurify — the allowlist is intentionally small
 * and only covers what our rich-text editor produces.
 */

const ALLOWED_TAGS = new Set([
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "A",
  "UL",
  "OL",
  "LI",
  "BR",
  "P",
  "DIV",
  "SPAN",
  "H1",
  "H2",
  "H3",
  "CODE",
  "PRE",
  "BLOCKQUOTE",
]);

const ALLOWED_ATTRS = {
  A: new Set(["href", "target", "rel"]),
};

function isSafeHref(href) {
  if (!href) return false;
  return /^(https?:|mailto:|\/|#)/i.test(href.trim());
}

function sanitizeNode(node) {
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeType === 3 /* TEXT_NODE */) continue;
    if (child.nodeType !== 1 /* ELEMENT_NODE */) {
      child.remove();
      continue;
    }

    const tag = child.tagName;

    if (!ALLOWED_TAGS.has(tag)) {
      // Unwrap — keep children, drop the disallowed element.
      const parent = child.parentNode;
      while (child.firstChild) {
        parent.insertBefore(child.firstChild, child);
      }
      child.remove();
      continue;
    }

    const allowedAttrs = ALLOWED_ATTRS[tag] || new Set();
    for (const attr of Array.from(child.attributes)) {
      if (!allowedAttrs.has(attr.name)) {
        child.removeAttribute(attr.name);
      }
    }

    if (tag === "A") {
      const href = child.getAttribute("href") || "";
      if (!isSafeHref(href)) {
        child.setAttribute("href", "#");
      }
      child.setAttribute("target", "_blank");
      child.setAttribute("rel", "noopener noreferrer nofollow");
    }

    sanitizeNode(child);
  }
}

export function sanitizeHtml(dirty) {
  if (!dirty) return "";
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    // Server-side fallback: strip all tags. The client will re-render with
    // the real sanitized HTML on hydration.
    return String(dirty).replace(/<[^>]*>/g, "");
  }
  const doc = new DOMParser().parseFromString(
    `<div id="__sfa_sanitize_root__">${dirty}</div>`,
    "text/html",
  );
  const root = doc.getElementById("__sfa_sanitize_root__");
  if (!root) return "";
  sanitizeNode(root);
  return root.innerHTML;
}

/**
 * Strip HTML and return the plain-text content. Useful for validation
 * (e.g. "is this message empty after trimming?") without relying on
 * execCommand side effects.
 */
export function htmlToPlainText(html) {
  if (!html) return "";
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return String(html).replace(/<[^>]*>/g, "");
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}
