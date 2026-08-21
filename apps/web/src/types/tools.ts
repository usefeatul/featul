export type ToolContentSection = {
  title: string;
  body: string;
  code?: string;
};

export type ToolItem = {
  slug: string;
  name: string;
  description: string;
  isNew?: boolean;
  contentSections?: ToolContentSection[];
};

export type ToolCategory = {
  slug: string;
  name: string;
  description: string;
  tools: ToolItem[];
};

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    slug: "feedback-roadmaps",
    name: "Feedback, Roadmaps & Changelogs",
    description: "Prioritize votes, plan public roadmaps, and write changelogs.",
    tools: [
      {
        slug: "rice-prioritization-calculator",
        name: "RICE Prioritization Calculator",
        description:
          "Score feature requests with Reach, Impact, Confidence, and Effort so votes become a ranked backlog.",
        isNew: true,
        contentSections: [
          {
            title: "What is RICE?",
            body: "RICE is a feature prioritization score used by product teams to compare ideas from feedback boards before they hit the roadmap.",
          },
          {
            title: "Basic formula",
            body: "Multiply reach, impact, and confidence, then divide by effort in person-months.",
            code: "RICE = (Reach × Impact × Confidence) / Effort",
          },
          {
            title: "When to use",
            body: "Use RICE when feature votes, customer interviews, and engineering estimates all matter—not votes alone.",
          },
        ],
      },
      {
        slug: "changelog-generator",
        name: "Changelog Generator",
        description:
          "Turn shipped work into customer-facing release notes in Keep a Changelog format.",
        isNew: true,
        contentSections: [
          {
            title: "What is a changelog generator?",
            body: "A changelog generator formats shipped features, fixes, and changes into release notes your customers can scan.",
          },
          {
            title: "How to write a changelog",
            body: "Group items as Added, Changed, or Fixed. Use one line per item and a version plus date.",
            code: "## [version] - YYYY-MM-DD",
          },
          {
            title: "When to use",
            body: "Publish notes when you move roadmap items to Released so voters see the loop closed.",
          },
        ],
      },
      {
        slug: "feature-voting-bias-calculator",
        name: "Feature Voting Bias Checker",
        description:
          "Compare unique voters to total upvotes and spot power-user skew on a public board.",
        isNew: true,
        contentSections: [
          {
            title: "What is voting bias?",
            body: "Voting bias happens when a few loud users cast many votes, so total upvotes overstate demand.",
          },
          {
            title: "Basic formula",
            body: "Votes per unique voter and the share of votes from your top cohort show concentration.",
            code: "votes per voter = total votes / unique voters",
          },
          {
            title: "When to use",
            body: "Check bias before promoting a highly voted request onto the public roadmap.",
          },
        ],
      },
      {
        slug: "public-feedback-board-checklist",
        name: "Public Feedback Board Checklist",
        description:
          "Check anonymous voting, moderation, and GDPR settings before you launch a public board.",
        isNew: true,
        contentSections: [
          {
            title: "What is a public feedback board?",
            body: "A public board lets customers submit and vote on feature requests with optional anonymity and moderation.",
          },
          {
            title: "How to launch safely",
            body: "Confirm unique votes, PII handling, status updates, and EU/GDPR notices before going live.",
            code: "checklist score = completed items / total items",
          },
          {
            title: "When to use",
            body: "Run this before sharing a board URL or embedding a widget on your product site.",
          },
        ],
      },
      {
        slug: "roadmap-status-template",
        name: "Public Roadmap Status Template",
        description:
          "Generate Planned, In Progress, and Shipped copy for a customer-facing roadmap.",
        isNew: true,
        contentSections: [
          {
            title: "What is a public roadmap template?",
            body: "A status template gives product teams consistent columns and customer-facing copy for a public roadmap.",
          },
          {
            title: "How to structure statuses",
            body: "Keep statuses simple: Planned, In Progress, and Shipped. Avoid dates that become promises.",
            code: "Planned → In Progress → Shipped",
          },
          {
            title: "When to use",
            body: "Use this when you first publish a roadmap or migrate statuses from a spreadsheet.",
          },
        ],
      },
      {
        slug: "feedback-vote-confidence-calculator",
        name: "Feedback Vote Confidence Calculator",
        description:
          "Estimate how many unique votes a feature request needs before you treat demand as reliable.",
        isNew: true,
        contentSections: [
          {
            title: "What is vote confidence?",
            body: "Vote confidence is a sample-size style check: how many unique voters you need from your user base.",
          },
          {
            title: "Basic formula",
            body: "Use a finite-population sample size with your chosen confidence level and margin of error.",
            code: "n = (Z² × p × (1 − p)) / E², then finite population correction",
          },
          {
            title: "When to use",
            body: "Use this when a request has a handful of votes and you need to know whether to wait or ship.",
          },
        ],
      },
      {
        slug: "nps-follow-up-planner",
        name: "NPS Follow-up Planner",
        description:
          "Turn promoters, passives, and detractors into interview counts and feedback-board prompts.",
        isNew: true,
        contentSections: [
          {
            title: "What is an NPS follow-up planner?",
            body: "It converts NPS buckets into close-the-loop actions: interviews, board posts, and changelog updates.",
          },
          {
            title: "Basic formula",
            body: "NPS is promoters minus detractors as a share of responses. Follow-up volume scales with each bucket.",
            code: "NPS = % promoters − % detractors",
          },
          {
            title: "When to use",
            body: "Run this after an NPS survey so scores become product feedback instead of a dashboard number.",
          },
        ],
      },
      {
        slug: "duplicate-feedback-estimator",
        name: "Duplicate Feedback Estimator",
        description:
          "Estimate unique themes after grouping duplicate feature requests from tickets and boards.",
        isNew: true,
        contentSections: [
          {
            title: "What is duplicate feedback?",
            body: "Customers often file the same idea many times. Deduping reveals the real theme count for the roadmap.",
          },
          {
            title: "Basic formula",
            body: "Unique themes equal raw requests times one minus the duplicate rate, then subtract already merged items.",
            code: "unique themes = raw requests × (1 − duplicate rate) − already merged",
          },
          {
            title: "When to use",
            body: "Use this during triage before you score requests with RICE or open a public vote.",
          },
        ],
      },
    ],
  },
  // Product & Feature Analytics — 2 tools
  {
    slug: "product-feature-analytics",
    name: "Product & Feature Analytics",
    description: "Evaluate feature adoption and retention across cohorts.",
    tools: [
      {
        slug: "feature-adoption-calculator",
        name: "Feature Adoption",
        description: "Estimate feature adoption rates by cohort.",
      },
      {
        slug: "cohort-analysis",
        name: "Cohort Analysis",
        description: "Analyze retention by signup month and usage.",
      },
      {
        slug: "stickiness-calculator",
        name: "Stickiness",
        description: "Estimate DAU/MAU stickiness to gauge habit formation.",
        isNew: true,
      },
      {
        slug: "ttfv-calculator",
        name: "Time to First Value (TTFV)",
        description:
          "Measure the share of new users achieving first value within a window.",
        isNew: true,
      },
      {
        slug: "feature-usage-frequency",
        name: "Feature Usage Frequency",
        description:
          "Calculate average feature uses per active user in a period.",
        isNew: true,
      },
    ],
  },
  // Revenue & Growth — 5 tools
  {
    slug: "revenue-growth",
    name: "Revenue & Growth",
    description: "Monitor subscription revenue and growth performance.",

    tools: [
      {
        slug: "mrr-calculator",
        name: "MRR calculator",
        description: "Compute monthly recurring revenue and model growth.",
        isNew: true,
        contentSections: [
          {
            title: "What is MRR?",
            body: "Monthly Recurring Revenue (MRR) measures predictable subscription revenue within a month.",
          },
          {
            title: "Basic formula",
            body: "MRR = Sum of all active subscription revenue for the month",
            code: "MRR = sum(active subscriptions for the month)",
          },
        ],
      },
      {
        slug: "arr-calculator",
        name: "ARR calculator",
        description:
          "Annualize recurring revenue and assess year-over-year growth.",
      },
      {
        slug: "growth-rate-calculator",
        name: "Growth Rate",
        description: "Measure period growth and compound annual rate.",
      },
      {
        slug: "arpu-calculator",
        name: "ARPU",
        description: "Calculate average revenue per user.",
      },
      {
        slug: "ltv-calculator",
        name: "LTV",
        description: "Estimate lifetime value using churn and ARPU.",
      },
      {
        slug: "quick-ratio",
        name: "Quick Ratio",
        description: "Measure SaaS growth efficiency with the Quick Ratio.",
        isNew: true,
      },
      {
        slug: "net-revenue-retention",
        name: "Net Revenue Retention",
        description: "Calculate dollar-based net retention from existing customers.",
        isNew: true,
      },
    ],
  },
  // Customer Metrics — 7 tools
  {
    slug: "customer-metrics",
    name: "Customer Metrics",
    description:
      "Measure acquisition efficiency, activation, retention, and customer value.",
    tools: [
      {
        slug: "churn-calculator",
        name: "Churn calculator",
        description: "Calculate customer and revenue churn rates.",
        contentSections: [
          {
            title: "Customer churn",
            body: "Customer churn rate = (Customers lost during period ÷ Customers at start of period) × 100%",
          },
          {
            title: "Revenue churn",
            body: "Revenue churn rate = (MRR lost from churn ÷ MRR at start of period) × 100%",
          },
        ],
      },
      {
        slug: "nps-calculator",
        name: "NPS calculator",
        description: "Compute Net Promoter Score by cohort.",
        isNew: true,
        contentSections: [
          {
            title: "What is NPS?",
            body: "Net Promoter Score (NPS) measures customer loyalty based on 0–10 ratings.",
          },
          {
            title: "Calculation",
            body: "NPS = % Promoters (9–10) − % Detractors (0–6)",
          },
        ],
      },
      {
        slug: "cac-calculator",
        name: "CAC",
        description: "Determine cost to acquire a customer.",
      },
      {
        slug: "cltv-cac-ratio",
        name: "CLTV/CAC Ratio",
        description: "Compare lifetime value to acquisition cost.",
      },
      {
        slug: "activation-rate",
        name: "Activation Rate",
        description: "Measure onboarding completion rate.",
      },
      {
        slug: "retention-rate",
        name: "Retention Rate",
        description: "Measure user retention between periods.",
      },
      {
        slug: "customer-cohort-analysis",
        name: "Customer Cohorts",
        description: "Analyze retention and engagement over time.",
      },
    ],
  },
  // Financial Health — 9 tools
  {
    slug: "financial-health",
    name: "Financial Health",
    description: "Track cash position, margins, burn, and runway.",
    tools: [
      {
        slug: "runway-calculator",
        name: "Runway",
        description: "Estimate months of runway from cash and burn.",
      },
      {
        slug: "gross-margin-calculator",
        name: "Gross Margin",
        description: "Calculate gross margin percentage.",
        isNew: true,
      },
      {
        slug: "burn-rate-calculator",
        name: "Burn Rate",
        description: "Compute monthly net cash burn.",
      },
      {
        slug: "net-margin-calculator",
        name: "Net Margin",
        description: "Calculate net margin percentage.",
      },
      {
        slug: "cashflow-analyzer",
        name: "Cash Flow",
        description: "Summarize operating, investing, financing cash flows.",
      },
      {
        slug: "payback-period",
        name: "Payback Period",
        description: "Calculate CAC payback period in months.",
      },
      {
        slug: "break-even-analysis",
        name: "Break-even",
        description: "Determine revenue or units to break even.",
      },
      {
        slug: "operating-expense-ratio",
        name: "OpEx Ratio",
        description: "Operating expenses as a share of revenue.",
        isNew: true,
      },
      {
        slug: "revenue-per-employee",
        name: "Revenue per Employee",
        description: "Revenue divided by headcount.",
      },
    ],
  },
  // Pricing & Valuation — 7 tools
  {
    slug: "pricing-valuation",
    name: "Pricing & Valuation",
    description: "Analyze pricing strategies and estimate enterprise value.",
    tools: [
      {
        slug: "price-elasticity",
        name: "Price Elasticity",
        description: "Estimate demand sensitivity to price changes.",
        isNew: true,
      },
      {
        slug: "value-based-pricing",
        name: "Value-based Pricing",
        description: "Price according to perceived customer value.",
      },
      {
        slug: "saas-valuation",
        name: "SaaS Valuation",
        description: "Estimate valuation using revenue multiples.",
      },
      {
        slug: "freemium-conversion-rate",
        name: "Freemium Conversion",
        description: "Estimate free‑to‑paid conversion rate.",
      },
      {
        slug: "discount-impact",
        name: "Discount Impact",
        description: "Model revenue effects of discounts by tier.",
      },
      {
        slug: "tier-pricing-optimizer",
        name: "Tier Pricing Optimizer",
        description: "Optimize plan tiers and price points.",
      },
      {
        slug: "willingness-to-pay",
        name: "WTP Survey",
        description: "Analyze willingness‑to‑pay survey data.",
        isNew: true,
      },
    ],
  },
  // Performance & ROI — 7 tools
  {
    slug: "performance-roi",
    name: "Performance & ROI",
    description: "Quantify campaign effectiveness and investment returns.",
    tools: [
      {
        slug: "roi-calculator",
        name: "ROI",
        description: "Calculate return on investment by campaign.",
      },
      {
        slug: "romi-calculator",
        name: "ROMI",
        description: "Calculate marketing return on investment.",
      },
      {
        slug: "conversion-rate-calculator",
        name: "Conversion Rate",
        description: "Measure conversion rate between funnel stages.",
      },
      {
        slug: "ab-test-significance",
        name: "A/B Significance",
        description: "Test statistical significance of experiments.",
      },
      {
        slug: "cpa-calculator",
        name: "CPA",
        description: "Compute cost per acquisition from ad spend.",
      },
      {
        slug: "engagement-rate",
        name: "Engagement Rate",
        description: "Measure interactions per impression.",
      },
      {
        slug: "funnel-conversion",
        name: "Funnel Conversion",
        description: "Analyze conversion by funnel stage.",
      },
    ],
  },
  // Content & Marketing — 3 tools
  {
    slug: "content-marketing",
    name: "Content & Marketing",
    description: "Analyze and optimize your content for better engagement.",
    tools: [
      {
        slug: "word-counter",
        name: "Word Counter",
        description: "Count words, characters, sentences, and reading time.",
        isNew: true,
      },
      {
        slug: "readability-score",
        name: "Readability Score",
        description: "Calculate Flesch-Kincaid, Gunning Fog, and SMOG scores.",
        isNew: true,
      },
      {
        slug: "headline-analyzer",
        name: "Headline Analyzer",
        description: "Score headlines for engagement and emotional impact.",
        isNew: true,
      },
      {
        slug: "reading-time-calculator",
        name: "Reading Time Calculator",
        description: "Calculate reading time based on word count and content type.",
        isNew: true,
      },
      {
        slug: "cta-generator",
        name: "CTA Generator",
        description: "Generate and score effective call-to-action text.",
        isNew: true,
      },
    ],
  },
  // Feedback & Survey — 3 tools
  {
    slug: "feedback-survey",
    name: "Feedback & Survey",
    description: "Measure customer satisfaction and survey effectiveness.",
    tools: [
      {
        slug: "csat-calculator",
        name: "CSAT Calculator",
        description: "Calculate Customer Satisfaction Score from survey data.",
        isNew: true,
      },
      {
        slug: "ces-calculator",
        name: "CES Calculator",
        description: "Calculate Customer Effort Score on a 1-7 scale.",
        isNew: true,
      },
      {
        slug: "sample-size-calculator",
        name: "Survey Sample Size",
        description: "Calculate required sample size for statistically significant surveys.",
        isNew: true,
      },
      {
        slug: "response-rate-calculator",
        name: "Response Rate Calculator",
        description: "Calculate survey response rate and compare to benchmarks.",
        isNew: true,
      },
      {
        slug: "margin-of-error-calculator",
        name: "Margin of Error Calculator",
        description: "Calculate margin of error for survey results.",
        isNew: true,
      },
    ],
  },
  // Team & Productivity — 2 tools
  {
    slug: "team-productivity",
    name: "Team & Productivity",
    description: "Calculate team productivity metrics and resource costs.",
    tools: [
      {
        slug: "meeting-cost-calculator",
        name: "Meeting Cost Calculator",
        description: "Calculate the true cost of meetings based on attendee salaries.",
        isNew: true,
      },
      {
        slug: "sprint-velocity-calculator",
        name: "Sprint Velocity",
        description: "Calculate sprint velocity and predict future capacity.",
        isNew: true,
      },
      {
        slug: "salary-calculator",
        name: "Salary Calculator",
        description: "Convert salary to hourly rate with pay period breakdowns.",
        isNew: true,
      },
      {
        slug: "project-timeline-estimator",
        name: "Project Timeline Estimator",
        description: "Estimate project completion with velocity and risk buffers.",
        isNew: true,
      },
    ],
  },
];

export const getCategoryBySlug = (slug: string) =>
  TOOL_CATEGORIES.find((c) => c.slug === slug);

export const getToolBySlugs = (categorySlug: string, toolSlug: string) => {
  const cat = getCategoryBySlug(categorySlug);
  if (!cat) return undefined;
  return cat.tools.find((t) => t.slug === toolSlug);
};

export const getAllCategorySlugs = () => TOOL_CATEGORIES.map((c) => c.slug);

export const getAllToolParams = () =>
  TOOL_CATEGORIES.flatMap((c) =>
    c.tools.map((t) => ({ category: c.slug, tool: t.slug }))
  );

/** Resolve a tool slug to its category and metadata (for internal linking). */
export function findToolBySlug(toolSlug: string) {
  const normalized = TOOL_SLUG_ALIASES[toolSlug] ?? toolSlug;
  for (const cat of TOOL_CATEGORIES) {
    const tool = cat.tools.find((t) => t.slug === normalized);
    if (tool) return { categorySlug: cat.slug, tool };
  }
  return undefined;
}

const TOOL_SLUG_ALIASES: Record<string, string> = {
  "retention-calculator": "retention-rate",
  "dau-mau-calculator": "stickiness-calculator",
  "churn-rate-calculator": "churn-calculator",
  "nps-calculator": "nps-calculator",
};

const DEFINITION_TO_TOOL: Record<string, string> = {
  changelog: "changelog-generator",
  "product-updates": "changelog-generator",
  "release-management": "changelog-generator",
  roadmap: "roadmap-status-template",
  "product-management": "rice-prioritization-calculator",
  "open-source": "feature-voting-bias-calculator",
  "community-management": "feature-voting-bias-calculator",
  "user-feedback": "public-feedback-board-checklist",
  "product-feedback": "rice-prioritization-calculator",
  "feature-voting": "feature-voting-bias-calculator",
  "product-validation": "rice-prioritization-calculator",
  "customer-feedback": "public-feedback-board-checklist",
};

/** Map a definition slug to a related calculator when one exists. */
export function findToolForDefinition(defSlug: string) {
  const mapped = DEFINITION_TO_TOOL[defSlug];
  if (mapped) {
    const resolved = findToolBySlug(mapped);
    if (resolved) return resolved;
  }
  const candidates = [`${defSlug}-calculator`, defSlug];
  for (const candidate of candidates) {
    const match = findToolBySlug(candidate);
    if (match) return match;
  }
  for (const cat of TOOL_CATEGORIES) {
    const tool = cat.tools.find(
      (t) => t.slug.startsWith(`${defSlug}-`) || t.slug.includes(defSlug),
    );
    if (tool) return { categorySlug: cat.slug, tool };
  }
  return undefined;
}
