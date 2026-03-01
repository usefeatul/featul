const CONTROL_CHAR_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

type TiptapTextNode = {
  type: "text";
  text: string;
  marks?: TiptapMark[];
};

type TiptapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Array<TiptapNode | TiptapTextNode>;
  text?: string;
};

type TiptapDoc = {
  type: "doc";
  content: TiptapNode[];
};

function cleanLine(value: string): string {
  return value.replace(CONTROL_CHAR_REGEX, "").trimEnd();
}

function normalizeMarks(marks: TiptapMark[]): TiptapMark[] {
  if (marks.length === 0) return [];
  const result: TiptapMark[] = [];
  const seen = new Set<string>();

  for (const mark of marks) {
    const key = `${mark.type}:${JSON.stringify(mark.attrs ?? {})}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(mark);
  }

  return result;
}

function textNode(text: string, marks: TiptapMark[] = []): TiptapTextNode {
  const normalizedMarks = normalizeMarks(marks);
  if (normalizedMarks.length === 0) {
    return { type: "text", text };
  }
  return { type: "text", text, marks: normalizedMarks };
}

function linkMark(href: string): TiptapMark {
  return {
    type: "link",
    attrs: {
      href,
      target: "_blank",
      rel: "noopener noreferrer nofollow",
    },
  };
}

function hasHttpProtocol(value: string): boolean {
  const lowered = value.toLowerCase();
  return lowered.startsWith("http://") || lowered.startsWith("https://");
}

function sanitizeLinkHref(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || !hasHttpProtocol(trimmed)) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function trimTrailingUrlPunctuation(value: string): string {
  let end = value.length;
  while (end > 0) {
    const char = value[end - 1];
    if (!char) break;

    if (".,!?;:".includes(char)) {
      end -= 1;
      continue;
    }

    if (char === ")") {
      const withChar = value.slice(0, end);
      const openCount = (withChar.match(/\(/g) ?? []).length;
      const closeCount = (withChar.match(/\)/g) ?? []).length;
      if (closeCount > openCount) {
        end -= 1;
        continue;
      }
    }

    break;
  }

  return value.slice(0, end);
}

type MarkdownLinkToken = {
  label: string;
  href: string;
  length: number;
};

function parseMarkdownLinkToken(
  value: string,
  start: number,
): MarkdownLinkToken | null {
  if (value[start] !== "[") return null;

  const closingBracket = value.indexOf("]", start + 1);
  if (closingBracket <= start + 1) return null;
  if (value[closingBracket + 1] !== "(") return null;

  const label = value.slice(start + 1, closingBracket).trim();
  if (!label) return null;

  let depth = 1;
  let index = closingBracket + 2;
  while (index < value.length) {
    const char = value[index];
    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth -= 1;
      if (depth === 0) break;
    }
    index += 1;
  }

  if (depth !== 0) return null;

  const hrefRaw = value.slice(closingBracket + 2, index).trim();
  const href = sanitizeLinkHref(hrefRaw);
  if (!href) return null;

  return {
    label,
    href,
    length: index - start + 1,
  };
}

type BareUrlToken = {
  href: string;
  text: string;
  length: number;
};

function parseBareUrlToken(value: string, start: number): BareUrlToken | null {
  if (!hasHttpProtocol(value.slice(start))) return null;

  const previousChar = start > 0 ? value[start - 1] : "";
  if (previousChar && /[a-zA-Z0-9]/.test(previousChar)) {
    return null;
  }

  let end = start;
  while (end < value.length && !/\s/.test(value[end] ?? "")) {
    end += 1;
  }

  const rawToken = value.slice(start, end);
  const trimmedToken = trimTrailingUrlPunctuation(rawToken);
  if (!trimmedToken) return null;

  const href = sanitizeLinkHref(trimmedToken);
  if (!href) return null;

  return {
    href,
    text: trimmedToken,
    length: trimmedToken.length,
  };
}

type StrongToken = {
  text: string;
  length: number;
};

function parseStrongToken(value: string, start: number): StrongToken | null {
  const delimiters = ["**", "__"] as const;
  for (const delimiter of delimiters) {
    if (!value.startsWith(delimiter, start)) continue;
    const closing = value.indexOf(delimiter, start + delimiter.length);
    if (closing <= start + delimiter.length) continue;

    const inner = value.slice(start + delimiter.length, closing);
    if (!inner.trim()) continue;

    return {
      text: inner,
      length: closing - start + delimiter.length,
    };
  }
  return null;
}

function marksEqual(
  left: TiptapMark[] | undefined,
  right: TiptapMark[] | undefined,
): boolean {
  const leftMarks = left ?? [];
  const rightMarks = right ?? [];
  if (leftMarks.length !== rightMarks.length) return false;
  for (let i = 0; i < leftMarks.length; i += 1) {
    const a = leftMarks[i];
    const b = rightMarks[i];
    if (!a || !b) return false;
    if (a.type !== b.type) return false;
    if (JSON.stringify(a.attrs ?? {}) !== JSON.stringify(b.attrs ?? {})) {
      return false;
    }
  }
  return true;
}

function mergeAdjacentTextNodes(nodes: TiptapTextNode[]): TiptapTextNode[] {
  const merged: TiptapTextNode[] = [];
  for (const node of nodes) {
    const last = merged[merged.length - 1];
    if (last && marksEqual(last.marks, node.marks)) {
      last.text += node.text;
      continue;
    }
    merged.push(node);
  }
  return merged;
}

function parseInlineContent(
  value: string,
  activeMarks: TiptapMark[] = [],
): TiptapTextNode[] {
  const nodes: TiptapTextNode[] = [];
  let index = 0;
  let buffer = "";

  const flushBuffer = () => {
    if (!buffer) return;
    nodes.push(textNode(buffer, activeMarks));
    buffer = "";
  };

  while (index < value.length) {
    const strong = parseStrongToken(value, index);
    if (strong) {
      flushBuffer();
      nodes.push(
        ...parseInlineContent(strong.text, [...activeMarks, { type: "bold" }]),
      );
      index += strong.length;
      continue;
    }

    const markdownLink = parseMarkdownLinkToken(value, index);
    if (markdownLink) {
      flushBuffer();
      nodes.push(
        textNode(markdownLink.label, [
          ...activeMarks,
          linkMark(markdownLink.href),
        ]),
      );
      index += markdownLink.length;
      continue;
    }

    const bareUrl = parseBareUrlToken(value, index);
    if (bareUrl) {
      flushBuffer();
      nodes.push(
        textNode(bareUrl.text, [...activeMarks, linkMark(bareUrl.href)]),
      );
      index += bareUrl.length;
      continue;
    }

    buffer += value[index];
    index += 1;
  }

  flushBuffer();
  return mergeAdjacentTextNodes(nodes);
}

function paragraphNode(text: string): TiptapNode {
  const trimmed = text.trim();
  if (!trimmed) return { type: "paragraph" };
  const inlineContent = parseInlineContent(trimmed);
  if (inlineContent.length === 0) return { type: "paragraph" };
  return {
    type: "paragraph",
    content: inlineContent,
  };
}

function headingNode(level: number, text: string): TiptapNode {
  const safeLevel = Math.max(1, Math.min(level, 6));
  const trimmed = text.trim();
  const inlineContent = parseInlineContent(trimmed);
  return {
    type: "heading",
    attrs: { level: safeLevel },
    content: inlineContent,
  };
}

function listNode(
  type: "bulletList" | "orderedList",
  items: string[],
): TiptapNode {
  return {
    type,
    content: items
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => ({
        type: "listItem",
        content: [paragraphNode(item)],
      })),
  };
}

function blockquoteNode(text: string): TiptapNode {
  return {
    type: "blockquote",
    content: [paragraphNode(text)],
  };
}

function normalizeMarkdown(markdown: string): string {
  return markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

export function markdownToTiptapDoc(markdown: string): TiptapDoc {
  const normalized = normalizeMarkdown(markdown);
  if (!normalized) {
    return {
      type: "doc",
      content: [paragraphNode("No details provided.")],
    };
  }

  const lines = normalized.split("\n");
  const nodes: TiptapNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = cleanLine(lines[index] ?? "");
    const line = rawLine.trim();
    if (!line) {
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1]?.length ?? 1;
      const text = headingMatch[2] ?? "";
      nodes.push(headingNode(level, text));
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length) {
        const quoteRaw = cleanLine(lines[index] ?? "").trim();
        if (!quoteRaw.startsWith(">")) break;
        quoteLines.push(quoteRaw.replace(/^>\s?/, ""));
        index += 1;
      }
      nodes.push(blockquoteNode(quoteLines.join(" ").trim()));
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length) {
        const itemRaw = cleanLine(lines[index] ?? "").trim();
        const match = itemRaw.match(/^[-*]\s+(.+)$/);
        if (!match) break;
        items.push(match[1] ?? "");
        index += 1;
      }
      nodes.push(listNode("bulletList", items));
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length) {
        const itemRaw = cleanLine(lines[index] ?? "").trim();
        const match = itemRaw.match(/^\d+\.\s+(.+)$/);
        if (!match) break;
        items.push(match[1] ?? "");
        index += 1;
      }
      nodes.push(listNode("orderedList", items));
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const part = cleanLine(lines[index] ?? "").trim();
      if (!part) break;
      if (
        /^(#{1,6})\s+/.test(part) ||
        /^>\s?/.test(part) ||
        /^[-*]\s+/.test(part) ||
        /^\d+\.\s+/.test(part)
      ) {
        break;
      }
      paragraphLines.push(part);
      index += 1;
    }

    if (paragraphLines.length === 0) {
      paragraphLines.push(line);
      index += 1;
    }

    nodes.push(paragraphNode(paragraphLines.join(" ").trim()));
  }

  if (nodes.length === 0) {
    nodes.push(paragraphNode("No details provided."));
  }

  return { type: "doc", content: nodes };
}

export function stripHtmlToText(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function toPlainText(value: string): string {
  return stripHtmlToText(value)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, " ")
    .replace(/[*_~>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveNotraMarkdown(markdown: string, html: string): string {
  const trimmedMarkdown = normalizeMarkdown(markdown);
  if (trimmedMarkdown) return trimmedMarkdown;
  return stripHtmlToText(html);
}

export function toNotraChangelogSlug(postId: string): string {
  const raw = postId.trim();
  const base = postId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const hash = Array.from(raw).reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0,
    0,
  );
  const suffix = hash.toString(36);
  return base ? `notra-${base}-${suffix}` : `notra-${suffix}`;
}
