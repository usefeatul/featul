export const NEW_TOOL_SLUGS = new Set<string>([
  "rice-prioritization-calculator",
  "changelog-generator",
  "feature-voting-bias-calculator",
  "public-feedback-board-checklist",
  "roadmap-status-template",
  "feedback-vote-confidence-calculator",
  "nps-follow-up-planner",
  "duplicate-feedback-estimator",
  "stickiness-calculator",
  "ttfv-calculator",
  "feature-usage-frequency",
  // New tools added
  "word-counter",
  "readability-score",
  "headline-analyzer",
  "csat-calculator",
  "ces-calculator",
  "sample-size-calculator",
  "meeting-cost-calculator",
  "sprint-velocity-calculator",
  "quick-ratio",
  "net-revenue-retention",
  // Additional new tools
  "reading-time-calculator",
  "cta-generator",
  "response-rate-calculator",
  "margin-of-error-calculator",
  "salary-calculator",
  "project-timeline-estimator",
])

export function isToolNew(slug: string) {
  return NEW_TOOL_SLUGS.has(slug)
}