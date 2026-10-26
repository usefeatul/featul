import { absoluteUrl } from "@/config/seo"
import type { MarkdownDoc, MarkdownLink } from "./types"

/** Absolute HTML URL for an internal path; external URLs pass through. */
export function url(href: string) {
  return /^https?:\/\//.test(href) ? href : absoluteUrl(href)
}

/** Escape text for use inside a link label or table cell. */
export function escapeText(text: string) {
  return text.replace(/\s+/g, " ").replace(/([\\[\]|*_`])/g, "\\$1").trim()
}

export function link(label: string, href: string) {
  return `[${escapeText(label)}](${url(href).replace(/[()\s]/g, encodeURIComponent)})`
}

export function heading(level: 2 | 3 | 4, text: string) {
  return `${"#".repeat(level)} ${text.replace(/\s+/g, " ").trim()}`
}

export function list(items: string[]) {
  return items.filter(Boolean).map((item) => `- ${item.replace(/\s+/g, " ").trim()}`).join("\n")
}

/** `- [Title](url) - description` lines for listing pages. */
export function linkList(items: MarkdownLink[]) {
  return items
    .map((item) => `- ${link(item.label, item.href)}${item.description ? ` - ${item.description.replace(/\s+/g, " ").trim()}` : ""}`)
    .join("\n")
}

export function table(headers: string[], rows: string[][]) {
  const cell = (value: string) => value.replace(/\s+/g, " ").replace(/\|/g, "\\|").trim() || " "
  return [
    `| ${headers.map(cell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n")
}

/** FAQ as `### Question` + answer. */
export function faq(items: { question: string; answer: string }[], level: 2 | 3 = 3) {
  return items.map((item) => `${heading(level, item.question)}\n\n${item.answer.trim()}`).join("\n\n")
}

/** YYYY-MM-DD from an ISO string, a loose date string ("31 October 2025"), or a Date. */
export function isoDate(input?: string | Date | null) {
  if (!input) return undefined
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}/.test(input)) return input.slice(0, 10)
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return undefined
  if (input instanceof Date) return date.toISOString().slice(0, 10)
  // Loose strings parse as local midnight; read local parts so the day doesn't shift.
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Join non-empty blocks with blank lines. */
export function blocks(...parts: (string | false | 0 | null | undefined)[]) {
  return parts.filter((part): part is string => Boolean(part && part.trim())).map((part) => part.trim()).join("\n\n")
}

export function renderDoc(doc: MarkdownDoc) {
  const related = doc.related?.length
    ? `${heading(2, "Related")}\n\n${list(doc.related.map((item) => link(item.label, item.href)))}`
    : undefined

  return `${blocks(
    `# ${doc.title.replace(/\s+/g, " ").trim()}`,
    `> ${doc.summary.replace(/\s+/g, " ").trim()}`,
    [`Canonical: ${url(doc.path)}`, doc.updated ? `Last updated: ${doc.updated}` : ""].filter(Boolean).join("\n"),
    doc.body,
    related,
  )}\n`
}
