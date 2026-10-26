/** Homepage copy, shared by the home components and the `/index.md` twin. */

export const homeHero = {
  /** The H1 renders the second half (`highlight`) in the accent colour. */
  title: "Build what your customers",
  highlight: "actually want.",
  description:
    "Turn customer feedback into your next great feature. Gather ideas, decide what’s next, and bring your customers along as you ship.",
}

export const homeConversion = {
  title: "A better product starts with a closer conversation.",
  description:
    "Make your customers part of what comes next. One connected workflow, from their first idea to your latest release.",
  steps: [
    {
      number: "01",
      label: "Listen",
      title: "Bring the good ideas together.",
      body: "Give customers one place to share requests and vote. Spend less time chasing feedback across chats and spreadsheets.",
    },
    {
      number: "02",
      label: "Decide",
      title: "Know what deserves your time.",
      body: "See which requests have momentum, choose what comes next, and share a roadmap that keeps everyone in the loop.",
    },
    {
      number: "03",
      label: "Deliver",
      title: "Turn a request into a reason to stay.",
      body: "Publish an update when you ship. Help customers discover what’s new and see how their feedback shaped your product.",
    },
  ],
}

export const homeFeatures = {
  title: "Everything you need for",
  highlight: "a closer conversation.",
  description:
    "Collect ideas where customers are, find what matters, and give your team a clear next step. All in one workspace.",
  cards: {
    portal: {
      title: "A feedback space that feels like you.",
      body: "Give ideas, votes, and updates a home on your own domain or Featul address. No code needed—just share the link.",
      href: "/docs/getting-started",
    },
    widget: {
      title: "Catch ideas right inside your app.",
      body: "Add the widget with a small snippet. Customers can share feedback and follow updates without leaving your product.",
      href: "/docs/getting-started/widget",
    },
    status: {
      title: "You control what gets prioritized.",
      body: "Move requests from pending to planned, in progress, and shipped. Your team decides what happens next.",
    },
    similar: {
      title: "Find the ideas already in motion.",
      body: "Show customers similar posts as they write, so they can join an existing conversation before starting a new one.",
    },
    merge: {
      title: "Keep one thread per idea.",
      body: "When people ask for the same thing in different words, merge the posts so votes and comments live in one place.",
    },
    discussion: {
      title: "Keep the team thread private.",
      body: "Leave internal comments and mention teammates without showing that discussion on the public board.",
    },
  },
} satisfies {
  title: string
  highlight: string
  description: string
  cards: Record<string, { title: string; body: string; href?: string }>
}

export const homeAccess = {
  title: "Make it easy for customers to take part.",
  description:
    "Meet customers on your own domain, welcome their ideas, and give them a clear view of what’s coming. You choose how open the conversation should be.",
  items: [
    {
      name: "Your Featul subdomain",
      description:
        "Every workspace gets a public URL such as yourproduct.featul.com as soon as it exists. Share that link — it is the customer page, not the admin dashboard.",
    },
    {
      name: "Your own domain",
      description:
        "Point feedback.yourbrand.com at the same portal. Customers stay on your brand; both URLs serve the public site.",
    },
    {
      name: "Browse, vote, and submit",
      description:
        "People open the subdomain, pick a board, vote on ideas, and send a new request. No workspace login required.",
    },
    {
      name: "Roadmap and changelog",
      description:
        "The same public page can show what you plan to build and what already shipped, so the loop is visible without a second tool.",
    },
    {
      name: "Private boards stay off it",
      description:
        "Give a key account their own board. Private boards never appear in public navigation. Your team still sees the full picture.",
    },
    {
      name: "Guest and anonymous",
      description:
        "Let people vote and submit without creating an account, and mask names when a public board should not show identities.",
    },
  ],
}

export const homeIntegrations = {
  title: "Integrate with your favorite tools",
  description:
    "Connect notifications, imports, and migration paths so feedback stays close to the tools your team already uses.",
  items: [
    { slug: "slack", name: "Slack", description: "Get instant Slack alerts when new requests are submitted." },
    { slug: "discord", name: "Discord", description: "Send feedback notifications directly into your Discord channels." },
    { slug: "notra", name: "Notra", description: "Import Notra changelog entries to keep product updates synced." },
    { slug: "nolt", name: "Nolt", description: "Import requests and comments from Nolt into Featul." },
    { slug: "canny", name: "Canny", description: "Bring feature requests and comments over from Canny." },
    { slug: "productboard", name: "ProductBoard", description: "Migrate posts, boards, and comments from ProductBoard." },
  ],
}

export const homeFaq = {
  title: "Questions & Answers",
  description:
    "Get the essentials of feedback management and see how Featul helps you ship better products.",
}

export const homeCta = {
  title: "Your next great feature starts with listening.",
  description:
    "Give your customers a voice and your team a clear next step. Create your free workspace and start the conversation today.",
}

export const pricingCopy = {
  title: "Pricing that grows",
  highlight: "with your team.",
  description:
    "Start free, then move into simple flat-workspace plans for early and growing product teams.",
  trialNote: "One trial per account. No credit card required.",
  yearlyNote: "2 months free. Billed annually. Cancel anytime.",
}
