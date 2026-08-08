export type StructuredStreamPhase = "preamble" | "title" | "summary" | "body";

export type ParsedStructuredStream = {
  phase: StructuredStreamPhase;
  title: string | null;
  summary: string | null;
  body: string;
};

const GENERIC_TITLES = new Set([
  "product update",
  "update",
  "changelog",
  "release",
  "new update",
  "what's new",
  "whats new",
  "improvements",
  "bug fixes",
]);

export function isValidChangelogTitle(title: string): boolean {
  const normalized = title.trim().replace(/\s+/g, " ");
  if (normalized.length < 12) return false;
  if (normalized.split(/\s+/).length < 3) return false;
  if (GENERIC_TITLES.has(normalized.toLowerCase())) return false;
  return true;
}

export function extractTitleLine(raw: string): string | null {
  const text = raw.replace(/^\uFEFF/, "").trim();
  if (!text) return null;

  const structured = text.match(/^TITLE:\s*(.+)$/im);
  if (structured?.[1]?.trim()) {
    return structured[1].trim();
  }

  const firstLine = text.split(/\r?\n/)[0]?.trim();
  if (!firstLine) return null;

  return firstLine.replace(/^TITLE:\s*/i, "").replace(/^#+\s*/, "").trim() || null;
}

export function buildFallbackChangelogTitle(
  sourcePosts?: Array<{ title: string }>,
): string {
  if (!sourcePosts?.length) {
    return "Recent improvements and fixes";
  }

  if (sourcePosts.length === 1) {
    return sourcePosts[0]?.title.slice(0, 256) || "Recent improvements and fixes";
  }

  const primary = sourcePosts[0]?.title.trim() || "Recent improvements";
  return `${primary} and ${sourcePosts.length - 1} more updates`.slice(0, 256);
}

export function resolveAiChangelogTitle(
  raw: string,
  sourcePosts?: Array<{ title: string }>,
): string {
  const extracted = extractTitleLine(raw);
  if (extracted && isValidChangelogTitle(extracted)) {
    return extracted.slice(0, 256);
  }

  return buildFallbackChangelogTitle(sourcePosts);
}

export function usesStructuredChangelogStream(action: string) {
  return action === "generateFromPosts" || action === "prompt";
}

export function parseStructuredChangelogStream(raw: string): ParsedStructuredStream {
  const text = raw.replace(/^\uFEFF/, "");

  if (!/^TITLE:/im.test(text)) {
    return {
      phase: "preamble",
      title: null,
      summary: null,
      body: text.trim(),
    };
  }

  const titleMatch = text.match(/^TITLE:\s*([^\r\n]*)/im);
  const title = titleMatch?.[1]?.trim() || null;
  const afterTitle = titleMatch
    ? text.slice(titleMatch.index! + titleMatch[0].length)
    : text;

  if (!/^SUMMARY:/im.test(afterTitle)) {
    return {
      phase: title ? "title" : "preamble",
      title,
      summary: null,
      body: "",
    };
  }

  const summaryMatch = afterTitle.match(/^SUMMARY:\s*([\s\S]*?)(?:\r?\n---\r?\n|$)/im);
  const summaryBlock = summaryMatch?.[1] ?? "";
  const summary = summaryBlock.replace(/\s+/g, " ").trim() || null;

  const delimiterIndex = afterTitle.search(/\r?\n---\r?\n/);
  if (delimiterIndex === -1) {
    return {
      phase: "summary",
      title,
      summary,
      body: "",
    };
  }

  const body = afterTitle
    .slice(delimiterIndex)
    .replace(/^\r?\n---\r?\n/, "")
    .trimStart();

  return {
    phase: "body",
    title,
    summary,
    body,
  };
}
