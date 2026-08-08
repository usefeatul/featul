export type StructuredStreamPhase = "preamble" | "title" | "summary" | "body";

export type ParsedStructuredStream = {
  phase: StructuredStreamPhase;
  title: string | null;
  summary: string | null;
  body: string;
};

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

  const titleMatch = text.match(/^TITLE:\s*(.+?)(?:\r?\n|$)/im);
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
