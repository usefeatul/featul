import type { FaqItem } from '@/data/faqs'

export type AlternativeFaqs = {
  description: string
  items: FaqItem[]
}

export const altFaqs: Record<string, AlternativeFaqs> = {
  userjot: {
    description:
      'Compare UserJot and oreilla: EU hosting by default, complete workflow with boards, roadmap and changelog, easy migration.',
    items: [
      {
        id: 'userjot-1',
        question: 'What’s the key difference between UserJot and oreilla?',
        answer:
          'UserJot focuses on lightweight feedback capture. oreilla adds a complete workflow—feedback boards, public roadmap, and changelog—plus privacy-first defaults.',
      },
      {
        id: 'userjot-2',
        question: 'Does oreilla provide EU hosting by default?',
        answer:
          'Yes. oreilla prioritizes EU hosting and GDPR-friendly settings out of the box, helping teams meet regional compliance requirements.',
      },
      {
        id: 'userjot-3',
        question: 'Can I migrate data from UserJot to oreilla?',
        answer:
          'You can import posts and set up categories, statuses, and tags to mirror your existing structure. Our team can guide larger migrations.',
      },
      {
        id: 'userjot-4',
        question: 'How do voting and boards compare?',
        answer:
          'Both support voting and boards. oreilla adds prioritization tools (tags, segments) and links feedback directly to roadmap items.',
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
          'oreilla integrates with Slack and offers webhooks/API for custom workflows. SSO is supported depending on plan and setup.',
      },
    ],
  },
  featurebase: {
    description:
      'Compare Featurebase and oreilla: EU hosting, privacy defaults, unified roadmap and changelog.',
    items: [
      {
        id: 'featurebase-1',
        question: 'How does oreilla differ from Featurebase?',
        answer:
          'Both offer strong feedback and voting. oreilla adds privacy-first defaults, EU hosting by default, and a unified roadmap–changelog workflow.',
      },
      {
        id: 'featurebase-2',
        question: 'Does oreilla focus on EU hosting and privacy?',
        answer:
          'Yes. oreilla provides EU hosting and sensible GDPR-aligned controls without heavy configuration, ideal for privacy-conscious teams.',
      },
      {
        id: 'featurebase-3',
        question: 'Can I migrate from Featurebase?',
        answer:
          'You can import feedback and recreate categories, tags, and statuses. For complex migrations, we offer guidance to keep structure intact.',
      },
      {
        id: 'featurebase-4',
        question: 'Does oreilla include roadmap and changelog?',
        answer:
          'Yes. Link feedback to roadmap items and publish release notes so customers understand what shipped and why.',
      },
      {
        id: 'featurebase-5',
        question: 'Is SSO available?',
        answer:
          'SSO is available depending on plan and provider. oreilla supports common identity setups for streamlined authentication.',
      },
      {
        id: 'featurebase-6',
        question: 'What integrations can I use?',
        answer:
          'Slack notifications are built-in. Use webhooks and the API to sync issues, statuses, or trigger automations in your stack.',
      },
    ],
  },
  nolt: {
    description:
      'Compare Nolt and oreilla: EU hosting, roadmap, changelog, and an embeddable widget.',
    items: [
      {
        id: 'nolt-1',
        question: 'What’s different between Nolt and oreilla?',
        answer:
          'Nolt is great for boards and voting. oreilla expands the workflow with roadmap, changelog, and privacy-first hosting in the EU.',
      },
      {
        id: 'nolt-2',
        question: 'Does oreilla have EU hosting?',
        answer:
          'Yes EU by default, with GDPR-friendly settings to reduce legal overhead and simplify compliance.',
      },
      {
        id: 'nolt-3',
        question: 'Can I embed feedback capture in my app?',
        answer:
          'Yes. oreilla’s embeddable widget gathers context without switching surfaces, improving submission quality and speed.',
      },
      {
        id: 'nolt-4',
        question: 'Do you support roadmap and changelog?',
        answer:
          'oreilla includes both. Connect feedback to roadmap items and publish release notes to keep requesters informed.',
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
      'Compare Canny and oreilla: EU hosting by default and a streamlined workflow.',
    items: [
      {
        id: 'canny-1',
        question: 'What’s the biggest difference from Canny?',
        answer:
          'oreilla emphasizes EU hosting and privacy-first defaults while keeping the workflow simple—boards, roadmap, and changelog linked together.',
      },
      {
        id: 'canny-2',
        question: 'Is EU hosting supported?',
        answer:
          'Yes. oreilla provides EU hosting by default to help meet regional privacy and residency requirements.',
      },
      {
        id: 'canny-3',
        question: 'Can I migrate from Canny?',
        answer:
          'We support importing feedback and reconstructing categories and statuses. Larger migrations can be guided to preserve data fidelity.',
      },
      {
        id: 'canny-4',
        question: 'Do you include roadmap and changelog?',
        answer:
          'Yes. oreilla links feedback to roadmap items and makes publishing release notes effortless to close the loop.',
      },
      {
        id: 'canny-5',
        question: 'Is SSO available?',
        answer:
          'SSO is supported depending on plan and provider. oreilla integrates cleanly with common identity systems.',
      },
      {
        id: 'canny-6',
        question: 'What about integrations?',
        answer:
          'Slack, webhooks, and API are available for notification, sync, and automation across your tooling.',
      },
    ],
  },
  upvoty: {
    description:
      'Compare Upvoty and oreilla: EU hosting and a complete workflow with roadmap and changelog.',
    items: [
      {
        id: 'upvoty-1',
        question: 'How does oreilla differ from Upvoty?',
        answer:
          'Upvoty makes voting simple. oreilla extends that with roadmap/changelog and EU hosting by default for privacy-focused teams.',
      },
      {
        id: 'upvoty-2',
        question: 'Does oreilla have EU hosting and GDPR support?',
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
          'oreilla includes an API and webhooks so you can build automations or sync with internal tools.',
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
  return {
    description:
      'Compare any alternative with oreilla: EU hosting, migration, and a unified workflow.',
    items: [
      {
        id: 'generic-1',
        question: 'What makes oreilla different?',
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
          'oreilla includes both. Connect feedback to roadmap items and publish release notes to close the loop.',
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
        question: 'How quickly can I set up oreilla?',
        answer:
          'You can start in minutes—enable a board, share a link, or embed our widget to collect feedback in-context.',
      },
    ],
  }
}