import type { JSONContent } from "@tiptap/core";

export type HelpHeading = { id: string; text: string; level: number };

function textOf(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(textOf).join("");
}

function anchor(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/** Headings in document order with stable, de-duplicated anchor ids. */
export function extractHeadings(doc: JSONContent | null | undefined): HelpHeading[] {
  const out: HelpHeading[] = [];
  const seen = new Map<string, number>();
  const visit = (node: JSONContent) => {
    if (node.type === "heading") {
      const text = textOf(node).trim();
      if (text) {
        const base = anchor(text);
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        out.push({
          id: n ? `${base}-${n + 1}` : base,
          text,
          level: Number(node.attrs?.level ?? 2),
        });
      }
      return;
    }
    node.content?.forEach(visit);
  };
  if (doc) visit(doc);
  return out;
}

/** Reading time at ~200 words a minute, never under one minute. */
export function readingMinutes(doc: JSONContent | null | undefined) {
  let words = 0;
  const visit = (node: JSONContent) => {
    if (node.type === "text") words += (node.text ?? "").split(/\s+/).filter(Boolean).length;
    node.content?.forEach(visit);
  };
  if (doc) visit(doc);
  return Math.max(1, Math.round(words / 200));
}

export function formatHelpDate(value: string | Date | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const sameYear = d.getUTCFullYear() === new Date().getUTCFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "UTC",
  });
}

export const helpArticleHref = (slug: string) => `/help/articles/${encodeURIComponent(slug)}`;
export const helpCollectionHref = (slug: string) => `/help/collections/${encodeURIComponent(slug)}`;
