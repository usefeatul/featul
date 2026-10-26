import { COMING_SOON_INTEGRATION_SLUGS } from "@/components/integrations/icons"
import { generateIntegrationPage } from "@/lib/data/programmatic/generators"
import { INTEGRATIONS } from "@/lib/data/programmatic/matrix"
import { getRelatedPages } from "@/lib/seo/interlink"
import { blocks, faq, heading, link, linkList, list } from "../format"
import type { MarkdownRegistry } from "../types"

const INDEX_DESCRIPTION =
  "Connect Featul with Slack, Discord, Notra, and more. Browse setup guides and keep feedback flowing where your team already works."

function sortedIntegrations() {
  return [...INTEGRATIONS].sort((a, b) => a.name.localeCompare(b.name))
}

export const integrationsRoutes = {
  "/integrations": {
    section: "compare",
    static: true,
    entries: () => [{ path: "/integrations", title: "Integrations", description: INDEX_DESCRIPTION }],
    render: () => {
      const items = sortedIntegrations()
      return {
        title: "Connect Featul with the tools you already use",
        summary: INDEX_DESCRIPTION,
        path: "/integrations",
        body: blocks(
          "Slack, Discord, Notra, and more. Keep feedback flowing where your team already works, without switching tabs.",
          heading(2, "All available connections"),
          `${items.length} integrations. Open any integration for setup steps, benefits, and how it fits into your Featul workflow.`,
          linkList(
            items.map((item) => ({
              label: COMING_SOON_INTEGRATION_SLUGS.has(item.slug) ? `${item.name} (coming soon)` : item.name,
              href: `/integrations/${item.slug}`,
              description: item.description,
            })),
          ),
        ),
      }
    },
  },
  "/integrations/[slug]": {
    section: "compare",
    static: true,
    entries: () =>
      INTEGRATIONS.map((item) => {
        const page = generateIntegrationPage(item.slug)!
        return { path: page.meta.canonical, title: page.meta.title, description: page.meta.description }
      }),
    render: ({ slug = "" }) => {
      const page = generateIntegrationPage(slug)
      if (!page) return null
      const { meta, integration, sections, faqs } = page

      // Generic "Benefit N" titles are hidden in the HTML, so those render as a plain list.
      const titled = sections.benefits.some((benefit, i) => benefit.title !== `Benefit ${i + 1}`)
      const benefits = titled
        ? sections.benefits.map((benefit) => `${heading(3, benefit.title)}\n\n${benefit.description}`).join("\n\n")
        : list(sections.benefits.map((benefit) => benefit.description))

      return {
        title: `Featul + ${integration.name}`,
        summary: meta.description,
        path: meta.canonical,
        body: blocks(
          sections.intro,
          integration.website ? `${integration.name} website: ${link(integration.website, integration.website)}` : null,
          heading(2, `Why connect ${integration.name}`),
          `What your team gets when Featul and ${integration.name} work together.`,
          benefits,
          heading(2, "How to connect"),
          `A short setup path from Featul into ${integration.name}.`,
          sections.howItWorks.map((step, i) => `${i + 1}. ${step}`).join("\n"),
          sections.extra?.length
            ? blocks(
                heading(2, `${integration.name} integrations in more detail`),
                ...sections.extra.map((extra) => `${heading(3, extra.title)}\n\n${extra.body}`),
              )
            : null,
          heading(2, `FAQs about ${integration.name}`),
          faq(faqs),
        ),
        related: [
          ...getRelatedPages({ currentSlug: slug, currentType: "integration" }).map((item) => ({
            label: item.label,
            href: item.href,
          })),
          { label: "View all integrations", href: "/integrations" },
        ],
      }
    },
  },
} satisfies Pick<MarkdownRegistry, "/integrations" | "/integrations/[slug]">
