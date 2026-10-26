type MediaRange = { type: string; q: number }

function parseAccept(header: string): MediaRange[] {
  return header
    .split(",")
    .map((part) => {
      const [type = "", ...params] = part.trim().split(";")
      let q = 1
      for (const param of params) {
        const [key, value] = param.trim().split("=")
        if (key?.toLowerCase() === "q") {
          const parsed = Number.parseFloat(value ?? "")
          q = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0
        }
      }
      return { type: type.trim().toLowerCase(), q }
    })
    .filter((range) => range.type.length > 0)
}

/** Most specific matching range wins, per RFC 9110 §12.5.1. */
function qualityFor(ranges: MediaRange[], type: string) {
  const [major] = type.split("/")
  const exact = ranges.find((range) => range.type === type)
  if (exact) return { q: exact.q, explicit: true }
  const partial = ranges.find((range) => range.type === `${major}/*`)
  if (partial) return { q: partial.q, explicit: false }
  const any = ranges.find((range) => range.type === "*/*")
  return { q: any?.q ?? 0, explicit: false }
}

/**
 * True when the client prefers Markdown over HTML. A missing header or a
 * bare wildcard always gets HTML. On a q tie, an explicitly listed
 * `text/markdown` beats `text/html` that only matched through a wildcard.
 */
export function prefersMarkdown(accept: string | null) {
  if (!accept) return false
  const ranges = parseAccept(accept)
  const markdown = ranges.find((range) => range.type === "text/markdown")
  if (!markdown || markdown.q === 0) return false
  const html = qualityFor(ranges, "text/html")
  if (markdown.q > html.q) return true
  return markdown.q === html.q && !html.explicit
}
