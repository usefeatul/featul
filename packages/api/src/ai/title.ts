export function usesStructuredChangelogStream(
  action: string,
  hasExistingContent = false,
) {
  if (action === "chat") return !hasExistingContent;
  return action === "generateFromPosts" || action === "prompt";
}

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

  return (
    firstLine.replace(/^TITLE:\s*/i, "").replace(/^#+\s*/, "").trim() || null
  );
}

export function buildFallbackChangelogTitle(
  sourcePosts?: Array<{ title: string }>,
): string {
  if (!sourcePosts?.length) {
    return "Recent improvements and fixes";
  }

  if (sourcePosts.length === 1) {
    return (
      sourcePosts[0]?.title.slice(0, 256) || "Recent improvements and fixes"
    );
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

export function extractTitleFromMarkdown(markdown: string, fallback?: string) {
  for (const line of markdown.split("\n")) {
    const match = line.match(/^#\s+(.+)$/);
    if (match?.[1]) {
      return match[1].trim().slice(0, 256);
    }
  }
  return fallback?.trim().slice(0, 256);
}

export function extractSummaryFromMarkdown(markdown: string) {
  const paragraph = markdown
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .find((part) => part && !part.startsWith("#"));

  if (!paragraph) return undefined;

  return paragraph.replace(/\s+/g, " ").trim().slice(0, 512);
}

export function extractAiOutputMeta(markdown: string) {
  let body = markdown.replace(/^\uFEFF/, "").trim();
  let title: string | undefined;
  let suggestedTags: string[] | undefined;

  const titleMatch = body.match(/^TITLE:\s*(.+)$/im);
  if (titleMatch?.[1]?.trim()) {
    title = titleMatch[1].trim().slice(0, 256);
    body = body.replace(/^TITLE:\s*.+$/im, "").trim();
  }

  const tagsMatch = body.match(/\nTAGS:\s*(.+)\s*$/im);
  if (tagsMatch?.[1]?.trim()) {
    suggestedTags = tagsMatch[1]
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 8);
    body = body.replace(/\nTAGS:\s*.+\s*$/im, "").trim();
  }

  return { body, title, suggestedTags };
}
