import type { UseCaseEntry } from "./matrix";

export type UseCaseCopy = {
  intro: string;
  description: string;
  painDetails: string[];
  solutionDetails: string[];
  faqs: { question: string; answer: string }[];
};

export const USE_CASE_COPY: Record<string, UseCaseCopy> = {
  "saas-product-feedback": {
    intro:
      "SaaS product managers use Featul when feedback lives in email, Slack, and tickets at the same time. A public board, vote-weighted roadmap, and changelog give customers one place to request, follow, and see what shipped.",
    description:
      "See how SaaS product managers centralize feedback, score requests, and close the loop with a public roadmap and changelog in Featul.",
    painDetails: [
      "Support, sales, and product each keep a private list, so the same request is rebuilt three times and nothing is the source of truth.",
      "Without votes and account context, the loudest Slack thread looks like the biggest opportunity.",
      "Customers who asked for a feature never hear that it shipped, so they churn while the changelog sits in a docs repo.",
    ],
    solutionDetails: [
      "One board collects widget, email, and imported requests so duplicates collapse instead of competing.",
      "Priority scoring uses votes plus customer value, not whichever request arrived in the CEO’s inbox.",
      "Changelog entries can point back at the original posts so voters see the loop close.",
    ],
    faqs: [
      {
        question: "Is Featul a product feedback platform for SaaS teams?",
        answer:
          "Yes. Featul is built for SaaS product teams that need boards, a public roadmap, and a changelog in one EU-hosted workspace.",
      },
      {
        question: "Can we import existing SaaS feedback?",
        answer:
          "Yes. Start from CSV or competitor imports, then invite the team and share a branded board. Most teams are collecting votes the same day.",
      },
      {
        question: "How does Featul help prioritize SaaS feature requests?",
        answer:
          "Combine unique votes with tags and customer context, then promote work to a public roadmap. Use RICE when votes alone are not enough.",
      },
    ],
  },
  "b2b-customer-feedback": {
    intro:
      "B2B product owners lose deals when a high-ARR account feels unheard. Featul gives those accounts a private board, lets you weight requests by ARR, and keeps sales aligned with a public roadmap instead of side promises.",
    description:
      "Learn how B2B teams use Featul to weight feature requests by ARR, protect key accounts, and keep sales, success, and product on one roadmap.",
    painDetails: [
      "A $200k customer asks in a QBR while forty free-tier users upvote something else. Without ARR on the request, the board lies.",
      "Sales commits a date in a deck that product never saw, then support inherits the angry thread.",
      "Missing a must-have for one logo can wipe more ARR than a hundred small votes would ever represent.",
    ],
    solutionDetails: [
      "Private boards keep strategic accounts from dumping sensitive requests on a public voting wall.",
      "Attach ARR to posts so roadmap scoring reflects revenue at risk, then check the number with the ARR calculator.",
      "Status updates on the roadmap give sales a URL instead of a screenshot from last quarter’s deck.",
    ],
    faqs: [
      {
        question: "Can Featul weight B2B feedback by ARR?",
        answer:
          "Yes. Treat ARR as context on the request, not as a vanity metric. Combine it with unique votes so a loud free cohort cannot outrank a flagship account. Use the ARR calculator if you need the annualized number first.",
      },
      {
        question: "Is Featul right for B2B product teams?",
        answer:
          "Yes. B2B teams use Featul for private key-account boards, a shared roadmap sales can link, and changelogs that close the loop with the people who asked.",
      },
      {
        question: "How do we stop sales from promising unscoped features?",
        answer:
          "Give sales a public or shared roadmap URL and a way to file requests into the same board product uses. Promises become posts with status, not slides.",
      },
    ],
  },
  "open-source-roadmap": {
    intro:
      "Open source maintainers drown in GitHub Issues that mix bugs, questions, and feature wishes. Featul gives the community a voting board and a public roadmap without turning every +1 comment into another issue.",
    description:
      "See how open source maintainers use Featul as a public roadmap and feature voting board separate from GitHub Issues.",
    painDetails: [
      "Feature requests in Issues compete with crash reports, so maintainers triage noise instead of direction.",
      "A vocal minority comments daily while quiet users who actually ship patches never vote.",
      "People who are not contributors cannot see what is planned unless they live in the repo.",
    ],
    solutionDetails: [
      "A dedicated voting board sits beside GitHub so Issues can stay focused on bugs and PRs.",
      "Unique votes and a bias check show whether demand is broad or just a few loud accounts.",
      "A public roadmap explains Planned, In Progress, and Shipped without promising dates the project cannot keep.",
    ],
    faqs: [
      {
        question: "Is Featul an open source product feedback tool?",
        answer:
          "Featul itself is MIT-licensed and self-hostable, and this use case is built for maintainers who want a public roadmap without turning GitHub Issues into a voting app.",
      },
      {
        question: "Can the community vote without a GitHub account?",
        answer:
          "Yes. Share a public board. Visitors can browse and vote without cloning the repo or opening an issue they will never see again.",
      },
      {
        question: "How is this different from a Featurebase alternative for OSS?",
        answer:
          "You get the same board-plus-roadmap loop, with the option to self-host. That matters when the project cannot put community data on a closed vendor.",
      },
    ],
  },
  "feature-voting-board": {
    intro:
      "Product managers launch a feature voting board when they cannot tell popularity from a vocal minority. Featul captures unique votes, comments, and a path onto the public roadmap so the board is not a graveyard of ideas.",
    description:
      "Set up a customer feature voting board with unique votes, comments, and a path from popular requests to a public roadmap.",
    painDetails: [
      "Comments feel like demand, but you cannot see how many unique customers actually want the work.",
      "Power users upvote everything. Raw totals then overstate a feature that the wider base never asked for.",
      "There is no fair way to say no, so every request stays “maybe” forever.",
    ],
    solutionDetails: [
      "Public voting with unique voters, not anonymous score inflation.",
      "Comments stay attached to the post so qualitative “why” sits next to the count.",
      "Promote scored work to Planned on the roadmap, then changelog it when it ships.",
    ],
    faqs: [
      {
        question: "How does a Featul feature voting board work?",
        answer:
          "Customers submit or browse requests, cast unique votes, and comment. You tag, merge duplicates, and move winning items onto a public roadmap.",
      },
      {
        question: "How do we avoid voting bias?",
        answer:
          "Compare unique voters to total upvotes with the voting bias checker before a popular post becomes a roadmap commitment.",
      },
      {
        question: "Can we run a private voting board?",
        answer:
          "Yes. Use a branded portal with access control when the backlog should not be public, then still publish a high-level roadmap.",
      },
    ],
  },
  "customer-feedback-portal": {
    intro:
      "Customer success teams need one portal when feedback arrives from ten channels. Featul is that portal: branded board, status updates to the submitter, and a changelog when the work ships.",
    description:
      "Stand up a branded customer feedback portal so success, support, and product share one backlog and close the loop automatically.",
    painDetails: [
      "The same bug is filed in Intercom, email, and a spreadsheet. Nobody knows which copy is canonical.",
      "Success cannot point a customer at “the list” because there is no list.",
      "Submitters never learn the status, so they file it again next quarter.",
    ],
    solutionDetails: [
      "One board becomes the source of truth; imports and the widget feed it.",
      "Custom branding makes the portal feel like your product, not a third-party form.",
      "Status changes notify the people who asked, which is what actually closes the loop.",
    ],
    faqs: [
      {
        question: "How fast can we launch a customer feedback portal?",
        answer:
          "Create a workspace, connect a subdomain or custom domain, and share the board. Most teams do this in a single sitting.",
      },
      {
        question: "Can the portal match our brand?",
        answer:
          "Yes. Featul supports branding controls so the portal looks like your product, not a generic widget.",
      },
      {
        question: "Will submitters get status updates?",
        answer:
          "Yes. When you change status or ship a changelog entry linked to their request, they can see progress without a manual email.",
      },
    ],
  },
};

export function fallbackUseCaseCopy(useCase: UseCaseEntry): UseCaseCopy {
  const persona = useCase.persona || "product";
  const industry = useCase.industry || "modern";
  const firstPain = useCase.painPoints[0] ?? "scattered feedback";
  const firstSolution = useCase.solutions[0] ?? "a shared feedback board";

  return {
    intro: `${persona}s on ${industry} teams use Featul for ${useCase.title.toLowerCase()}. The usual starting point is “${firstPain}”, then ${firstSolution.toLowerCase()} with a roadmap and changelog that stay in sync.`,
    description: `See how ${persona}s in ${industry} use Featul for ${useCase.title.toLowerCase()}. Unique workflow from the real pain points through boards, roadmap, and changelog.`,
    painDetails: useCase.painPoints.map(
      (problem) =>
        `Left open, this stalls ${persona}s: ${problem.charAt(0).toLowerCase()}${problem.slice(1)} turns into duplicate work and a roadmap nobody trusts.`,
    ),
    solutionDetails: useCase.solutions.map(
      (solution) =>
        `${solution}. That gives ${persona}s a visible path from request to shipped update instead of another disconnected list.`,
    ),
    faqs: [
      {
        question: `Is Featul right for ${industry} ${persona.toLowerCase()}s?`,
        answer: `Yes. Featul is built for ${persona.toLowerCase()}s who need to centralize feedback, share a roadmap, and publish changelogs in one privacy-first workspace.`,
      },
      {
        question: `How does Featul solve “${firstPain}”?`,
        answer: `${firstSolution} in Featul, then keep status on a public or shared roadmap so the team is not reconciling five tools.`,
      },
      {
        question: "How quickly can we start?",
        answer:
          "Most teams stand up a branded board in minutes, invite colleagues, and import or capture the first requests the same day.",
      },
    ],
  };
}
