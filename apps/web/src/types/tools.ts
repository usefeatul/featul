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
