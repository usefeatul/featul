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
      "A workspace and public board can be live in a few minutes. Share your Featul subdomain, connect a custom domain on a paid plan, or add the in-app widget. No code is required to start with a link.",
  },
  {
    id: "item-2",
    question: "Can I customize the feedback experience?",
    answer:
      "Yes. Each board can be public or private, allow guest submissions, allow comments, and hide member names on the public portal. Paid plans add branding (logo, colors, and layout) and a custom domain. You can also rename roadmap statuses. Featul does not offer custom form fields or typography controls.",
  },
  {
    id: "item-3",
    question: "What if I receive too much feedback?",
    answer:
      "Tag requests, filter the board, and sort by votes so the loudest themes rise first. Merge duplicate posts so votes and comments roll into one thread. Internal comments stay off the public board while your team decides what to do.",
  },
  {
    id: "item-4",
    question: "How does Featul help prioritize user feedback?",
    answer:
      "Unique votes show real demand. Merge similar requests, then move approved work onto the public roadmap with statuses such as Planned, Progress, and Completed. Featul does not score impact or segment voters by plan or company size.",
  },
  {
    id: "item-5",
    question: "Can Featul help reduce customer churn?",
    answer:
      "When a request changes status, Featul can email the author and people who voted. Publish a changelog in the same workspace so customers see what shipped. That closes the loop without a separate status page.",
  },
  {
    id: "item-6",
    question: "Is Featul suitable for SaaS companies?",
    answer:
      "Yes. It is built for product teams that collect feature requests, share a public roadmap, and publish changelogs in one EU-hosted workspace. Free includes a portal, voting, comments, the widget, and guest feedback. Paid plans add branding, a custom domain, and integrations.",
  },
  {
    id: "item-7",
    question: "Can I use Featul as a product roadmap tool?",
    answer:
      "Yes. Every workspace includes a roadmap board. Default statuses include Pending, Review, Planned, Progress, Completed, and Closed, and you can rename them. Customers only see what you move onto the public roadmap after you review it.",
  },
  {
    id: "item-8",
    question: "Does Featul offer feedback tracking?",
    answer:
      "Yes. Each request keeps its votes, comments, tags, and status. You can see who submitted it (unless you mask identities), merge it into another post, and follow it from the board through the roadmap and changelog.",
  },
  {
    id: "item-9",
    question: "Can I create a product changelog with Featul?",
    answer:
      "Yes. Publish changelog entries in the same workspace, with tags and a public changelog page. Entries are written and published by your team. They are not created automatically from a roadmap status change.",
  },
  {
    id: "item-10",
    question: "How can Featul improve customer experience management?",
    answer:
      "Put requests, votes, and comments in one board instead of spreadsheets and chat. Review before anything hits the roadmap, discuss internally, then tell voters when status changes and publish a changelog when the work ships.",
  },
  {
    id: "item-11",
    question: "Does Featul support guest or anonymous feedback?",
    answer:
      "Yes. Boards can allow guests to submit and vote without an account, or you can require sign-in. You can also hide member identities on a public board. Guest and anonymous feedback is included on Free.",
  },
  {
    id: "item-12",
    question: "Can I customize Featul to match my brand?",
    answer:
      "On Starter and Professional you can set logo, colors, layout, hide Powered by Featul, and use a custom domain. Branding is not included on Free. Fonts are not customizable.",
  },
  {
    id: "item-13",
    question: "What integrations does Featul offer?",
    answer:
      "Paid plans can send Slack and Discord alerts when new requests arrive, and import changelog entries from Notra. Canny, Nolt, and ProductBoard imports are coming soon. Featul does not connect to issue trackers or generic workflow webhooks.",
  },
];
