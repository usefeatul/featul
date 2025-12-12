export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    id: "item-1",
    question: "How quickly can I start collecting feedback?",
    answer:
      "You can start in minutes. Add the oreilla widget, share a feedback link, or enable a public board—no complex setup required.",
  },
  {
    id: "item-2",
    question: "Can I customize the feedback experience?",
    answer:
      "Yes. Tailor colors, logo, categories, statuses, and required fields. You control whether posts are public, private, or require sign-in.",
  },
  {
    id: "item-3",
    question: "What if I receive too much feedback?",
    answer:
      "Use tags, filters, and voting to surface what matters. Merge duplicates and group similar requests so the backlog stays tidy.",
  },
  {
    id: "item-4",
    question: "How does oreilla help prioritize user feedback?",
    answer:
      "Sort by votes, impact, or segment (plan, customer size, etc.). Link feedback to roadmap items and track progress from “Planned” to “Done.”",
  },
  {
    id: "item-5",
    question: "Can oreilla help reduce customer churn?",
    answer:
      "Close the loop by updating requesters automatically when features ship. Share clear roadmaps and release notes to build trust and retention.",
  },
  {
    id: "item-6",
    question: "Is oreilla suitable for SaaS companies?",
    answer:
      "Absolutely. Product, support, and success teams use oreilla to centralize feedback, align priorities, and communicate updates transparently.",
  },
  {
    id: "item-7",
    question: "Can I use oreilla as a product roadmap tool?",
    answer:
      "Yes. Create roadmap items with statuses like Planned, In Progress, and Released. Connect them to feedback to show why each item matters.",
  },
  {
    id: "item-8",
    question: "Does oreilla offer feedback tracking?",
    answer:
      "Track every request from submission to resolution. See who asked, how many voted, and the current status at a glance.",
  },
  {
    id: "item-9",
    question: "Can I create a product changelog with oreilla?",
    answer:
      "Yes. Publish release notes directly from your completed items so customers can follow improvements without digging through tickets.",
  },
  {
    id: "item-10",
    question: "How can oreilla improve customer experience management?",
    answer:
      "Unify input from users and teams, prioritize by impact, and communicate decisions clearly—so customers feel heard and guided.",
  },
  {
    id: "item-11",
    question: "Does oreilla support guest or anonymous feedback?",
    answer:
      "Yes. Allow anonymous posts or require email/sign-in based on your privacy needs. You can toggle this at any time.",
  },
  {
    id: "item-12",
    question: "Can I customize oreilla to match my brand?",
    answer:
      "Apply brand colors, typography, and your logo. Use a custom domain for public boards to create a seamless, on-brand experience.",
  },
  {
    id: "item-13",
    question: "What integrations does oreilla offer?",
    answer:
      "Connect with popular tools like Slack and issue trackers. Use webhooks to sync feedback or trigger workflows in your stack.",
  },
];