type IntroMap = Record<string, string>

const INTRO_MAP: IntroMap = {
  "product-feature-analytics": "Explore feature adoption, cohort retention, and usage depth with lightweight calculators.",
  "revenue-growth": "Track subscription KPIs like MRR, ARR, ARPU, LTV, and growth trends.",
  "customer-metrics": "Measure acquisition efficiency, activation, retention, churn, and customer value.",
  "financial-health": "Assess cash runway, burn, margins, payback, and operating efficiency.",
  "pricing-valuation": "Test pricing strategies, discount impact, tier optimization, and SaaS valuation.",
  "performance-roi": "Analyze campaign ROI, ROMI, CPA, conversion rates, and engagement.",
}

export function getCategoryIntro(slug: string, name: string): string {
  return (
    INTRO_MAP[slug] || `Discover calculators and templates for ${name.toLowerCase()} to make faster, data‑driven decisions.`
  )
}