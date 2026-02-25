import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import type { LegalSlug } from "@/types/legal"

export type LegalFrontmatter = {
  title: string
  description?: string
  path: string
  lastUpdated?: string
}

export async function readLegalMarkdown(slug: LegalSlug) {
  const baseDir = path.join(process.cwd(), "src", "content", "legal")
  const filePath = path.join(baseDir, `${slug}.md`)
  const file = await fs.readFile(filePath, "utf-8")
  const { data, content } = matter(file)
  return {
    frontmatter: data as LegalFrontmatter,
    content,
  }
}
