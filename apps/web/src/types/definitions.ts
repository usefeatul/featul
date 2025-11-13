export type DefinitionFaq = { q: string; a: string };

export type Definition = {
  slug: string;
  name: string;
  synonyms?: string[];
  short: string;
  content?: string;
  eli5: string;
  practical: string;
  expert: string;
  overview?: string;
  why?: string;
  pitfalls?: string[];
  benchmarks?: string;
  notes?: string[];
  formula?: { title: string; body: string; code?: string };
  example?: { title: string; body: string };
  faqs?: DefinitionFaq[];
  related?: string[];
  author?: string;
  publishedAt?: string;
  essay?: {
    intro?: string;
    analysis?: string;
    formulaContext?: string;
    exampleContext?: string;
    pitfallsContext?: string;
    benchmarksContext?: string;
    notesContext?: string;
    relatedContext?: string;
    faqsContext?: string;
  };
};

const computePublishedDate = (index: number): string => {
  const day = 11 + (index % 20)
  const dd = String(day).padStart(2, "0")
  return `2025-11-${dd}`
}

export const getDefinitionContent = (d: Definition): string => {
  if (d.content) return d.content
  const parts: string[] = []
  if (d.overview) parts.push(d.overview)
  if (d.why) parts.push(d.why)
  if (d.eli5) parts.push(d.eli5)
  if (d.practical) parts.push(d.practical)
  if (d.expert) parts.push(d.expert)
  return parts.join(" ")
}

export const DEFINITIONS: Definition[] = ([
  {
    slug: "mrr",
    name: "Monthly Recurring Revenue (MRR)",
    synonyms: ["monthly recurring revenue"],
    short: "Predictable subscription revenue recognized within a month.",
    content: "Monthly Recurring Revenue is the predictable revenue you recognize in a calendar month from active subscriptions. It excludes one‑time fees, setup charges, and non‑recurring items. Treat upgrades and downgrades with proration so the month reflects the true service delivered. Teams use MRR to measure momentum, forecast cash, and track net changes from new sales, expansion, contraction, and churn. Stable, cleanly recognized MRR gives you a reliable baseline to plan hiring and marketing budgets.",
    eli5: "Money you expect every month from subscriptions.",
    practical: "Sum the monthly fees from all active subscriptions in the month.",
    expert: "MRR excludes one‑time charges and includes prorations. Align recognition with billing cycles.",
    overview: "Monthly Recurring Revenue is predictable subscription revenue recognized for a calendar month. Excludes one‑time charges and accounts for prorations from upgrades or downgrades.",
    why: "MRR is foundational for forecasting cash flow, measuring growth momentum, and planning hiring and marketing investments.",
    essay: {
      intro: "MRR provides a clear, time‑boxed view of recurring revenue that decision‑makers can trust. Beyond a simple total, it communicates how durable your revenue base is and whether your commercial motion compounds month over month.",
      analysis: "Interpreting MRR well means separating the drivers: new business, expansion, contraction, and churn. Tracking these components highlights whether growth is coming from adding logos, growing existing accounts, or masking losses.",
      formulaContext: "While MRR is often presented as a straightforward sum, accurate recognition depends on proration for mid‑cycle changes and excluding non‑recurring items. This ensures the figure reflects service actually delivered in the month.",
      exampleContext: "The example illustrates clean monthly recognition. In practice, real‑world MRR includes partial periods, add‑ons, and seat changes, all of which should be prorated so the recognized amount matches usage.",
      pitfallsContext: "Common mistakes stem from mixing one‑time revenue with recurring, ignoring proration, and failing to separate paid subscribers from trials. Each issue can materially overstate momentum and mislead planning.",
      benchmarksContext: "Use benchmarks as directional context, not targets. Healthy MRR varies by segment, ACV, and go‑to‑market model. Trend, cleanliness, and net movement are more informative than absolute size.",
      notesContext: "Operational teams benefit from reporting net MRR (new + expansion − contraction − churn) and reconciling it to billing ledgers monthly. This keeps finance and growth teams aligned on the same source of truth.",
      relatedContext: "MRR connects directly to ARR (annualized view), ARPU (value per account), and NRR (durability within the existing base). Together these metrics describe scale, unit value, and cohort health.",
      faqsContext: "FAQs for MRR typically focus on recognition rules and edge cases like upgrades, downgrades, and refunds. Clear policies prevent confusion and maintain comparability over time."
    },
    pitfalls: [
      "Including one‑time or setup fees",
      "Ignoring proration from plan changes",
      "Mixing trial users with paid subscribers",
      "Counting refunds incorrectly",
      "Double‑counting upgrades as both new and expansion"
    ],
    benchmarks: "Early‑stage: $10k–$100k MRR; growth: $100k–$1M; enterprise: $1M+ (varies by niche).",
    notes: [
      "Track net MRR = new + expansion − contraction − churn",
      "Recognize revenue on service periods, not invoice dates"
    ],
    formula: { title: "Basic formula", body: "MRR is the sum of all active monthly subscription revenue.", code: "MRR = sum(active subscription fees for month)" },
    example: { title: "Example", body: "50 customers paying $40 → $2,000 MRR." },
    faqs: [
      { q: "Does MRR include setup fees?", a: "No. Exclude one‑time charges." },
      { q: "How to handle upgrades?", a: "Include expansions in the month they occur." },
    ],
    related: ["arr", "arpu", "nrr"],
  },
  {
    slug: "arr",
    name: "Annual Recurring Revenue (ARR)",
    synonyms: ["annualized recurring revenue"],
    short: "Annualized subscription revenue based on current contracts.",
    content: "Annual Recurring Revenue is the annualized value of all active subscriptions. Most teams compute ARR as 12×MRR, but enterprise contracts may be summed by their contracted annual values. ARR smooths short‑term monthly swings and communicates scale to investors and leadership. Keep ARR strict by excluding non‑recurring revenue and pipeline. When ARR grows consistently, your run‑rate business is scaling in a durable way.",
    eli5: "Your subscription money for a whole year.",
    practical: "Multiply stable MRR by 12 or sum annual contracts.",
    expert: "Use contract terms to avoid overstating volatile monthly changes.",
    overview: "Annual Recurring Revenue is the annualized value of active subscription contracts. Calculated as 12×MRR or by summing contracted annual values.",
    why: "ARR communicates run‑rate scale for board reporting and long‑range planning, smoothing monthly volatility.",
    essay: {
      intro: "ARR offers a long‑view snapshot of recurring scale by annualizing contract value. It helps leaders compare momentum across quarters without the noise of monthly fluctuations.",
      analysis: "Treat ARR as a contracted, durable figure. Avoid annualizing a spiky month and keep non‑recurring revenue separate so the signal remains clean and comparable.",
      formulaContext: "Use 12×MRR for monthly contracts and contracted annual values for enterprise deals. Keep definitions consistent across reporting periods.",
      exampleContext: "When mixing monthly and annual plans, normalize each to an annual value before presenting ARR so the figure reflects true run‑rate.",
      pitfallsContext: "Annualizing an atypical month, including one‑time items, or double‑counting multi‑year prepayments will distort ARR.",
      benchmarksContext: "ARR varies widely by stage and market. Track composition and growth rate over time rather than chasing absolute targets.",
      notesContext: "Report contracted ARR, reconcile to billing systems, and separate pipeline or uncontracted deals for clarity.",
      relatedContext: "ARR pairs with MRR (monthly view) and NRR (cohort durability) to show scale and health together.",
      faqsContext: "FAQs often cover how to treat prepayments, multi‑year deals, and the difference between contracted ARR and annualized MRR."
    },
    pitfalls: [
      "Annualizing a spiky month",
      "Including non‑recurring revenue",
      "Double‑counting multi‑year prepayments",
      "Mixing pipeline with contracted ARR"
    ],
    benchmarks: "Seed: ~$1–3M ARR; Series A: ~$3–10M; varies widely by market.",
    notes: [
      "Use contracted ARR, not forecast",
      "Exclude usage or one‑time fees that are not recurring"
    ],
    formula: { title: "Basic formula", body: "ARR is annualized MRR.", code: "ARR = 12 × MRR" },
    example: { title: "Example", body: "$10k MRR → $120k ARR." },
    faqs: [
      { q: "ARR vs revenue?", a: "ARR excludes one‑time and non‑recurring items." },
    ],
    related: ["mrr", "nrr"],
  },
  {
    slug: "arpu",
    name: "Average Revenue Per User (ARPU)",
    synonyms: ["average revenue per account", "arpa"],
    short: "Average monthly revenue per customer or account.",
    content: "Average Revenue Per User shows how much revenue the average paying customer generates each month. Compute ARPU by dividing MRR by the number of paying customers. Segment ARPU by plan, cohort, and channel to see pricing leverage and upsell effectiveness. Tracking ARPU over time helps you understand whether packaging changes, add‑ons, or seat growth are increasing the value of each account.",
    eli5: "On average, how much each customer pays per month.",
    practical: "Divide MRR by the number of paying customers.",
    expert: "Segment ARPU by plan and cohort to see pricing leverage.",
    overview: "ARPU measures average monthly revenue generated per paying customer or account.",
    why: "Reveals pricing power and helps evaluate packaging, upsell impact, and segment profitability.",
    essay: {
      intro: "ARPU reveals the typical economic value per paying account. It turns abstract revenue totals into unit‑level insight that informs pricing and packaging decisions.",
      analysis: "Segment ARPU by plan, cohort, and channel. Watching ARPU trends alongside NRR shows whether value per account is growing through upsell and adoption.",
      formulaContext: "Divide current period MRR by the number of paying customers. Compute per account when seat‑based pricing applies.",
      exampleContext: "In practice, remove trials and credits before computing ARPU so the value reflects paying customers only.",
      pitfallsContext: "Including trials, letting outliers skew means, and ignoring refunds will misstate ARPU.",
      benchmarksContext: "Benchmarks depend on segment. Track ARPU trend and distribution by plan to find pricing leverage.",
      notesContext: "Pair ARPU with NRR and cohort views to understand whether per‑account value compounds.",
      relatedContext: "ARPU connects to MRR (scale) and CLTV (lifetime value) to shape pricing strategy.",
      faqsContext: "FAQs typically ask whether to include trials, credits, and how to treat seat‑based pricing."
    },
    pitfalls: [
      "Including trials or unpaid accounts",
      "Letting enterprise outliers skew means",
      "Not segmenting by plan or cohort",
      "Ignoring refunds or credits"
    ],
    benchmarks: "SMB: $20–$200; mid‑market: $200–$800; enterprise: $800+ (varies).",
    notes: [
      "Compute per account when seat‑based pricing",
      "Track ARPU trend alongside NRR"
    ],
    formula: { title: "Formula", body: "ARPU uses current period revenue and active customers.", code: "ARPU = MRR / # active customers" },
    example: { title: "Example", body: "$20k MRR and 500 customers → $40 ARPU." },
    faqs: [
      { q: "Include trials?", a: "Exclude unpaid trials from ARPU." },
    ],
    related: ["mrr", "ltv"],
  },
  {
    slug: "nrr",
    name: "Net Revenue Retention (NRR)",
    synonyms: ["net dollar retention", "ndr"],
    short: "Revenue kept and expanded from existing customers.",
    content: "Net Revenue Retention measures how revenue from your existing customer cohort changes over a period after accounting for expansion, contraction, and churn. It excludes new logo sales. Strong NRR (>100%) signals healthy upsell and cross‑sell dynamics and a product that continues to deliver growing value. Report NRR alongside gross revenue retention to show both overall durability and expansion performance.",
    eli5: "How much revenue you keep from current customers after churn and upgrades.",
    practical: "Start of period MRR adjusted by expansion, contraction, and churn.",
    expert: "Track logo churn separately to avoid masking by large expansions.",
    overview: "NRR is the share of revenue retained and expanded from the existing customer cohort over a period.",
    why: "A top signal of product‑market fit and expansion potential. >100% indicates strong upsell/cross‑sell.",
    essay: {
      intro: "NRR captures the durability and expansion of revenue from the existing customer base. It isolates the core health of cohorts without the noise of new sales.",
      analysis: "Break NRR into expansion, contraction, and churn. Sustained >100% signals a product that increases in value over time and a motion that nurtures adoption and upsell.",
      formulaContext: "Anchor to start‑of‑period MRR for the existing cohort and adjust by expansion, contraction, and churn.",
      exampleContext: "Show the math using a start baseline; avoid end‑of‑period counts which can hide losses with big expansions.",
      pitfallsContext: "Including new logo revenue or mixing start and end baselines will produce misleading NRR.",
      benchmarksContext: "Healthy NRR ranges by segment. Focus on sustaining >100% and the drivers behind it.",
      notesContext: "Report logo churn separately and pair NRR with GRR to show both durability and expansion.",
      relatedContext: "NRR sits alongside MRR and ARR to describe scale, and complements churn and retention metrics.",
      faqsContext: "Common questions address whether to include new sales, how to treat downgrades, and anchoring baselines."
    },
    pitfalls: [
      "Including new logo revenue",
      "Using end‑of‑period counts instead of start baselines",
      "Ignoring downgrades/contraction",
      "Confusing logo churn with revenue churn"
    ],
    benchmarks: "SMB: 90–105%; mid‑market: 100–115%; enterprise: 110–130%+.",
    notes: [
      "Anchor to start‑of‑period cohort",
      "Report GRR alongside NRR for context"
    ],
    formula: { title: "Formula", body: "Include expansion, contraction, and churn from existing cohort.", code: "NRR = (MRR start + expansion − contraction − churn) / MRR start × 100%" },
    example: { title: "Example", body: "Start $100k, +$15k expansion, −$5k contraction, −$8k churn → 102%." },
    faqs: [
      { q: "Include new sales?", a: "Exclude new logos. Only existing cohort." },
    ],
    related: ["mrr", "arr", "churn-rate"],
  },
  {
    slug: "cac",
    name: "Customer Acquisition Cost (CAC)",
    synonyms: ["cost to acquire a customer"],
    short: "Average cost to acquire one new customer.",
    content: "Customer Acquisition Cost is the fully loaded spend required to acquire one new paying customer. Include salaries, tools, ad spend, and program costs for sales and marketing within a consistent attribution window. Compare CAC across channels and segments, and evaluate against CLTV and payback period to ensure growth is efficient. Lower, stable CAC with rising CLTV is a hallmark of scalable motion.",
    eli5: "What you spend to get each new customer.",
    practical: "Divide total sales and marketing costs by new customers in the period.",
    expert: "Match costs and acquisitions by cohort for accuracy.",
    overview: "CAC is the fully loaded cost to acquire one new paying customer in a period.",
    why: "Core unit economics metric for efficient growth and budget allocation across channels.",
    essay: {
      intro: "CAC measures the fully loaded cost to win a new paying customer. It transforms marketing and sales spend into unit‑level economics you can optimize.",
      analysis: "Match costs and acquisitions by cohort for accuracy. Compare CAC by channel and segment, and judge against margin‑adjusted CLTV and payback to ensure efficiency.",
      formulaContext: "Sum fully loaded sales and marketing costs and divide by new paying customers in the period.",
      exampleContext: "Align costs and acquisitions to the same attribution window and cohort to avoid mismatches.",
      pitfallsContext: "Excluding salaries, mixing signups with customers, or using inconsistent windows misstates CAC.",
      benchmarksContext: "Healthy CLTV/CAC ≥ 3 and payback ≤ target months indicate efficient growth.",
      notesContext: "Compute CAC by channel and segment so budget shifts can target the most efficient paths.",
      relatedContext: "CAC pairs with CLTV, payback period, and CPA to evaluate acquisition sustainability.",
      faqsContext: "FAQs often ask whether to include salaries, tools, and how to attribute spend."
    },
    pitfalls: [
      "Excluding salaries or overhead",
      "Using signups instead of paying customers",
      "Mismatched attribution windows",
      "Ignoring refunds or failed payments"
    ],
    benchmarks: "Target CLTV/CAC ≥ 3 and payback ≤ 12 months for SMB.",
    notes: [
      "Compute by segment and channel",
      "Use new paying customers, not trials"
    ],
    formula: { title: "Formula", body: "Use fully loaded S&M costs.", code: "CAC = Total sales+marketing spend / # new customers" },
    example: { title: "Example", body: "$50k spend, 100 new customers → $500 CAC." },
    faqs: [
      { q: "Include salaries?", a: "Include fully loaded team costs." },
    ],
    related: ["cltv", "payback-period", "cpa"],
  },
  {
    slug: "cltv",
    name: "Customer Lifetime Value (CLTV)",
    synonyms: ["lifetime value", "ltv", "clv"],
    short: "Total revenue expected from a customer over the relationship.",
    content: "Customer Lifetime Value estimates the total economic value a customer will generate over their relationship with you. Use margin‑adjusted LTV and cohort models for precision. Combining CLTV with CAC and payback period guides how much you can spend to acquire customers and where to prioritize product improvements that increase retention and expansion.",
    eli5: "How much money a customer brings you before they leave.",
    practical: "Divide ARPU by churn or use cohort models.",
    expert: "Use gross margin adjusted LTV for unit economics.",
    overview: "CLTV estimates the total gross‑margin‑adjusted revenue expected from a customer over their lifetime.",
    why: "Guides acquisition spend, pricing strategy, and product investments.",
    essay: {
      intro: "CLTV estimates the total economic value a customer generates over their relationship. It connects retention, expansion, and margin into a single strategic figure.",
      analysis: "Use margin‑adjusted models and cohorts for precision. Pair CLTV with CAC and payback to calibrate acquisition spend and prioritize retention work.",
      formulaContext: "Use average ARPU and churn rate or cohort cash flows, adjusted by gross margin, to estimate CLTV.",
      exampleContext: "Show a simple ARPU/churn example, then contrast with a cohort‑based model for greater accuracy.",
      pitfallsContext: "Using revenue instead of margin, assuming constant churn, or ignoring expansion will skew CLTV.",
      benchmarksContext: "Healthy businesses target CLTV/CAC > 3; absolute CLTV depends on ARPU and segment.",
      notesContext: "Present confidence intervals for small samples and prefer cohort modeling where data allows.",
      relatedContext: "CLTL connects to CAC, NRR, and ARPU to inform pricing and acquisition strategy.",
      faqsContext: "FAQs often cover margin adjustment, churn assumptions, and the choice of average vs cohort models."
    },
    pitfalls: [
      "Using revenue instead of margin",
      "Assuming constant churn across cohorts",
      "Ignoring expansion effects",
      "Relying on averages that hide segment differences"
    ],
    benchmarks: "Healthy businesses target CLTV/CAC > 3; absolute CLTV depends on ARPU.",
    notes: [
      "Model cohort‑based CLTV for accuracy",
      "Use confidence intervals when sample sizes are small"
    ],
    formula: { title: "Simple model", body: "Use average ARPU and churn rate.", code: "CLTV = ARPU / churn rate" },
    example: { title: "Example", body: "$40 ARPU, 4% churn → $1,000 CLTV." },
    faqs: [
      { q: "Gross margin?", a: "Multiply by gross margin for profitability." },
    ],
    related: ["cac", "cltv-cac-ratio"],
  },
  {
    slug: "cltv-cac-ratio",
    name: "CLTV/CAC Ratio",
    synonyms: ["ltv to cac"],
    short: "Compares lifetime value to acquisition cost.",
    content: "The CLTV/CAC ratio compares the value generated by a customer over time to the cost to acquire them. It is a quick check on the efficiency of your go‑to‑market. Track by channel and segment, and interpret alongside churn and payback period to get a fuller picture of sustainability.",
    eli5: "Shows if customers are worth more than they cost to get.",
    practical: "Divide CLTV by CAC and track by segment.",
    expert: "Target 3:1 or better for healthy growth.",
    overview: "The CLTV/CAC ratio compares the value of a customer over time to the cost to acquire them.",
    why: "Simple sanity check for scaling efficiency; investors watch this closely.",
    essay: {
      intro: "CLTV/CAC summarizes whether the value of a customer justifies the cost to acquire them. It is a fast reality check on growth efficiency.",
      analysis: "Target ≈3:1 or better, but interpret alongside churn and payback. Extremely high ratios can signal under‑investment if growth is constrained.",
      formulaContext: "Divide margin‑adjusted CLTV by fully loaded CAC for the same segment and window.",
      exampleContext: "Provide a simple ratio example and explain how segment differences can change the result.",
      pitfallsContext: "Using gross CLTV, mixing signups with customers, or ignoring payback duration distorts the ratio.",
      benchmarksContext: "Healthy ≈ 3:1; strong 4–5:1. Context matters; very high can imply missed growth investment.",
      notesContext: "Track by channel and segment and pair with churn and payback for a full picture.",
      relatedContext: "Relates directly to CAC and CLTV and supports budget allocation decisions.",
      faqsContext: "FAQs commonly ask what ratio is good and how to calculate it accurately."
    },
    pitfalls: [
      "Using gross CLTV not margin‑adjusted",
      "Mixing signups with customers",
      "Ignoring payback duration"
    ],
    benchmarks: "Healthy ≈ 3:1; strong 4–5:1; >6:1 may indicate under‑investment.",
    notes: [
      "Track by channel and segment",
      "Interpret alongside churn and payback"
    ],
    formula: { title: "Formula", body: "Use margin‑adjusted LTV when possible.", code: "CLTV/CAC = CLTV / CAC" },
    example: { title: "Example", body: "$1,000 LTV, $250 CAC → 4:1." },
    faqs: [
      { q: "What is good?", a: "3:1 is typical; 4–5:1 is strong." },
    ],
    related: ["cltv", "cac", "payback-period"],
  },
  {
    slug: "payback-period",
    name: "CAC Payback Period",
    synonyms: ["payback months"],
    short: "Months to recover CAC from gross margin on revenue.",
    content: "Payback period is the number of months required for gross margin from a customer's revenue to repay acquisition cost. Shorter payback improves cash efficiency and reduces funding needs. Segment payback by plan, channel, and cohort to see where to invest and where to optimize.",
    eli5: "How long until a customer pays back what they cost.",
    practical: "Divide CAC by monthly gross margin contribution.",
    expert: "Use cohort cash flows for precision.",
    overview: "Payback period is the number of months required for gross margin from a customer's revenue to cover CAC.",
    why: "Indicates cash efficiency and runway impact; shorter payback reduces funding needs.",
    essay: {
      intro: "Payback period shows how quickly gross margin from a customer repays acquisition cost. It connects growth pace to cash efficiency.",
      analysis: "Segment payback by plan and channel. Shorter payback improves runway and reduces financing pressure, especially in paid acquisition motions.",
      formulaContext: "Divide CAC by monthly gross margin contribution. Use cohorts for precise cash flow timing.",
      exampleContext: "Walk through a CAC, ARPU, and margin example to compute months to repay.",
      pitfallsContext: "Ignoring gross margin, using revenue instead of contribution, or not accounting for refunds will mislead decisions.",
      benchmarksContext: "SMB ≤ 12 months, mid‑market ≤ 18, enterprise can be longer depending on ACV and margins.",
      notesContext: "Report median payback and segment by plan and acquisition channel to target improvements.",
      relatedContext: "Payback ties to CAC and CLTV and impacts runway and fundraising timing.",
      faqsContext: "FAQs focus on what counts as good payback and how to compute it with margin."
    },
    pitfalls: [
      "Ignoring gross margin",
      "Using revenue instead of contribution",
      "Not accounting for refunds or churn",
      "Averaging across segments without cohorts"
    ],
    benchmarks: "SMB ≤ 12 months; mid‑market ≤ 18; enterprise 18–24 months can be acceptable.",
    notes: [
      "Report median payback, not mean",
      "Segment by plan and acquisition channel"
    ],
    formula: { title: "Formula", body: "Use margin and net of refunds.", code: "Payback = CAC / (ARPU × gross margin)" },
    example: { title: "Example", body: "$500 CAC, $40 ARPU, 80% margin → 15.6 months." },
    faqs: [
      { q: "Good target?", a: "< 12 months for SMB; enterprise can be longer." },
    ],
    related: ["cac", "cltv-cac-ratio"],
  },
  {
    slug: "activation-rate",
    name: "Activation Rate",
    synonyms: ["onboarding completion"],
    short: "Share of new users reaching a defined first value.",
    content: "Activation rate captures how many new users reach the first meaningful value within your onboarding window. Define a small set of events that strongly predict retention, then measure time‑bounded activation by source and platform. Raising activation through better onboarding and guidance typically lifts retention and monetization across the funnel.",
    eli5: "How many new users get value soon after signup.",
    practical: "Define activation events and measure within a window.",
    expert: "Use feature‑level funnels and segment by source.",
    overview: "Activation rate is the share of new users who achieve the first value event within a defined onboarding window.",
    why: "Strong leading indicator of retention and monetization.",
    essay: {
      intro: "Activation rate captures how many new users reach the first meaningful value quickly. It is the first milestone on the path to retention.",
      analysis: "Define predictive activation events and measure in tight windows. Improving activation usually lifts downstream retention and monetization.",
      formulaContext: "Use the count of activated users within the window divided by total new users, expressed as a percentage.",
      exampleContext: "Illustrate with a cohort of signups reaching a defined first‑value event within 7 or 14 days.",
      pitfallsContext: "Vague activation definitions, too long windows, and vanity events weaken the signal.",
      benchmarksContext: "Benchmarks vary; track by product and platform. Focus on trend and correlation with retention.",
      notesContext: "Ensure the activation event strongly predicts retention and segment by source and device.",
      relatedContext: "Activation relates to TTFV, retention rate, and stickiness metrics.",
      faqsContext: "FAQs usually ask what counts as activation and what window to use."
    },
    pitfalls: [
      "Vague activation definitions",
      "Too long measurement windows",
      "Optimizing vanity events",
      "Not segmenting by source or platform"
    ],
    benchmarks: "Consumer apps often 40–60%+; B2B tools 20–40% typical (highly variable).",
    notes: [
      "Ensure the activation event predicts retention",
      "Use 7/14/30‑day time‑bounded measurement"
    ],
    formula: { title: "Formula", body: "Use new users achieving first value.", code: "Activation = activated users / new users × 100%" },
    example: { title: "Example", body: "1,000 signups, 420 activated → 42%." },
    faqs: [
      { q: "What counts?", a: "Define events that correlate with retention." },
    ],
    related: ["ttfv", "retention-rate"],
  },
  {
    slug: "retention-rate",
    name: "Retention Rate",
    synonyms: ["user retention"],
    short: "Share of users who remain active between periods.",
    content: "Retention rate is the percentage of users still active at the end of a period relative to the start cohort. Plot cohort curves monthly to understand decay and where the curve flattens. High, stable retention underpins all sustainable growth and ensures marketing investments compound over time.",
    eli5: "How many users stay with you over time.",
    practical: "Measure by cohort and period.",
    expert: "Use cohort curves and survival analysis.",
    overview: "Retention rate is the percentage of users/accounts still active at the end of a period relative to the start cohort.",
    why: "Primary signal of product‑market fit and long‑term health.",
    essay: {
      intro: "Retention rate shows the share of users who remain active across periods. It reveals whether value persists beyond initial adoption.",
      analysis: "Use cohort curves to see decay and where they flatten. High, stable retention underpins sustainable growth and compounding economics.",
      formulaContext: "Divide end‑of‑period active users by the start‑of‑period cohort and express as a percentage.",
      exampleContext: "Present a cohort example with monthly measurements to show where the curve stabilizes.",
      pitfallsContext: "Comparing different cohorts, using cumulative retention, or counting reactivations as retained can mislead.",
      benchmarksContext: "Healthy cohorts often flatten after 3–6 months depending on category and use case.",
      notesContext: "Plot cohort curves monthly and use survival analysis for more precise insights.",
      relatedContext: "Retention pairs with churn rate, cohort analysis, and stickiness to describe engagement.",
      faqsContext: "Common questions cover DAU vs MAU baselines and correct cohort definitions."
    },
    pitfalls: [
      "Comparing different cohorts",
      "Using cumulative instead of period retention",
      "Counting reactivations as retained",
      "Mixing DAU/WAU/MAU baselines"
    ],
    benchmarks: "Benchmarks vary by category; healthy cohorts often flatten after 3–6 months.",
    notes: [
      "Plot cohort curves monthly",
      "Use survival analysis for precision"
    ],
    formula: { title: "Formula", body: "Track active users across periods.", code: "Retention = users active end / users active start × 100%" },
    example: { title: "Example", body: "500 at start, 380 at end → 76%." },
    faqs: [
      { q: "DAU vs MAU?", a: "Choose cadence matching product usage." },
    ],
    related: ["churn-rate", "cohort-analysis"],
  },
  {
    slug: "churn-rate",
    name: "Churn Rate",
    synonyms: ["customer churn", "revenue churn"],
    short: "Share of customers or revenue lost in a period.",
    content: "Churn rate quantifies customer or revenue loss over a period. Separate voluntary cancellations from involuntary churn due to failed payments, and track logo churn versus revenue churn. Reducing churn often starts with better onboarding, clearer value, and billing reliability.",
    eli5: "How much you lose from cancellations.",
    practical: "Measure customer churn and revenue churn separately.",
    expert: "Normalize by start counts; exclude upgrades.",
    overview: "Churn rate is the share of customers or revenue lost during a period; the inverse of retention.",
    why: "Quantifies leakage and highlights onboarding, product, or billing issues.",
    essay: {
      intro: "Churn rate measures customer or revenue loss. It is the mirror of retention and a direct read on value and reliability gaps.",
      analysis: "Separate voluntary cancellations from involuntary churn due to failed payments. Track logo churn versus revenue churn to understand mix effects.",
      formulaContext: "Use start‑of‑period baselines for customers or MRR and compute lost share as a percentage.",
      exampleContext: "Show customer churn and revenue churn examples and explain why revenue churn is usually lower.",
      pitfallsContext: "Counting upgrades as negative churn, mixing start and end baselines, and not isolating involuntary churn obscure the signal.",
      benchmarksContext: "Ranges depend on segment; SMB customer churn often 2–6% monthly with revenue churn lower.",
      notesContext: "Track logo churn and revenue churn separately and implement dunning to reduce involuntary churn.",
      relatedContext: "Churn complements NRR and retention and highlights onboarding and billing reliability work.",
      faqsContext: "FAQs ask about voluntary vs involuntary churn and the correct formulas to use."
    },
    pitfalls: [
      "Counting upgrades as negative churn",
      "Using end counts instead of start baselines",
      "Not separating involuntary churn",
      "Ignoring seasonality effects"
    ],
    benchmarks: "SMB customer churn 2–6% monthly is common; revenue churn typically lower (varies).",
    notes: [
      "Track logo churn and revenue churn separately",
      "Reduce involuntary churn with dunning and retry logic"
    ],
    formula: { title: "Formulas", body: "Use start of period baselines.", code: "Customer churn = lost customers / customers at start × 100%\nRevenue churn = MRR lost / MRR at start × 100%" },
    example: { title: "Example", body: "20 lost of 500 → 4% customer churn." },
    faqs: [
      { q: "Voluntary vs involuntary?", a: "Track failed payments separately." },
    ],
    related: ["nrr", "retention-rate"],
  },
  {
    slug: "gross-margin",
    name: "Gross Margin",
    synonyms: ["gross profit margin"],
    short: "Revenue minus COGS as a percentage of revenue.",
    content: "Gross margin shows how much of each revenue dollar remains after direct delivery costs. In SaaS, COGS commonly includes hosting, support, and third‑party APIs. High gross margins enable healthy unit economics and more flexibility to invest in growth.",
    eli5: "What you keep after direct costs.",
    practical: "Exclude opex; include hosting and support in COGS.",
    expert: "SaaS COGS usually includes infra, support, third‑party APIs.",
    overview: "Gross margin is revenue minus cost of goods sold divided by revenue.",
    why: "Determines unit economics potential and cash available for growth.",
    essay: {
      intro: "Gross margin shows how much revenue remains after direct delivery costs. It sets the ceiling for healthy unit economics.",
      analysis: "Define COGS consistently and include support and third‑party APIs tied to delivery. High gross margins enable investing in growth with confidence.",
      formulaContext: "Compute (Revenue − COGS) / Revenue × 100% using period values and consistently defined COGS.",
      exampleContext: "Provide a simple revenue and COGS example to illustrate the calculation.",
      pitfallsContext: "Misclassifying support or infrastructure, excluding third‑party API costs, or including opex will distort margins.",
      benchmarksContext: "Typical SaaS gross margin is 70–90%; vary by product mix and infra costs.",
      notesContext: "Define COGS consistently and include support that directly delivers customer value.",
      relatedContext: "Gross margin relates to net margin and payback and informs pricing and cost strategy.",
      faqsContext: "FAQs address what belongs in COGS and whether salaries are included."
    },
    pitfalls: [
      "Misclassifying support or infrastructure costs",
      "Excluding third‑party API costs",
      "Including opex in COGS",
      "Ignoring refunds or chargebacks"
    ],
    benchmarks: "Typical SaaS gross margin is 70–90%.",
    notes: [
      "Define COGS consistently",
      "Include support that directly delivers customer value"
    ],
    formula: { title: "Formula", body: "Use period revenue and COGS.", code: "Gross margin = (Revenue − COGS) / Revenue × 100%" },
    example: { title: "Example", body: "$100k revenue, $25k COGS → 75%." },
    faqs: [
      { q: "Include salaries?", a: "Include support and infra directly tied to delivery." },
    ],
    related: ["net-margin", "payback-period"],
  },
  {
    slug: "net-margin",
    name: "Net Margin",
    synonyms: ["net profit margin"],
    short: "Net income as a percentage of revenue.",
    content: "Net margin is the share of revenue left after all operating expenses, taxes, and interest. It reflects overall profitability beyond unit economics. Mature SaaS businesses typically target positive, growing net margins while maintaining efficient growth.",
    eli5: "What you keep after all expenses.",
    practical: "Include opex, taxes, and interest.",
    expert: "Use this for overall profitability, not unit economics.",
    overview: "Net margin is net income divided by revenue, including all operating expenses, taxes, and interest.",
    why: "Summarizes overall profitability beyond unit economics.",
    essay: {
      intro: "Net margin reflects what remains after all operating expenses, taxes, and interest. It is the bottom‑line view of profitability.",
      analysis: "Use GAAP‑compliant definitions and compare on trailing twelve months to smooth seasonality and one‑time items.",
      formulaContext: "Compute Net income / Revenue × 100% over the period and reconcile to financial statements.",
      exampleContext: "Show a simple net income and revenue example to illustrate percentage margins.",
      pitfallsContext: "One‑time gains or losses, differing capitalization, and accounting bases can make comparisons unreliable.",
      benchmarksContext: "Varies by stage; mature SaaS often target positive and growing net margins.",
      notesContext: "Prefer TTM comparisons and GAAP‑consistent treatment for clarity.",
      relatedContext: "Net margin complements gross margin and informs overall efficiency and profitability.",
      faqsContext: "FAQs ask about typical margins and which expenses are included."
    },
    pitfalls: [
      "One‑time gains or losses distorting margins",
      "Different capitalization policies",
      "Comparing companies with different accounting bases"
    ],
    benchmarks: "Varies by stage; mature SaaS often 10–20%+ net margin.",
    notes: [
      "Use GAAP‑compliant definitions",
      "Compare over trailing twelve months to smooth seasonality"
    ],
    formula: { title: "Formula", body: "Use period net income and revenue.", code: "Net margin = Net income / Revenue × 100%" },
    example: { title: "Example", body: "$20k net income on $100k → 20%." },
    faqs: [
      { q: "SaaS typical?", a: "Net margins vary widely by stage." },
    ],
    related: ["gross-margin"],
  },
  {
    slug: "burn-rate",
    name: "Burn Rate",
    synonyms: ["cash burn"],
    short: "Net cash outflow per month.",
    content: "Burn rate is net monthly cash outflow when spending exceeds inflows. Monitor both gross and net burn, and track the trend to understand whether investments are sustainable. Clear visibility into burn helps plan hiring, pricing changes, and fundraising.",
    eli5: "How fast you spend cash each month.",
    practical: "Subtract monthly cash inflows from outflows.",
    expert: "Use operating burn; separate investing and financing flows.",
    overview: "Burn rate is net monthly cash outflow when spending exceeds cash inflow.",
    why: "Determines runway and fundraising timing.",
    essay: {
      intro: "Burn rate is net monthly cash outflow. It shows how quickly you consume cash relative to inflows.",
      analysis: "Track gross and net burn and monitor the trend. Clear visibility aligns hiring, pricing, and fundraising decisions with reality.",
      formulaContext: "Compute cash outflows minus cash inflows on a cash basis. Track both gross and net burn.",
      exampleContext: "Provide a monthly cash flows example to compute net burn clearly.",
      pitfallsContext: "Mixing gross and net burn, ignoring seasonality, or combining operating and investing flows reduces clarity.",
      benchmarksContext: "Contextual by stage. Focus on trend and sustainability rather than fixed thresholds.",
      notesContext: "Tie burn planning to hiring plans, margins, and cash forecasts.",
      relatedContext: "Burn rate connects to runway and pricing strategy and guides fundraising timing.",
      faqsContext: "FAQs ask about gross vs net burn and which cash flows to include."
    },
    pitfalls: [
      "Mixing gross and net burn",
      "Ignoring seasonality",
      "Not separating operating vs investing cash flows"
    ],
    benchmarks: "Contextual; early‑stage teams often $50k–$300k/month (varies widely).",
    notes: [
      "Track trend month‑over‑month",
      "Tie burn planning to hiring and COGS assumptions"
    ],
    formula: { title: "Formula", body: "Use cash basis.", code: "Burn rate = Cash outflows − Cash inflows" },
    example: { title: "Example", body: "$150k out, $90k in → $60k burn." },
    faqs: [
      { q: "Gross vs net?", a: "Track both to see spending cadence." },
    ],
    related: ["runway"],
  },
  {
    slug: "runway",
    name: "Runway",
    synonyms: ["months of runway"],
    short: "Months until cash reaches zero at current burn.",
    content: "Runway is the number of months you can operate at your current net burn before cash runs out. Update your forecast monthly, and model optimistic, base, and conservative scenarios. Longer runway gives you time to iterate and avoid forced decisions.",
    eli5: "How many months you can operate before cash runs out.",
    practical: "Divide current cash by monthly burn.",
    expert: "Model scenarios with planned changes.",
    overview: "Runway is the number of months a company can operate at current net burn before cash hits zero.",
    why: "Helps plan fundraising, pricing changes, and expense reductions.",
    essay: {
      intro: "Runway estimates months until cash reaches zero at current burn. It converts burn into time for iteration and execution.",
      analysis: "Model optimistic, base, and conservative scenarios. Longer runway reduces forced decisions and creates room for strategic bets.",
      formulaContext: "Divide current cash balance by monthly net burn to estimate months of runway.",
      exampleContext: "Provide a cash and burn example to compute runway and discuss sensitivity to burn changes.",
      pitfallsContext: "Using uncertain receivables, ignoring planned changes to burn, or not modeling multiple scenarios creates false confidence.",
      benchmarksContext: "Targets vary; many teams aim ≥ 12–18 months post‑raise to allow iteration.",
      notesContext: "Refresh cash forecasts monthly and use conservative assumptions for inflows.",
      relatedContext: "Runway depends on burn rate and informs hiring, pricing, and fundraising choices.",
      faqsContext: "FAQs focus on extending runway via burn reductions or margin improvements."
    },
    pitfalls: [
      "Using uncertain receivables",
      "Ignoring planned changes to burn",
      "Not modeling multiple scenarios"
    ],
    benchmarks: "Target ≥ 12–18 months runway post‑raise.",
    notes: [
      "Refresh cash forecast monthly",
      "Use conservative assumptions for inflows"
    ],
    formula: { title: "Formula", body: "Use net burn.", code: "Runway = Cash balance / Monthly burn" },
    example: { title: "Example", body: "$600k cash, $60k burn → 10 months." },
    faqs: [
      { q: "Extend runway?", a: "Reduce burn or increase margin and cash inflows." },
    ],
    related: ["burn-rate"],
  },
  {
    slug: "break-even",
    name: "Break‑even",
    synonyms: ["break even"],
    short: "Point where total revenue equals total costs.",
    content: "Break‑even is the point where contribution margin fully covers fixed costs. Beyond break‑even, each incremental unit contributes to profit. For recurring revenue businesses, focus on contribution margin and retention to reach break‑even sustainably.",
    eli5: "When you stop losing money and start making it.",
    practical: "Divide fixed costs by contribution margin per unit.",
    expert: "Use SaaS unit economics for recurring models.",
    overview: "Break‑even is the point where contribution margin covers fixed costs; profit begins beyond this point.",
    why: "Clarifies scale needed to reach sustainable operations.",
    essay: {
      intro: "Break‑even marks the point where contribution margin covers fixed costs. Beyond this point, incremental units contribute to profit.",
      analysis: "Focus on contribution margin for recurring models. Track blended margins over time so the break‑even calculation reflects current economics.",
      formulaContext: "Divide fixed costs by contribution margin per unit to estimate break‑even units.",
      exampleContext: "Provide a fixed cost and margin example to show how many units are needed to break even.",
      pitfallsContext: "Using gross revenue instead of contribution, ignoring variable cost shifts, or mixing cash and accrual accounting skews results.",
      benchmarksContext: "Context‑dependent. Emphasize reaching sustainable operations before scaling spend.",
      notesContext: "In SaaS, prioritize contribution margin and retention to reach break‑even sustainably.",
      relatedContext: "Break‑even connects to gross margin and net margin and guides scale decisions.",
      faqsContext: "FAQs ask about revenue break‑even and converting units to revenue."
    },
    pitfalls: [
      "Using gross revenue instead of contribution",
      "Ignoring variable cost changes",
      "Mixing cash and accrual accounting"
    ],
    benchmarks: "Context‑dependent; many SaaS aim to reach break‑even by Series A/B stage.",
    notes: [
      "Focus on contribution margin in SaaS",
      "Account for blended gross margin shifts over time"
    ],
    formula: { title: "Formula", body: "Use contribution margin.", code: "Break‑even units = Fixed costs / (Price − variable cost)" },
    example: { title: "Example", body: "$50k fixed, $20 margin → 2,500 units." },
    faqs: [
      { q: "Revenue break‑even?", a: "Multiply units by price." },
    ],
    related: ["gross-margin", "net-margin"],
  },
  {
    slug: "cohort-analysis",
    name: "Cohort Analysis",
    synonyms: ["cohort retention"],
    short: "Track user behavior over time by cohort.",
    content: "Cohort analysis groups users by a shared start point and tracks behavior over time. It reveals retention patterns, onboarding effectiveness, and where value compounds. Use monthly tables and curves, segment by source, and normalize definitions so comparisons are meaningful.",
    eli5: "Group users by signup month and see how they stick around.",
    practical: "Build monthly retention tables and curves.",
    expert: "Use survival and hazard functions.",
    overview: "Cohort analysis groups users and tracks behavior over time to reveal retention and value patterns.",
    why: "Exposes onboarding issues and long‑term behavior masked by averages.",
    essay: {
      intro: "Cohort analysis groups users by a shared start point and follows behavior over time. It reveals retention patterns and where value compounds.",
      analysis: "Normalize definitions and use monthly tables and curves. Segment cohorts by source and plan to uncover actionable differences.",
      formulaContext: "Index cohorts to month 0 and track active share over time using consistent definitions.",
      exampleContext: "Provide a cohort table example with percentages across months to illustrate decay and stabilization.",
      pitfallsContext: "Small cohort noise, incorrect definitions, unfixed windows, and unnormalized comparisons undermine insight.",
      benchmarksContext: "Healthy products show cohort curves flattening above 30–50% depending on category.",
      notesContext: "Use percentile curves and medians and segment by source and plan for actionability.",
      relatedContext: "Cohort analysis complements retention and churn rate and informs onboarding improvements.",
      faqsContext: "FAQs ask which cohort anchors to use and how to interpret curves."
    },
    pitfalls: [
      "Small cohort noise",
      "Incorrect cohort definitions",
      "Not fixing time windows",
      "Reading curves without normalization"
    ],
    benchmarks: "Healthy products show cohort curves flattening above 30–50% depending on category.",
    notes: [
      "Use percentile curves and medians",
      "Segment cohorts by source and plan"
    ],
    formula: { title: "Approach", body: "Index cohorts to month 0 and track active share." },
    example: { title: "Example", body: "Jan cohort: 100% → 60% → 45% → 38%." },
    faqs: [
      { q: "Which cohorts?", a: "Signup or first use are common." },
    ],
    related: ["retention-rate", "churn-rate"],
  },
  {
    slug: "stickiness",
    name: "DAU/MAU Stickiness",
    synonyms: ["dau mau"],
    short: "Share of monthly users active daily.",
    content: "Stickiness, computed as DAU divided by MAU, indicates how habit‑forming your product is. Track by feature and segment to understand what drives frequent engagement. Improving stickiness usually requires better daily value loops and reduced friction.",
    eli5: "How often users come back in a month.",
    practical: "Divide DAU by MAU for the month.",
    expert: "Segment by feature usage.",
    overview: "Stickiness is DAU divided by MAU, a proxy for habitual usage.",
    why: "Indicates how frequently users return and engage.",
    essay: {
      intro: "Stickiness, computed as DAU/MAU, indicates how habit‑forming your product is. It complements retention by showing frequency of engagement.",
      analysis: "Segment by feature and audience. Improving daily value loops and reducing friction are typical levers to lift stickiness.",
      formulaContext: "Compute DAU divided by MAU × 100% for the period and track by feature usage.",
      exampleContext: "Provide a DAU and MAU example to show how stickiness percentage is derived.",
      pitfallsContext: "Bots, seasonality, and uneven feature adoption across segments can distort stickiness.",
      benchmarksContext: "Consumer social often 40–60%+; productivity tools 20–40% typical.",
      notesContext: "Track weekly stickiness (WAU/MAU) and pair with retention analysis for depth.",
      relatedContext: "Stickiness relates to activation and retention and highlights engagement loops.",
      faqsContext: "FAQs ask what good stickiness looks like and how to segment it."
    },
    pitfalls: [
      "Bots or non‑human activity",
      "Seasonality effects",
      "Different feature adoption across segments"
    ],
    benchmarks: "Consumer social 40–60%+; productivity tools 20–40% typical.",
    notes: [
      "Track weekly stickiness (WAU/MAU) too",
      "Pair stickiness with retention analysis"
    ],
    formula: { title: "Formula", body: "Use period active counts.", code: "Stickiness = DAU / MAU × 100%" },
    example: { title: "Example", body: "5k DAU, 20k MAU → 25%." },
    faqs: [
      { q: "Good value?", a: "Depends on product category." },
    ],
    related: ["activation-rate", "retention-rate"],
  },
  {
    slug: "ttfv",
    name: "Time to First Value (TTFV)",
    synonyms: ["time to value"],
    short: "Time for new users to reach their first meaningful outcome.",
    content: "Time to First Value measures how quickly a new user reaches the first outcome that proves your product's value. Instrument critical events, compute medians, and remove friction in onboarding. Faster TTFV typically lifts activation and retention across cohorts.",
    eli5: "How long until a new user gets value.",
    practical: "Measure median time from signup to first value event.",
    expert: "Define events that predict retention and expansion.",
    overview: "TTFV is the elapsed time from signup to the first event that delivers meaningful value.",
    why: "Faster time to value correlates with better retention and conversion.",
    essay: {
      intro: "TTFV measures how quickly a new user reaches the first outcome that proves value. It is the speedometer of onboarding.",
      analysis: "Instrument critical events and compute medians. Removing friction in discovery and setup typically reduces TTFV and lifts activation.",
      formulaContext: "Use event timestamps from signup to first value and compute median time across the cohort.",
      exampleContext: "Provide a median days example from signup to publish or equivalent value event.",
      pitfallsContext: "Poor event definitions, ignoring segment complexity, and overly broad windows hide true time to value.",
      benchmarksContext: "Targets vary by product; aim to reduce TTFV through onboarding improvements.",
      notesContext: "Instrument key events end‑to‑end and prefer median rather than mean.",
      relatedContext: "TTFV connects to activation rate and retention as upstream drivers.",
      faqsContext: "FAQs ask how to define first value and which measurement window to use."
    },
    pitfalls: [
      "Poor event definition",
      "Ignoring product complexity by segment",
      "Using too broad a measurement window"
    ],
    benchmarks: "Varies by product; aim to reduce by 20–50% via onboarding improvements.",
    notes: [
      "Instrument key events end‑to‑end",
      "Use median rather than mean"
    ],
    formula: { title: "Approach", body: "Use event timestamps to compute medians." },
    example: { title: "Example", body: "Median 2.4 days from signup to publish." },
    faqs: [
      { q: "Reduce TTFV?", a: "Improve onboarding and guidance." },
    ],
    related: ["activation-rate"],
  },
  {
    slug: "roi",
    name: "Return on Investment (ROI)",
    synonyms: ["return on investment"],
    short: "Gain relative to cost expressed as a percentage.",
    content: "Return on Investment expresses net gain relative to cost as a percentage. Use incremental lift versus a baseline and consistent attribution windows. ROI helps decide where to allocate budget across campaigns, features, and operations.",
    eli5: "How much you made compared to what you spent.",
    practical: "Subtract cost from gain and divide by cost.",
    expert: "Use incremental gains and net costs.",
    overview: "ROI expresses the return relative to cost as a percentage and evaluates investment efficiency.",
    why: "Guides resource allocation across marketing, product, and operations.",
    essay: {
      intro: "ROI expresses net gain relative to cost. It turns initiatives into comparable percentages so you can rank opportunities.",
      analysis: "Use incremental lift versus a baseline and consistent attribution windows. Pair ROI with quality metrics to avoid optimizing vanity gains.",
      formulaContext: "Compute (Gain − Cost) / Cost × 100% using net gains over consistent windows.",
      exampleContext: "Provide a gain and cost example and explain incremental vs gross ROI.",
      pitfallsContext: "Attribution errors, using gross instead of net gains, and ignoring time value can inflate ROI.",
      benchmarksContext: "ROMI often 100–300% for strong campaigns; context varies widely.",
      notesContext: "Use incremental lift versus baseline and align windows across channels.",
      relatedContext: "ROI pairs with CPA, CAC, and conversion rate to guide budget allocation.",
      faqsContext: "FAQs ask about ROMI, attribution windows, and calculating net gains."
    },
    pitfalls: [
      "Attribution errors",
      "Using gross instead of net gains",
      "Ignoring time value of money"
    ],
    benchmarks: "ROMI often 100–300% for strong campaigns; varies widely.",
    notes: [
      "Use incremental lift vs baseline",
      "Apply consistent attribution windows"
    ],
    formula: { title: "Formula", body: "Use net gains.", code: "ROI = (Gain − Cost) / Cost × 100%" },
    example: { title: "Example", body: "$40k gain on $10k cost → 300%." },
    faqs: [
      { q: "ROMI?", a: "Marketing‑specific ROI variant." },
    ],
    related: ["romi", "cpa", "conversion-rate"],
  },
  {
    slug: "cpa",
    name: "Cost Per Acquisition (CPA)",
    synonyms: ["cost per acquisition"],
    short: "Ad spend divided by attributed conversions.",
    content: "Cost Per Acquisition is the average ad or marketing cost per conversion within a defined attribution window. Track CPA by channel, creative, and audience. Pair CPA with conversion quality and downstream metrics like CAC and payback to ensure paid growth is sustainable.",
    eli5: "Ad cost for each new customer or signup.",
    practical: "Divide attributed spend by conversions in the window.",
    expert: "Use consistent attribution and windows.",
    overview: "CPA is the average marketing or ad cost per attributed conversion.",
    why: "Controls acquisition efficiency in paid channels.",
    essay: {
      intro: "CPA is the average ad or marketing cost per attributed conversion. It focuses on the price of volume in paid growth.",
      analysis: "Track by channel, creative, and audience. Pair CPA with conversion quality and downstream CAC and payback so spend scales sustainably.",
      formulaContext: "Divide attributed ad spend by the number of conversions within a consistent attribution window.",
      exampleContext: "Provide a spend and conversions example and clarify definition of conversion (signup vs customer).",
      pitfallsContext: "Last‑click bias, mismatched windows, and counting low‑quality conversions will distort CPA.",
      benchmarksContext: "Benchmarks depend on ARPU and CLTV; ensure paid CAC remains viable when scaling.",
      notesContext: "Track CPA by channel and creative and pair with conversion quality metrics.",
      relatedContext: "CPA connects to CAC and conversion rate and informs paid acquisition budgeting.",
      faqsContext: "FAQs ask about signup vs customer definitions and proper attribution."
    },
    pitfalls: [
      "Last‑click bias in attribution",
      "Mismatched attribution windows",
      "Counting low‑quality or non‑customer conversions"
    ],
    benchmarks: "Benchmarks depend on ARPU and CLTV; ensure paid CAC remains viable.",
    notes: [
      "Track CPA by channel and creative",
      "Pair with conversion quality metrics"
    ],
    formula: { title: "Formula", body: "Use attributed conversions.", code: "CPA = Ad spend / # conversions" },
    example: { title: "Example", body: "$5k spend, 200 signups → $25 CPA." },
    faqs: [
      { q: "Signup vs customer?", a: "Define conversion consistently." },
    ],
    related: ["cac", "conversion-rate"],
  },
  {
    slug: "conversion-rate",
    name: "Conversion Rate",
    synonyms: ["cr"],
    short: "Share of visitors who complete a target action.",
    content: "Conversion rate measures how effectively you turn visits or exposures into a target action such as signup or purchase. Build consistent definitions, analyze by source and intent, and run experiments to remove friction. Improving conversion multiplies all upstream acquisition efforts.",
    eli5: "How many people do what you want after visiting.",
    practical: "Divide conversions by visits or exposures.",
    expert: "Segment by source and intent.",
    overview: "Conversion rate is the share of visitors or users who complete a target action within a time window.",
    why: "Measures funnel performance and highlights growth levers.",
    essay: {
      intro: "Conversion rate measures how effectively visits or exposures become target actions. It is the core efficiency metric of the funnel.",
      analysis: "Build consistent conversion definitions, segment by source and intent, and run experiments to remove friction. Improving conversion multiplies acquisition.",
      formulaContext: "Divide conversions by visitors or exposures in the period and express as a percentage.",
      exampleContext: "Provide a visits and conversions example to compute CR and discuss intent differences.",
      pitfallsContext: "Counting duplicate conversions, not separating qualified traffic, and comparing across different intents reduce signal quality.",
      benchmarksContext: "Typical SaaS signup conversion 2–8%; checkout conversion varies by pricing and product.",
      notesContext: "Use consistent definitions and analyze by source, device, and region to find levers.",
      relatedContext: "Conversion rate ties to CPA, ROI, and funnel health and influences CAC.",
      faqsContext: "FAQs ask how to improve CR and how to segment by source and intent."
    },
    pitfalls: [
      "Counting duplicate conversions",
      "Not separating qualified traffic",
      "Comparing across different intents or offers"
    ],
    benchmarks: "Typical SaaS signup conversion 2–8%; checkout conversion varies by pricing model.",
    notes: [
      "Build consistent conversion definitions",
      "Analyze by source, device, and region"
    ],
    formula: { title: "Formula", body: "Use period counts.", code: "CR = Conversions / Visitors × 100%" },
    example: { title: "Example", body: "1,000 visits, 42 signups → 4.2%." },
    faqs: [
      { q: "Improve CR?", a: "Align offer, UX, and intent." },
    ],
    related: ["cpa", "roi"],
  },
] as Definition[]).map((d, i) => ({
  ...d,
  author: d.author ?? "Jean Daly",
  publishedAt: d.publishedAt ?? computePublishedDate(i),
}))

export const getDefinitionBySlug = (slug: string): Definition | undefined => {
  const match = DEFINITIONS.find((d) => d.slug === slug)
  if (match) return match
  return DEFINITIONS.find((d) => (d.synonyms || []).includes(slug))
}

export const getPrimarySlug = (slug: string): string | undefined => {
  const d = getDefinitionBySlug(slug)
  return d?.slug
}

export const getAllDefinitionSlugs = (): string[] => DEFINITIONS.map((d) => d.slug)

export const getAllDefinitionParams = (): { term: string }[] => {
  const list: string[] = []
  for (const d of DEFINITIONS) {
    list.push(d.slug)
    for (const s of d.synonyms || []) list.push(s)
  }
  return list.map((term) => ({ term }))
}