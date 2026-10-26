import { DOCS_HOME_HREF } from "@/config/docsNav"

export type UseCaseArticleLink = { label: string; href: string }

export type UseCaseArticleSection = {
  title: string
  paragraphs: string[]
  list?: string[]
  /** Rendered as a row of links after the section copy. */
  links?: UseCaseArticleLink[]
}

/** Hand-written use case article, shared by the HTML page and its Markdown twin. */
export type UseCaseArticle = {
  slug: string
  badge: string
  title: string
  description: string
  sections: UseCaseArticleSection[]
}

export const USE_CASE_ARTICLES: Record<string, UseCaseArticle> = {
  "product-feedback-platform": {
    slug: "product-feedback-platform",
    badge: "Product feedback",
    title: "Centralize product feedback and roadmap in one place",
    description:
      "Learn how product organizations use Featul to establish a single source of feedback truth, prioritize with a public roadmap, and close the loop with changelogs.",
    sections: [
      {
        title: "Before Featul vs after Featul",
        paragraphs: [
          "Many teams begin with feedback distributed across multiple fragmented systems: support tickets, ad‑hoc Slack threads, spreadsheets maintained by individual contributors, and informal comments in community spaces. In this environment, it becomes difficult to understand which requests are most common, which customers are affected, and how feedback should influence the roadmap.",
          "With Featul, feedback, roadmap, and changelog are managed together within a single workspace. Product teams gain a consolidated view of demand, can clearly explain why certain initiatives are prioritized, and can demonstrate both internally and externally how customer input directly shapes product decisions.",
        ],
      },
      {
        title: "1. Capture feedback from every channel",
        paragraphs: [
          "Start by ensuring that all relevant channels feed into a single, consistent destination. With Featul, you can bring feedback from in‑app widgets, email, support tools, and community spaces into a central feedback hub instead of allowing each channel to develop its own separate backlog.",
          "Once feedback is centralized, your team no longer needs to reconcile separate spreadsheets or search through historical tickets to understand customer needs. Everyone works from the same structured view, with the ability to filter by segment, product area, or importance, which leads to more deliberate and accountable decision‑making.",
        ],
      },
      {
        title: "2. Prioritize with a transparent roadmap",
        paragraphs: [
          "When feedback is grouped into clear themes, it becomes easier to assess impact and urgency. Featul enables teams to consolidate related requests into structured ideas, estimate the value and effort involved, and then convert those ideas into roadmap items that can be tracked over time.",
          "A public or shared roadmap gives all stakeholders customers, customer success, sales, and leadership a single reference point for what is planned, in progress, and recently delivered. This reduces ad‑hoc status requests, supports more transparent expectation‑setting, and helps internal teams speak with a consistent, aligned message.",
        ],
      },
      {
        title: "3. Close the loop with changelogs",
        paragraphs: [
          "When a feature ships, the work is not finished until customers clearly understand what has changed and how it relates to their earlier requests. With Featul, you can link releases back to their originating feedback, record the status change, and notify the customers and internal teams that were following a given item.",
          "Over time, this consistent “closed loop” communication builds trust. Customers begin to see that submitting feedback has a real effect, which increases engagement and turns previously silent users into active collaborators in your product development process.",
        ],
      },
      {
        title: "Example scenario",
        paragraphs: [
          "Consider a B2B SaaS team that repeatedly hears requests for more advanced analytics capabilities. Some requests are raised by enterprise accounts through their customer success managers, while others surface from smaller customers via an in‑app feedback widget and periodic NPS surveys.",
          "Using Featul, the team groups all analytics‑related feedback into a single idea, attaches internal notes, and records how much ARR sits behind the request so a flagship account is not ranked like a free-tier upvote. Once the work is prioritized, the idea is moved to “Planned” on the roadmap. Customers can subscribe to updates, and when the new analytics release ships, they automatically receive a clear changelog entry that explains what was delivered and why.",
        ],
      },
      {
        title: "Who this use case is for",
        paragraphs: [
          "This workflow is particularly well‑suited to SaaS teams that want a structured, privacy‑first way to manage feedback at scale while still maintaining a clear, human connection with their customers. It works especially well for organizations that are moving from informal processes to a more deliberate, product‑led operating model.",
        ],
        list: [
          "Replace scattered feedback documents and spreadsheets with a single, auditable source of truth",
          "Align product, success, sales, and leadership around one shared roadmap and prioritization model",
          "Reduce manual status updates and follow‑ups while still providing timely, professional communication",
          "Demonstrate a clear, EU‑hosted, GDPR‑friendly feedback process to security‑conscious customers",
        ],
      },
      {
        title: "Get started with Featul",
        paragraphs: [
          "If you are ready to centralize product feedback and make roadmap decisions with greater confidence, a practical first step is to create your initial board, define a small number of clear categories, and invite the core members of your product, success, and support teams. From there, you can gradually connect additional feedback channels and formalize how ideas move from intake to delivery.",
        ],
        links: [
          { label: "View pricing", href: "/pricing" },
          { label: "Read the docs", href: DOCS_HOME_HREF },
          { label: "Featurebase alternatives", href: "/alternatives/featurebase" },
          { label: "Canny alternatives", href: "/alternatives/canny" },
          { label: "What is ARR?", href: "/definitions/arr" },
        ],
      },
    ],
  },
  "enterprise-customer-success": {
    slug: "enterprise-customer-success",
    badge: "Customer success",
    title: "Scale enterprise customer success with structured feedback programs",
    description:
      "Discover how enterprise CS teams run systematic feedback collection, stakeholder alignment, and reporting to drive retention and account growth.",
    sections: [
      {
        title: "The enterprise feedback challenge",
        paragraphs: [
          "Enterprise customer success teams face unique challenges: multiple stakeholders per account, complex organizational hierarchies, and the need to demonstrate ROI to both customers and internal executives. Traditional feedback methods quarterly business reviews, ad-hoc surveys, and scattered email threads fail to capture the nuanced needs of enterprise accounts.",
          "Without systematic feedback collection, CSMs struggle to identify expansion opportunities, predict churn risk, and build compelling business cases for renewals. The absence of structured data makes it difficult to correlate customer satisfaction with revenue outcomes or justify strategic product investments.",
        ],
      },
      {
        title: "1. Implement multi-stakeholder feedback architecture",
        paragraphs: [
          "Establish comprehensive feedback channels that capture input from all organizational levels within enterprise accounts. Deploy role-specific surveys for end users, department heads, and executive sponsors to understand diverse perspectives on product value and strategic alignment.",
          "Configure automated feedback workflows that trigger based on customer lifecycle stages, usage patterns, and engagement metrics. This systematic approach ensures consistent data collection while respecting the time constraints of senior stakeholders.",
        ],
      },
      {
        title: "2. Correlate feedback with business outcomes",
        paragraphs: [
          "Transform qualitative feedback into quantitative insights by establishing clear correlation frameworks between customer sentiment and key business metrics. Track how feedback themes align with product adoption rates, feature utilization, and ultimately, renewal probability.",
          "Develop predictive models that identify early warning indicators for churn risk and expansion opportunities. By systematically analyzing feedback patterns alongside usage data and contract timelines, CSMs can proactively address concerns and capitalize on growth potential.",
        ],
      },
      {
        title: "3. Create executive-ready reporting frameworks",
        paragraphs: [
          "Generate comprehensive executive dashboards that translate customer feedback into strategic insights for both internal leadership and customer executives. Present data in formats that facilitate data-driven decision making and demonstrate clear ROI from customer success investments.",
          "Establish quarterly business review templates that incorporate feedback trends, product roadmap alignment, and strategic recommendations. These structured presentations enable CSMs to position themselves as strategic advisors rather than reactive support providers.",
        ],
      },
      {
        title: "4. Build systematic escalation and resolution processes",
        paragraphs: [
          "Implement formal escalation pathways that ensure critical feedback reaches appropriate internal stakeholders within defined timeframes. Create cross-functional collaboration protocols that involve product management, engineering, and executive leadership in addressing enterprise customer concerns.",
          "Develop resolution tracking systems that monitor feedback implementation progress and communicate updates back to customers. This closed-loop approach demonstrates commitment to customer success and builds trust through transparent communication.",
        ],
      },
      {
        title: "Strategic implementation scenario",
        paragraphs: [
          "A SaaS company serving Fortune 500 clients implements a comprehensive feedback program across their top 50 enterprise accounts. The CSM team deploys quarterly executive surveys, monthly user feedback collection, and continuous product usage monitoring.",
          "Through systematic analysis, they identify that accounts with regular feedback participation show 40% higher renewal rates and 60% greater expansion revenue. The data reveals specific feature gaps that, when addressed, correlate with significant increases in user adoption and customer satisfaction scores.",
          "Executive reporting demonstrates that customers participating in structured feedback programs generate 3.2x higher lifetime value compared to those without systematic engagement. This data justifies additional investments in customer success resources and influences product roadmap prioritization.",
        ],
      },
      {
        title: "Target organizational profile",
        paragraphs: [
          "This comprehensive approach is specifically designed for B2B SaaS organizations serving enterprise customers with annual contract values exceeding $50,000. Ideal implementations include companies with:",
        ],
        list: [
          "Complex, multi-stakeholder sales cycles requiring extended onboarding periods",
          "Annual recurring revenue models dependent on high retention rates",
          "Product portfolios requiring strategic alignment with customer business objectives",
          "Executive teams demanding quantifiable ROI from customer success investments",
          "Regulatory or compliance requirements necessitating detailed documentation",
        ],
      },
      {
        title: "Implementation methodology",
        paragraphs: [
          "Begin with a pilot program encompassing your highest-value accounts to establish baseline metrics and refine processes. Develop standardized feedback collection instruments tailored to different stakeholder roles and organizational levels.",
          "Establish clear success criteria including feedback response rates, issue resolution timelines, and correlation with renewal outcomes. Create internal training programs that equip CSMs with skills necessary for strategic customer engagement and data-driven advisory services.",
        ],
        links: [
          { label: "View enterprise pricing", href: "/pricing" },
          { label: "Review implementation guides", href: DOCS_HOME_HREF },
          { label: "Schedule consultation", href: "/contact" },
        ],
      },
    ],
  },
  "product-led-growth": {
    slug: "product-led-growth",
    badge: "Growth strategy",
    title: "Accelerate product-led growth through systematic user feedback loops",
    description:
      "Explore how PLG teams use continuous feedback to improve onboarding, drive adoption, and convert free users into paying customers.",
    sections: [
      {
        title: "The PLG feedback imperative",
        paragraphs: [
          "Product-led growth organizations face a fundamental challenge: scaling user acquisition and conversion without traditional sales interventions. Success depends entirely on the product's ability to demonstrate value, guide users through critical activation moments, and convert engagement into revenue through self-service mechanisms.",
          "Traditional feedback collection methods periodic surveys, support tickets, and quarterly business reviews prove insufficient for PLG models that require real-time insights into user behavior, feature utilization, and conversion barriers. The absence of systematic feedback loops creates blind spots that impede product optimization and revenue growth.",
        ],
      },
      {
        title: "1. Establish continuous user sentiment monitoring",
        paragraphs: [
          "Deploy sophisticated feedback collection mechanisms throughout the user journey to capture sentiment at critical decision points. Implement contextual surveys that appear during feature exploration, after milestone achievements, and at conversion decision moments.",
          "Configure behavioral triggers that solicit feedback based on usage patterns, session duration, and feature interaction data. This systematic approach ensures comprehensive coverage while maintaining optimal user experience through strategic timing and relevance-based targeting.",
        ],
      },
      {
        title: "2. Correlate feedback with conversion metrics",
        paragraphs: [
          "Develop advanced analytics frameworks that establish causal relationships between user feedback themes and key conversion indicators. Track how sentiment patterns correlate with trial-to-paid conversion rates, feature adoption velocity, and customer lifetime value expansion.",
          "Implement predictive modeling that identifies feedback patterns preceding conversion events or churn risk. By systematically analyzing qualitative input alongside quantitative behavioral data, product teams can optimize user experiences to maximize conversion probability and minimize acquisition costs.",
        ],
      },
      {
        title: "3. Optimize onboarding through systematic iteration",
        paragraphs: [
          "Transform onboarding experiences through continuous feedback-driven optimization. Establish baseline metrics for time-to-value, feature discovery rates, and user activation milestones, then systematically test improvements based on user input and behavioral analysis.",
          "Create feedback loops that connect user sentiment directly to product roadmap decisions. Prioritize development initiatives that address the most significant barriers to user activation and conversion, ensuring product investments directly impact revenue growth through improved user experiences.",
        ],
      },
      {
        title: "4. Build viral growth mechanisms through user advocacy",
        paragraphs: [
          "Leverage positive user sentiment to create systematic referral and advocacy programs. Identify highly satisfied users through feedback analysis and convert their enthusiasm into structured growth initiatives including testimonials, case studies, and referral program participation.",
          "Develop sophisticated user segmentation based on satisfaction scores, usage patterns, and feedback themes. Create targeted engagement campaigns that transform satisfied users into active promoters while addressing concerns that might inhibit viral growth potential.",
        ],
      },
      {
        title: "Strategic implementation framework",
        paragraphs: [
          "A B2B SaaS company implements comprehensive feedback collection across their freemium product, targeting users at key moments: initial signup, first feature usage, team invitation activities, and upgrade decision points. They establish sophisticated behavioral triggers based on session length, feature combinations, and usage frequency.",
          "Analysis reveals that users who provide positive feedback within the first 14 days show 4.8x higher conversion rates compared to non-responders. Critical feedback themes around collaboration features directly correlate with team adoption rates, leading to prioritized development that increases paid conversions by 67% within two quarters.",
          "Systematic user advocacy programs generate 38% of new user acquisitions through referrals, while feedback-driven product improvements reduce time-to-value by 52% and increase monthly active usage by 89% among converted customers.",
        ],
      },
      {
        title: "Optimal organizational characteristics",
        paragraphs: [
          "This systematic approach delivers maximum value for SaaS organizations pursuing product-led growth strategies with self-service acquisition models. Ideal implementations include companies featuring:",
        ],
        list: [
          "Freemium or free trial conversion models dependent on product value demonstration",
          "Self-service onboarding processes requiring minimal human intervention",
          "Viral growth potential through team collaboration or network effects",
          "Monthly recurring revenue models with rapid payback periods",
          "Product portfolios designed for gradual feature discovery and expansion",
          "Customer acquisition strategies emphasizing organic growth over sales-led approaches",
        ],
      },
      {
        title: "Advanced optimization methodology",
        paragraphs: [
          "Initiate implementation through comprehensive baseline establishment across all user touchpoints. Deploy sophisticated feedback collection instruments that capture both quantitative satisfaction metrics and qualitative improvement suggestions.",
          "Establish rigorous testing protocols that correlate product modifications with user sentiment changes and conversion rate impacts. Create cross-functional collaboration frameworks that ensure product, marketing, and growth teams align on feedback-driven optimization priorities.",
        ],
        links: [
          { label: "View growth-focused pricing", href: "/pricing" },
          { label: "Access PLG implementation guides", href: DOCS_HOME_HREF },
          { label: "Explore conversion optimization tools", href: "/tools" },
        ],
      },
    ],
  },
}

export const getUseCaseArticle = (slug: string) => USE_CASE_ARTICLES[slug]
