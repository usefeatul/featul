import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"

export type DocsFrontmatter = {
  title: string
  description?: string
}

export type DocsPageId =
  | "getting-started/overview"
  | "getting-started/index"
  | "getting-started/create-boards"
  | "getting-started/invite-members"
  | "getting-started/plan-roadmap"
  | "getting-started/publish-updates"
  | "getting-started/private-boards"
  | "getting-started/smart-grouping"
  | "getting-started/guest-feedback"
  | "getting-started/add-userjot-links"
  | "getting-started/mask-identities"
  | "branding-setup/branding"
  | "branding-setup/domain"
  | "branding-setup/integrations"
  | "branding-setup/sso"
  | "advanced/subdomain-tracking"
  | "advanced/custom-events"
  | "advanced/identify"
  | "advanced/persist"

const DOC_IDS: DocsPageId[] = [
  "getting-started/overview",
  "getting-started/index",
  "getting-started/create-boards",
  "getting-started/invite-members",
  "getting-started/plan-roadmap",
  "getting-started/publish-updates",
  "getting-started/private-boards",
  "getting-started/smart-grouping",
  "getting-started/guest-feedback",
  "getting-started/add-userjot-links",
  "getting-started/mask-identities",
  "branding-setup/branding",
  "branding-setup/domain",
  "branding-setup/integrations",
  "branding-setup/sso",
  "advanced/subdomain-tracking",
  "advanced/custom-events",
  "advanced/identify",
  "advanced/persist",
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

