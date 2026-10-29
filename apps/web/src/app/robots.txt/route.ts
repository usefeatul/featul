import { absoluteUrl, SITE_URL } from "@/config/seo"
import { AI_DISALLOWED_PATHS } from "@/lib/md/site-files"

export const revalidate = 86400

/** AI search and user-triggered fetchers: always allowed so answer engines can cite Featul. */
const AI_SEARCH_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
]

/** Training crawlers that honour robots.txt: allowed on public marketing content. */
const AI_TRAINING_BOTS = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot"]

/** Aggressive crawlers with a history of ignoring crawl limits. */
const BLOCKED_BOTS = ["Bytespider"]

function group(agents: string[], rules: string[]) {
  return [...agents.map((agent) => `User-agent: ${agent}`), ...rules].join("\n")
}

const publicRules = ["Allow: /", ...AI_DISALLOWED_PATHS.map((path) => `Disallow: ${path}`)]

// A route (not app/robots.ts) so the file can carry comments.
export function GET() {
  const body = `# robots.txt for ${new URL(SITE_URL).host}
# Keep in sync with: ${absoluteUrl("/llms.txt")} and the [scope] section of ${absoluteUrl("/ai.txt")} (src/lib/md/site-files.ts)
# Language-model site map: ${absoluteUrl("/llms.txt")}
# AI usage policy: ${absoluteUrl("/ai.txt")}

${group(["*"], publicRules)}

# AI search and user-requested fetches
${group(AI_SEARCH_BOTS, publicRules)}

# AI training crawlers (public marketing content only)
${group(AI_TRAINING_BOTS, publicRules)}

${group(BLOCKED_BOTS, ["Disallow: /"])}

Sitemap: ${absoluteUrl("/sitemap.xml")}
`
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}
