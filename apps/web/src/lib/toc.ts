export type TocItem = {
  id: string
  text: string
  level: 2 | 3
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/&amp;|&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

/**
 * Parses h2/h3 headings from HTML, injects id attributes, and returns ToC.
 */
export function generateToc(html?: string | null): { html: string; items: TocItem[] } {
  if (!html) return { html: "", items: [] }

  const items: TocItem[] = []
  const usedIds = new Set<string>()

  const withIds = html.replace(/<h([2-3])(\b[^>]*)>([\s\S]*?)<\/h\1>/g, (full, levelStr, attrs = "", inner) => {
    const level = Number(levelStr) as 2 | 3
    const text = inner.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()

    // find existing id
    const idMatch = /\bid\s*=\s*"([^"]+)"/i.exec(attrs)
    const id = idMatch ? idMatch[1] : slugify(text)

    // ensure uniqueness
    let unique = id
    let i = 2
    while (unique && usedIds.has(unique)) {
      unique = `${id}-${i++}`
    }
    if (unique) usedIds.add(unique)

    items.push({ id: unique || "", text, level })

    // inject id if missing
    if (!idMatch) {
      return `<h${level}${attrs} id="${unique}">${inner}</h${level}>`
    }
    // replace existing id with unique if needed
    if (idMatch && idMatch[1] !== unique) {
      const newAttrs = attrs.replace(idMatch[0], `id="${unique}"`)
      return `<h${level}${newAttrs}>${inner}</h${level}>`
    }
    return full
  })

  return { html: withIds, items }
}
