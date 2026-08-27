import type { FaqItem } from '@/data/faqs'
import { COMPETITORS } from '@/lib/data/programmatic/matrix'

export type AlternativeFaqs = {
  description: string
  items: FaqItem[]
}

function buildCompetitorFaqs(slug: string): AlternativeFaqs | null {
  const competitor = COMPETITORS.find((c) => c.slug === slug)
  if (!competitor) return null

  const advantage = competitor.victoryPoints[0] || 'privacy-first EU hosting'
  const tradeoff = competitor.tradeoffs[0] || `${competitor.name} may fit teams that already rely on its ecosystem`

  return {
    description: `Compare ${competitor.name} and Featul: ${advantage.toLowerCase()}, migration support, and a unified feedback workflow.`,
    items: [
      {
        id: `${slug}-1`,
        question: `Is Featul a good ${competitor.name} alternative?`,
        answer: `Yes. Featul is built as a privacy-first alternative to ${competitor.name}, with ${advantage.toLowerCase()}, plus feedback boards, public roadmaps, and changelogs in one tool.`,
      },
      {
        id: `${slug}-2`,
        question: `How does Featul compare to ${competitor.name}?`,
        answer: `${competitor.name} is known for ${competitor.tagline.toLowerCase()}. Featul differentiates with ${competitor.victoryPoints.slice(0, 2).map((p) => p.toLowerCase()).join(' and ')}.`,
      },
      {
        id: `${slug}-3`,
        question: `When should I stay with ${competitor.name}?`,
        answer: `${tradeoff}. Choose Featul if you want EU hosting defaults, simpler setup, and a connected feedback-to-changelog workflow.`,
      },
      {
        id: `${slug}-4`,
        question: `Can I migrate from ${competitor.name} to Featul?`,
        answer: `Yes. You can import feedback and recreate categories, tags, and statuses to mirror your ${competitor.name} setup. Our team can guide larger migrations.`,
      },
      {
        id: `${slug}-5`,
        question: `Does Featul include roadmap and changelog like ${competitor.name}?`,
        answer: `Featul includes public roadmaps and changelogs linked to feedback, so requesters can see progress from planned work through to release notes.`,
      },
      {
        id: `${slug}-6`,
        question: `How quickly can I replace ${competitor.name} with Featul?`,
        answer: `Most teams can stand up a branded feedback board in minutes, share a public roadmap, and embed the widget without a long implementation project.`,
      },
    ],
  }
}


export const altFaqs: Record<string, AlternativeFaqs> = {
  userjot: {
    description:
      'Compare UserJot and Featul: EU hosting by default, complete workflow with boards, roadmap and changelog, easy migration.',
    items: [
      {
        id: 'userjot-1',
        question: 'What’s the key difference between UserJot and Featul?',
        answer:
          'UserJot focuses on lightweight feedback capture. Featul adds a complete workflow—feedback boards, public roadmap, and changelog—plus privacy-first defaults.',
      },
      {
        id: 'userjot-2',
        question: 'Does Featul provide EU hosting by default?',
        answer:
          'Yes. Featul prioritizes EU hosting and GDPR-friendly settings out of the box, helping teams meet regional compliance requirements.',
      },
      {
        id: 'userjot-3',
        question: 'Can I migrate data from UserJot to Featul?',
        answer:
          'You can import posts and set up categories, statuses, and tags to mirror your existing structure. Our team can guide larger migrations.',
      },
      {
        id: 'userjot-4',
        question: 'How do voting and boards compare?',
        answer:
          'Both support voting and boards. Featul adds prioritization tools (tags, segments) and links feedback directly to roadmap items.',
      },
      {
        id: 'userjot-5',
        question: 'Is there a public roadmap and changelog?',
        answer:
          'Yes. Share a public roadmap and publish release notes to close the loop so requesters see progress from “Planned” to “Released.”',
      },
      {
        id: 'userjot-6',
        question: 'What integrations are available?',
        answer:
          'Featul integrates with Slack and offers webhooks/API for custom workflows. SSO is supported depending on plan and setup.',
      },
    ],
  },
  featurebase: {
    description:
      'Compare Featul as an open source Featurebase alternative: EU hosting, self-hosting, workspace pricing, and a unified roadmap and changelog.',
    items: [
      {
        id: 'featurebase-1',
        question: 'What are the best Featurebase alternatives in 2026?',
        answer:
          'Teams comparing Featurebase alternatives usually want voting boards, a public roadmap, and a changelog without per-seat pricing. Featul is an open source Featurebase alternative with EU hosting, self-hosting, and one workflow from votes to release notes.',
      },
      {
        id: 'featurebase-2',
        question: 'Is Featul an open source Featurebase alternative?',
        answer:
          'Yes. Featul is MIT-licensed and can be self-hosted. You get boards, voting, roadmap, and changelog without locking feedback data into a closed vendor. Hosted EU workspaces are available if you do not want to run infrastructure.',
      },
      {
        id: 'featurebase-3',
        question: 'How does Featul pricing compare to Featurebase?',
        answer:
          'Featurebase scales primarily on seats. Featul uses flat workspace plans, so adding product, success, and engineering people does not multiply the bill the same way. Compare current numbers on the Featul pricing page.',
      },
      {
        id: 'featurebase-4',
        question: 'Can I migrate from Featurebase to Featul?',
        answer:
          'You can import feedback and recreate categories, tags, and statuses. For complex Featurebase workspaces, we offer guidance so board structure stays intact.',
      },
      {
        id: 'featurebase-5',
        question: 'Does Featul include roadmap and changelog like Featurebase?',
        answer:
          'Yes. Link feedback to roadmap items and publish release notes so customers see what shipped and why. Featul keeps those surfaces in one product instead of a bolted-on suite.',
      },
      {
        id: 'featurebase-6',
        question: 'When should I stay on Featurebase?',
        answer:
          'Stay if you already rely on Featurebase’s help-center and AI support suite and do not need self-hosting or EU-first hosting. Choose Featul if you want an open source Featurebase alternative with simpler workspace pricing.',
      },
      {
        id: 'featurebase-7',
        question: 'Does Featul replace Featurebase voting boards?',
        answer:
          'Yes. Customers still submit, vote, and comment. Featul adds a public roadmap and changelog in the same workspace, plus the option to self-host so the board is not locked to a vendor.',
      },
      {
        id: 'featurebase-8',
        question: 'Is Featul cheaper than Featurebase for a product team?',
        answer:
          'It often is once several roles need access, because Featul bills the workspace instead of each seat. Always compare live pricing: Featurebase’s value is the broader suite; Featul’s value is the feedback-to-release loop at a predictable workspace rate.',
      },
    ],
  },
  nolt: {
    description:
      'Compare Nolt and Featul: EU hosting, roadmap, changelog, and an embeddable widget.',
    items: [
      {
        id: 'nolt-1',
        question: 'What’s different between Nolt and Featul?',
        answer:
          'Nolt is great for boards and voting. Featul expands the workflow with roadmap, changelog, and privacy-first hosting in the EU.',
      },
      {
        id: 'nolt-2',
        question: 'Does Featul have EU hosting?',
        answer:
          'Yes EU by default, with GDPR-friendly settings to reduce legal overhead and simplify compliance.',
      },
      {
        id: 'nolt-3',
        question: 'Can I embed feedback capture in my app?',
        answer:
          'Yes. Featul’s embeddable widget gathers context without switching surfaces, improving submission quality and speed.',
      },
      {
        id: 'nolt-4',
        question: 'Do you support roadmap and changelog?',
        answer:
          'Featul includes both. Connect feedback to roadmap items and publish release notes to keep requesters informed.',
      },
      {
        id: 'nolt-5',
        question: 'Is there an API?',
        answer:
          'Yes. Use the API to automate tagging, sync statuses, and integrate with existing tooling.',
      },
      {
        id: 'nolt-6',
        question: 'How do I migrate from Nolt?',
        answer:
          'Import posts and recreate categories, tags, and statuses. We can help align your structure for a smooth transition.',
      },
    ],
  },
  canny: {
    description:
      'Compare Canny alternatives and Canny integrations: EU hosting, Canny import, Slack, webhooks, and API, plus a unified roadmap and changelog.',
    items: [
      {
        id: 'canny-1',
        question: 'What are the best Canny alternatives?',
        answer:
          'Featul is a Canny alternative for teams that want EU hosting, workspace pricing, and one tool for boards, public roadmap, and changelog. You can import existing Canny requests instead of starting from a blank board.',
      },
      {
        id: 'canny-2',
        question: 'What Canny integrations does Featul replace?',
        answer:
          'Most teams looking at Canny integrations need Slack alerts, an API, and webhooks into the rest of the stack. Featul includes Slack notifications, webhooks, and API access, plus a dedicated Canny import so you are not stuck rebuilding history.',
      },
      {
        id: 'canny-3',
        question: 'Can I migrate from Canny to Featul?',
        answer:
          'Yes. Import Canny requests and discussions, then recreate categories and statuses. Larger workspaces can be guided so votes and comment history stay attached to the right posts.',
      },
      {
        id: 'canny-4',
        question: 'Does Featul include roadmap and changelog like Canny?',
        answer:
          'Yes. Featul links feedback to roadmap items and publishes release notes so requesters see progress from planned work through to shipped updates.',
      },
      {
        id: 'canny-5',
        question: 'How do Featul integrations compare to Canny’s catalog?',
        answer:
          'Canny has a longer list of native third-party apps. Featul covers the integrations most product teams actually use daily—Slack, webhooks, and API—and keeps the workflow in one EU-hosted workspace.',
      },
      {
        id: 'canny-6',
        question: 'When should I stay with Canny?',
        answer:
          'Stay if you already depend on a wide set of Canny marketplace integrations and do not need EU-first hosting. Choose Featul if you want a simpler Canny alternative with import, Slack, and a connected changelog.',
      },
      {
        id: 'canny-7',
        question: 'Does Featul have a Canny import?',
        answer:
          'Yes. Import Canny requests and discussions into Featul, then map statuses and tags. That is the integration most switchers need before Slack or webhooks.',
      },
      {
        id: 'canny-8',
        question: 'Can Featul replace Canny plus a separate changelog tool?',
        answer:
          'That is the usual stack we replace: Canny for votes, something else for release notes. Featul keeps boards, roadmap, and changelog together so you are not paying for two products to close the loop.',
      },
    ],
  },
  upvoty: {
    description:
      'Compare Upvoty and Featul: EU hosting and a complete workflow with roadmap and changelog.',
    items: [
      {
        id: 'upvoty-1',
        question: 'How does Featul differ from Upvoty?',
        answer:
          'Upvoty makes voting simple. Featul extends that with roadmap/changelog and EU hosting by default for privacy-focused teams.',
      },
      {
        id: 'upvoty-2',
        question: 'Does Featul have EU hosting and GDPR support?',
        answer:
          'Yes. Privacy defaults and EU hosting help you meet compliance with less effort.',
      },
      {
        id: 'upvoty-3',
        question: 'Can I migrate from Upvoty?',
        answer:
          'You can import feedback and configure tags, statuses, and categories to match your setup. We offer guidance for bigger imports.',
      },
      {
        id: 'upvoty-4',
        question: 'Is there a public roadmap and changelog?',
        answer:
          'Yes. Share your plans and publish release notes to communicate progress clearly and reduce churn.',
      },
      {
        id: 'upvoty-5',
        question: 'Do you provide an API and webhooks?',
        answer:
          'Featul includes an API and webhooks so you can build automations or sync with internal tools.',
      },
      {
        id: 'upvoty-6',
        question: 'What integrations are supported?',
        answer:
          'Slack is supported for quick triage. Use webhooks/API for custom integrations across your stack.',
      },
    ],
  },
}

export function getAlternativeFaq(slug: string): AlternativeFaqs {
  const entry = altFaqs[slug]
  if (entry) return entry

  const generated = buildCompetitorFaqs(slug)
  if (generated) return generated

  return {
    description:
      'Compare any alternative with Featul: EU hosting, migration, and a unified workflow.',
    items: [
      {
        id: 'generic-1',
        question: 'What makes Featul different?',
        answer:
          'Privacy-first EU hosting, simple setup, and an end-to-end workflow—feedback boards, public roadmap, and changelog—kept in sync.',
      },
      {
        id: 'generic-2',
        question: 'Can I migrate my existing feedback?',
        answer:
          'Yes. Import posts and recreate categories, tags, and statuses. We help ensure structure stays consistent.',
      },
      {
        id: 'generic-3',
        question: 'Do you offer a public roadmap and changelog?',
        answer:
          'Featul includes both. Connect feedback to roadmap items and publish release notes to close the loop.',
      },
      {
        id: 'generic-4',
        question: 'Is there an API and integrations?',
        answer:
          'Use the API and webhooks to automate and integrate. Slack is supported for notifications and triage.',
      },
      {
        id: 'generic-5',
        question: 'What about SSO?',
        answer:
          'SSO is supported depending on plan and provider, with common identity setups available.',
      },
      {
        id: 'generic-6',
        question: 'How quickly can I set up Featul?',
        answer:
          'You can start in minutes—enable a board, share a link, or embed our widget to collect feedback in-context.',
      },
    ],
  }
}