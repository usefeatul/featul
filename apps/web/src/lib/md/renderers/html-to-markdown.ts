import { url } from "../format"

/**
 * Conservative HTML → Markdown for CMS post bodies (Marble). Handles the
 * tags a rich-text editor emits; anything else is stripped to its text.
 */

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  copy: "©",
  reg: "®",
  trade: "™",
}

export function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1]?.toLowerCase() === "x" ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10)
      return Number.isFinite(n) ? String.fromCodePoint(n) : match
    }
    return ENTITIES[code.toLowerCase()] ?? match
  })
}

function attr(tag: string, name: string) {
  const match = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag)
  return match ? decodeEntities(match[2] ?? match[3] ?? match[4] ?? "") : ""
}

function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, "")
}

function inline(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<img\b[^>]*>/gi, (tag) => {
      const src = attr(tag, "src")
      return src ? `![${attr(tag, "alt")}](${url(src)})` : ""
    })
    .replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_m, attrs: string, text: string) => {
      const href = attr(`<a ${attrs}>`, "href")
      const label = inline(text).trim()
      if (!href || href.startsWith("#")) return label
      return `[${label}](${url(href)})`
    })
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, text: string) => {
      const value = inline(text).trim()
      return value ? `**${value}**` : ""
    })
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, text: string) => {
      const value = inline(text).trim()
      return value ? `_${value}_` : ""
    })
    .replace(/<(s|del|strike)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, text: string) => `~~${inline(text).trim()}~~`)
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_m, text: string) => `\`${decodeEntities(stripTags(text))}\``)
}

function text(html: string) {
  return decodeEntities(stripTags(inline(html))).replace(/[ \t]*\n[ \t]*/g, "\n").replace(/[ \t]+/g, " ").trim()
}

const MARKER = /\uE000(\d+)\uE000/g

/** `inner` holds no nested list tags; nested lists arrive as placeholder markers. */
function listToMarkdown(inner: string, ordered: boolean, placeholders: string[]) {
  const items: string[] = []
  let index = 1
  for (const match of inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    const raw = match[1] ?? ""
    const nested = [...raw.matchAll(MARKER)].map((m) =>
      (placeholders[Number(m[1])] ?? "").replace(/^/gm, "  "),
    )
    const body = text(raw.replace(MARKER, "").replace(/<\/?p\b[^>]*>/gi, " ")).replace(/\n+/g, " ")
    const marker = ordered ? `${index++}.` : "-"
    items.push(`${marker} ${body}${nested.length ? `\n${nested.join("\n")}` : ""}`)
  }
  return items.join("\n")
}

function tableToMarkdown(html: string) {
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) =>
    [...(row[1] ?? "").matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cell) =>
      text(cell[1] ?? "").replace(/\|/g, "\\|").replace(/\n/g, " "),
    ),
  )
  if (!rows.length || !rows[0]!.length) return ""
  const width = Math.max(...rows.map((row) => row.length))
  const pad = (row: string[]) => [...row, ...Array(width - row.length).fill("")]
  const [head, ...body] = rows
  return [
    `| ${pad(head!).join(" | ")} |`,
    `| ${Array(width).fill("---").join(" | ")} |`,
    ...body.map((row) => `| ${pad(row).join(" | ")} |`),
  ].join("\n")
}

export function htmlToMarkdown(html?: string | null) {
  if (!html) return ""
  const placeholders: string[] = []
  const hold = (value: string) => `\n\n\uE000${placeholders.push(value) - 1}\uE000\n\n`

  let out = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|iframe|svg|template)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (_m, inner: string) => {
      const lang = /class\s*=\s*["'][^"']*language-([\w-]+)/i.exec(inner)?.[1] ?? ""
      const code = decodeEntities(stripTags(inner.replace(/<br\s*\/?>/gi, "\n"))).replace(/\n+$/, "")
      return hold(`\`\`\`${lang}\n${code}\n\`\`\``)
    })
    .replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (_m, inner: string) => hold(tableToMarkdown(inner)))

  // Innermost lists first, so each nested list is held before its parent item is read.
  const innermostList = /<(ul|ol)\b[^>]*>((?:(?!<(?:ul|ol)\b)[\s\S])*?)<\/\1>/i
  while (innermostList.test(out)) {
    out = out.replace(innermostList, (_m, tag: string, inner: string) =>
      hold(listToMarkdown(inner, tag.toLowerCase() === "ol", placeholders)),
    )
  }

  out = out
    .replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, inner: string) =>
      hold(
        text(inner.replace(/<\/p>\s*<p\b[^>]*>/gi, "\n\n"))
          .split("\n")
          .map((line) => `> ${line}`.trimEnd())
          .join("\n"),
      ),
    )
    .replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_m, level: string, inner: string) => {
      // The page H1 is the post title; demote body headings so they nest under it.
      const depth = Math.min(Math.max(Number(level), 2), 6)
      return hold(`${"#".repeat(depth)} ${text(inner).replace(/\n/g, " ")}`)
    })
    .replace(/<hr\b[^>]*>/gi, () => hold("---"))
    .replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_m, inner: string) => {
      const value = text(inner)
      return value ? hold(value) : ""
    })
    .replace(/<\/?(div|section|article|figure|figcaption|header|footer|main)\b[^>]*>/gi, "\n\n")

  out = text(out)
  // Placeholders can nest (a list inside a blockquote), so expand until stable.
  while (/\uE000\d+\uE000/.test(out)) {
    out = out.replace(/\uE000(\d+)\uE000/g, (_m, i: string) => placeholders[Number(i)] ?? "")
  }
  return out.replace(/\n{3,}/g, "\n\n").trim()
}
