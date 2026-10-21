import fs from "node:fs/promises"
import path from "node:path"
import matter from "./frontmatter"
import { flattenDocsNav } from "@/config/docsNav"

export type DocsFrontmatter = {
  title: string
  description?: string
}

export type DocsPageId =
  | "getting-started/overview"
  | "getting-started/index"
  | "getting-started/shortcuts"
  | "getting-started/create-boards"
  | "getting-started/invite-members"
  | "getting-started/plan-roadmap"
  | "getting-started/publish-updates"
  | "getting-started/private-boards"
  | "getting-started/organize-feedback"
  | "getting-started/guest-feedback"
  | "getting-started/widget"
  | "getting-started/mask-identities"
  | "branding-setup/branding"
  | "branding-setup/domain"
  | "branding-setup/integrations"
  | "branding-setup/data"
  | "open-source/index"

const DOC_IDS: DocsPageId[] = [
  "getting-started/overview",
  "getting-started/index",
  "getting-started/shortcuts",
  "getting-started/create-boards",
  "getting-started/invite-members",
  "getting-started/plan-roadmap",
  "getting-started/publish-updates",
  "getting-started/private-boards",
  "getting-started/organize-feedback",
  "getting-started/guest-feedback",
  "getting-started/widget",
  "getting-started/mask-identities",
  "branding-setup/branding",
  "branding-setup/domain",
  "branding-setup/integrations",
  "branding-setup/data",
  "open-source/index",
]

const DOC_ID_SET = new Set<string>(DOC_IDS)

export async function readDocsMarkdown(id: DocsPageId) {
  if (!DOC_ID_SET.has(id)) {
    throw new Error(`Unknown docs page id: ${id}`)
  }

  const baseDir = path.join(process.cwd(), "src", "components", "docs", "content")
  const filePath = path.join(baseDir, `${id}.md`)
  const file = await fs.readFile(filePath, "utf-8")
  const { data, content } = matter(file)

  return {
    frontmatter: data as DocsFrontmatter,
    content,
  }
}

export type DocsArticleLink = {
  id: string
  title: string
  href: string
  summary: string | null
  sectionLabel: string
}

/** Every docs page with its frontmatter summary, in nav order; feeds docs search. */
export async function getDocsArticles(): Promise<DocsArticleLink[]> {
  return Promise.all(
    flattenDocsNav().map(async (item) => {
      const { frontmatter } = await readDocsMarkdown(item.id as DocsPageId)
      return {
        id: item.id,
        title: frontmatter.title ?? item.label,
        href: item.href,
        summary: frontmatter.description ?? null,
        sectionLabel: item.sectionLabel,
      }
    }),
  )
}

/** Reading time at ~200 words a minute, never under one minute (same as help articles). */
export function docsReadingMinutes(markdown: string) {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`|[\]()-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
