type NotraPostStatus = "draft" | "published";

export type NotraPost = {
  id: string;
  title: string;
  content: string;
  markdown: string;
  status: NotraPostStatus;
  createdAt: string;
  updatedAt: string;
};

export type NotraListPostsResponse = {
  posts: NotraPost[];
  pagination: {
    nextPage: number | null;
  };
};

export class NotraApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "NotraApiError";
    this.status = status;
  }
}

const NOTRA_BASE_URL = "https://api.usenotra.com";
const NOTRA_FETCH_TIMEOUT_MS = 12_000;
const CONTROL_CHAR_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readStatus(value: unknown): NotraPostStatus {
  return value === "draft" ? "draft" : "published";
}

function readNextPage(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 1) return null;
  return Math.floor(value);
}

function parseNotraListPostsResponse(payload: unknown): NotraListPostsResponse {
  if (!isRecord(payload)) {
    return { posts: [], pagination: { nextPage: null } };
  }

  const postsRaw = Array.isArray(payload.posts) ? payload.posts : [];
  const posts: NotraPost[] = postsRaw
    .map((post) => {
      if (!isRecord(post)) return null;
      const id = readString(post.id).trim();
      if (!id) return null;
      return {
        id,
        title: readString(post.title).trim() || "Untitled update",
        content: readString(post.content),
        markdown: readString(post.markdown),
        status: readStatus(post.status),
        createdAt: readString(post.createdAt),
        updatedAt: readString(post.updatedAt),
      };
    })
    .filter((post): post is NotraPost => post !== null);

  const paginationRaw = isRecord(payload.pagination) ? payload.pagination : {};
  const nextPage = readNextPage(paginationRaw.nextPage);

  return {
    posts,
    pagination: { nextPage },
  };
}

function parseErrorMessage(body: string): string {
  try {
    const parsed = JSON.parse(body) as unknown;
    if (!isRecord(parsed)) return "";
    const message = readString(parsed.error).trim();
    if (message) return message;
    return readString(parsed.message).trim();
  } catch {
    return "";
  }
}

export async function listNotraPostsPage(input: {
  apiKey: string;
  organizationId: string;
  page: number;
  limit: number;
  status: NotraPostStatus[];
}): Promise<NotraListPostsResponse> {
  const query = new URLSearchParams();
  query.set("sort", "desc");
  query.set("page", String(input.page));
  query.set("limit", String(input.limit));
  for (const status of input.status) {
    query.append("status", status);
  }

  const url = `${NOTRA_BASE_URL}/v1/${encodeURIComponent(input.organizationId)}/posts?${query.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    signal: AbortSignal.timeout(NOTRA_FETCH_TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const parsedMessage = parseErrorMessage(body);
    throw new NotraApiError(
      response.status,
      parsedMessage || "Request to Notra failed",
    );
  }

  const json = await response.json().catch(() => null);
  return parseNotraListPostsResponse(json);
}

type TiptapTextNode = {
  type: "text";
  text: string;
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

function textNode(text: string): TiptapTextNode {
  return { type: "text", text };
}

function paragraphNode(text: string): TiptapNode {
  const trimmed = text.trim();
  if (!trimmed) return { type: "paragraph" };
  return {
    type: "paragraph",
    content: [textNode(trimmed)],
  };
}

function headingNode(level: number, text: string): TiptapNode {
  const safeLevel = Math.max(1, Math.min(level, 6));
  const trimmed = text.trim();
  return {
    type: "heading",
    attrs: { level: safeLevel },
    content: trimmed ? [textNode(trimmed)] : [],
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
