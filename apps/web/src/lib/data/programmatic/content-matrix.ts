/**
 * Content Matrix for Programmatic SEO
 *
 * Defines the "Hubs" and relationships for generating SEO pages.
 * Each hub represents a content category with associated pages.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ContentHub {
    slug: string;
    name: string;
    description: string;
    /** Related hubs for internal linking */
    relatedHubs: string[];
}

export interface CompetitorEntry {
    slug: string;
    name: string;
    website: string;
    tagline: string;
    /** Victory points: areas where Featul wins */
    victoryPoints: string[];
    /** Trade-offs: areas where competitor might win */
    tradeoffs: string[];
    /** Related definition slugs for internal linking */
    relatedDefinitions: string[];
    /** Related tool slugs for internal linking */
    relatedTools: string[];
}

export interface IntegrationEntry {
    slug: string;
    name: string;
    category: "communication" | "project-management" | "analytics" | "automation";
    description: string;
    benefits: string[];
    /** Related definition slugs */
    relatedDefinitions: string[];
}

export interface UseCaseEntry {
    slug: string;
    title: string;
    industry?: string;
    persona?: string;
    painPoints: string[];
    solutions: string[];
    relatedDefinitions: string[];
    relatedTools: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Content Hubs
// ─────────────────────────────────────────────────────────────────────────────

export const CONTENT_HUBS: ContentHub[] = [
    {
        slug: "alternatives",
        name: "Alternatives",
        description: "Compare Featul with other product feedback tools",
        relatedHubs: ["definitions", "tools", "use-cases"],
    },
    {
        slug: "definitions",
        name: "Definitions",
        description: "SaaS metrics and product management terminology",
        relatedHubs: ["tools", "blog"],
    },
    {
        slug: "tools",
        name: "Tools & Calculators",
        description: "Interactive calculators for SaaS metrics",
        relatedHubs: ["definitions", "use-cases"],
    },
    {
        slug: "use-cases",
        name: "Use Cases",
        description: "How teams use Featul for product feedback",
        relatedHubs: ["alternatives", "blog"],
    },
    {
        slug: "integrations",
        name: "Integrations",
        description: "Connect Featul with your favorite tools",
        relatedHubs: ["use-cases", "tools"],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Competitors (extends existing alternatives)
// ─────────────────────────────────────────────────────────────────────────────

export const COMPETITORS: CompetitorEntry[] = [
    // ── Core Feedback Tools ────────────────────────────────────────────────────
    {
        slug: "userjot",
        name: "UserJot",
        website: "https://userjot.com",
        tagline: "Lightweight feedback collection",
        victoryPoints: [
            "EU-hosted by default for GDPR compliance",
            "Unified feedback, roadmap, and changelog in one tool",
            "More comprehensive feature set",
        ],
        tradeoffs: [
            "UserJot has a simpler, more minimalist interface",
            "Faster initial setup for basic use cases",
        ],
        relatedDefinitions: ["product-feedback", "feature-voting", "roadmap"],
        relatedTools: ["nps-calculator", "churn-rate-calculator"],
    },
    {
        slug: "nolt",
        name: "Nolt",
        website: "https://nolt.io",
        tagline: "Feature voting boards",
        victoryPoints: [
            "Built-in changelog functionality",
            "EU data residency by default",
            "More granular privacy controls",
        ],
        tradeoffs: [
            "Nolt has popular, well-established boards",
            "Good user experience for voting",
        ],
        relatedDefinitions: ["feature-voting", "product-feedback", "roadmap"],
        relatedTools: ["nps-calculator", "retention-calculator"],
    },
    {
        slug: "featurebase",
        name: "Featurebase",
        website: "https://featurebase.app",
        tagline: "All-in-one feedback platform",
        victoryPoints: [
            "EU-hosted with stronger privacy defaults",
            "Simpler pricing, no hidden tiers",
            "Unified suite without add-on complexity",
        ],
        tradeoffs: [
            "Featurebase has an active community",
            "Rich voting and feedback features",
        ],
        relatedDefinitions: ["product-feedback", "feature-voting", "changelog"],
        relatedTools: ["nps-calculator", "churn-rate-calculator"],
    },
    {
        slug: "upvoty",
        name: "Upvoty",
        website: "https://upvoty.com",
        tagline: "User feedback and voting boards",
        victoryPoints: [
            "EU hosting and GDPR-first approach",
            "Complete changelog functionality",
            "More privacy controls out of the box",
        ],
        tradeoffs: [
            "Upvoty has simple, focused voting flows",
            "Clean and minimal interface",
        ],
        relatedDefinitions: ["feature-voting", "product-feedback"],
        relatedTools: ["nps-calculator"],
    },
    {
        slug: "canny",
        name: "Canny",
        website: "https://canny.io",
        tagline: "Feature request tracking",
        victoryPoints: [
            "EU-hosted by default for GDPR compliance",
            "Unified feedback, roadmap, and changelog in one tool",
            "More affordable for small teams",
        ],
        tradeoffs: [
            "Canny has more enterprise integrations",
            "Longer track record in the market",
        ],
        relatedDefinitions: ["product-feedback", "feature-voting", "roadmap"],
        relatedTools: ["nps-calculator", "churn-rate-calculator"],
    },
    // ── Enterprise & PM Tools ──────────────────────────────────────────────────
    {
        slug: "productboard",
        name: "Productboard",
        website: "https://productboard.com",
        tagline: "Product management platform",
        victoryPoints: [
            "Simpler setup, no learning curve",
            "Privacy-first with EU hosting",
            "Transparent pricing, no hidden costs",
        ],
        tradeoffs: [
            "Productboard offers deeper product analytics",
            "More granular prioritization frameworks",
        ],
        relatedDefinitions: ["prioritization", "customer-feedback", "product-roadmap"],
        relatedTools: ["ltv-calculator", "arr-calculator"],
    },
    {
        slug: "uservoice",
        name: "UserVoice",
        website: "https://uservoice.com",
        tagline: "Product feedback management",
        victoryPoints: [
            "Modern, intuitive interface",
            "Faster implementation time",
            "No enterprise-only pricing tiers",
        ],
        tradeoffs: [
            "UserVoice has longer enterprise experience",
            "More established support resources",
        ],
        relatedDefinitions: ["customer-feedback", "feature-request"],
        relatedTools: ["nps-calculator"],
    },
    {
        slug: "aha",
        name: "Aha!",
        website: "https://aha.io",
        tagline: "Product roadmap software",
        victoryPoints: [
            "Less complex, easier to adopt",
            "Better for customer-facing roadmaps",
            "EU data residency included",
        ],
        tradeoffs: [
            "Aha! offers more strategic planning features",
            "Deeper Jira integration options",
        ],
        relatedDefinitions: ["roadmap", "product-strategy"],
        relatedTools: ["growth-rate-calculator"],
    },
    {
        slug: "pendo",
        name: "Pendo",
        website: "https://pendo.io",
        tagline: "Product experience platform",
        victoryPoints: [
            "Focused on feedback, not analytics bloat",
            "Simpler pricing model",
            "GDPR-compliant by default",
        ],
        tradeoffs: [
            "Pendo offers in-app guides and analytics",
            "Larger ecosystem of integrations",
        ],
        relatedDefinitions: ["product-analytics", "user-engagement"],
        relatedTools: ["retention-calculator", "dau-mau-calculator"],
    },
    // ── Additional Feedback Tools ──────────────────────────────────────────────
    {
        slug: "frill",
        name: "Frill",
        website: "https://frill.co",
        tagline: "Feedback, roadmaps, and announcements",
        victoryPoints: [
            "EU-hosted with full GDPR compliance",
            "More comprehensive roadmap features",
            "Better changelog customization",
        ],
        tradeoffs: [
            "Frill has a clean, modern interface",
            "Good embeddable widget options",
        ],
        relatedDefinitions: ["product-feedback", "roadmap", "changelog"],
        relatedTools: ["nps-calculator"],
    },
    {
        slug: "sleekplan",
        name: "Sleekplan",
        website: "https://sleekplan.com",
        tagline: "All-in-one feedback tool",
        victoryPoints: [
            "EU data residency by default",
            "Deeper roadmap customization",
            "More flexible pricing for startups",
        ],
        tradeoffs: [
            "Sleekplan has robust widget embedding",
            "Good satisfaction survey features",
        ],
        relatedDefinitions: ["product-feedback", "feature-voting", "changelog"],
        relatedTools: ["nps-calculator", "churn-rate-calculator"],
    },
    {
        slug: "roadmunk",
        name: "Roadmunk",
        website: "https://roadmunk.com",
        tagline: "Visual product roadmaps",
        victoryPoints: [
            "Integrated feedback collection",
            "EU-hosted and privacy-first",
            "Simpler pricing model",
        ],
        tradeoffs: [
            "Roadmunk offers beautiful timeline views",
            "More presentation-ready roadmaps",
        ],
        relatedDefinitions: ["roadmap", "product-strategy", "stakeholder-communication"],
        relatedTools: ["growth-rate-calculator"],
    },
    {
        slug: "beamer",
        name: "Beamer",
        website: "https://getbeamer.com",
        tagline: "Changelog and announcement tool",
        victoryPoints: [
            "Unified feedback and changelog together",
            "EU-hosted by default",
            "More comprehensive roadmap features",
        ],
        tradeoffs: [
            "Beamer excels at in-app announcements",
            "Strong widget notification system",
        ],
        relatedDefinitions: ["changelog", "product-updates", "customer-engagement"],
        relatedTools: ["retention-calculator"],
    },
    {
        slug: "productlane",
        name: "Productlane",
        website: "https://productlane.com",
        tagline: "Customer feedback for Linear teams",
        victoryPoints: [
            "Works with any project management tool",
            "EU-hosted with stronger privacy",
            "More flexible workflow options",
        ],
        tradeoffs: [
            "Productlane has deep Linear integration",
            "Purpose-built for Linear users",
        ],
        relatedDefinitions: ["product-feedback", "feature-request", "roadmap"],
        relatedTools: ["nps-calculator"],
    },
    {
        slug: "hellonext",
        name: "HelloNext",
        website: "https://hellonext.co",
        tagline: "Feedback and roadmap boards",
        victoryPoints: [
            "EU data residency included",
            "More unified suite experience",
            "Better changelog integration",
        ],
        tradeoffs: [
            "HelloNext has clean feedback boards",
            "Good public portal customization",
        ],
        relatedDefinitions: ["product-feedback", "feature-voting", "roadmap"],
        relatedTools: ["nps-calculator", "churn-rate-calculator"],
    },
    {
        slug: "feedbear",
        name: "FeedBear",
        website: "https://feedbear.com",
        tagline: "Simple feature voting boards",
        victoryPoints: [
            "More feature-rich changelog",
            "EU-hosted by default",
            "Integrated roadmap functionality",
        ],
        tradeoffs: [
            "FeedBear is very affordable",
            "Simple and easy to get started",
        ],
        relatedDefinitions: ["feature-voting", "product-feedback"],
        relatedTools: ["nps-calculator"],
    },
    {
        slug: "noora",
        name: "Noora",
        website: "https://noorahq.com",
        tagline: "AI-powered feedback analysis",
        victoryPoints: [
            "EU-hosted with GDPR compliance",
            "More manual control over categorization",
            "Simpler, transparent pricing",
        ],
        tradeoffs: [
            "Noora offers AI-powered insights",
            "Automatic feedback categorization",
        ],
        relatedDefinitions: ["product-feedback", "customer-insights"],
        relatedTools: ["nps-calculator"],
    },
    {
        slug: "convas",
        name: "Convas",
        website: "https://convas.io",
        tagline: "Customer feedback made simple",
        victoryPoints: [
            "EU-hosted and privacy-first",
            "More comprehensive feature set",
            "Better roadmap visualization",
        ],
        tradeoffs: [
            "Convas has a clean, minimal UI",
            "Quick setup process",
        ],
        relatedDefinitions: ["product-feedback", "feature-voting"],
        relatedTools: ["nps-calculator"],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Integrations
// ─────────────────────────────────────────────────────────────────────────────

export const INTEGRATIONS: IntegrationEntry[] = [
    // ── Communication ────────────────────────────────────────────────────────
    {
        slug: "slack",
        name: "Slack",
        category: "communication",
        description: "Get instant notifications and triage feedback directly in Slack",
        benefits: [
            "Real-time alerts for new feedback",
            "Quick triage without leaving Slack",
            "Team collaboration on feature requests",
        ],
        relatedDefinitions: ["customer-feedback", "team-collaboration"],
    },
    {
        slug: "discord",
        name: "Discord",
        category: "communication",
        description: "Engage your community and capture feedback from Discord channels",
        benefits: [
            "Turn community chats into tracked feedback",
            "Keep your community updated on progress",
            "Vote on features directly from Discord",
        ],
        relatedDefinitions: ["community-engagement", "user-feedback"],
    },
    // {
    //     slug: "microsoft-teams",
    //     name: "Microsoft Teams",
    //     category: "communication",
    //     description: "Seamless feedback management within Microsoft Teams",
    //     benefits: [
    //         "Enterprise-grade notification handling",
    //         "Discuss feedback in Teams channels",
    //         "Direct link to roadmap items",
    //     ],
    //     relatedDefinitions: ["enterprise-collaboration", "product-updates"],
    // },
    // {
    //     slug: "intercom",
    //     name: "Intercom",
    //     category: "communication",
    //     description: "Collect feedback directly from customer conversations",
    //     benefits: [
    //         "Capture feedback from support chats",
    //         "Link conversations to feature requests",
    //         "Close the loop with customers",
    //     ],
    //     relatedDefinitions: ["customer-feedback", "customer-support"],
    // },

    // // ── Project Management ───────────────────────────────────────────────────
    // {
    //     slug: "jira",
    //     name: "Jira",
    //     category: "project-management",
    //     description: "Sync feedback items with Jira issues for seamless development tracking",
    //     benefits: [
    //         "Two-way sync between feedback and issues",
    //         "Automatic status updates",
    //         "Link customer requests to dev work",
    //     ],
    //     relatedDefinitions: ["feature-request", "roadmap"],
    // },
    // {
    //     slug: "linear",
    //     name: "Linear",
    //     category: "project-management",
    //     description: "Connect feedback to Linear issues for modern development workflows",
    //     benefits: [
    //         "Fast, keyboard-driven workflow",
    //         "Automatic issue creation from feedback",
    //         "Status sync to close the loop",
    //     ],
    //     relatedDefinitions: ["feature-request", "product-development"],
    // },
    // {
    //     slug: "trello",
    //     name: "Trello",
    //     category: "project-management",
    //     description: "Turn customer feedback into Trello cards automatically",
    //     benefits: [
    //         "Visual board management for feedback",
    //         "Simple drag-and-drop prioritization",
    //         "Attach feedback to roadmap cards",
    //     ],
    //     relatedDefinitions: ["kanban", "prioritization"],
    // },
    // {
    //     slug: "asana",
    //     name: "Asana",
    //     category: "project-management",
    //     description: "Track feature requests alongside your Asana projects",
    //     benefits: [
    //         "Convert feedback into actionable tasks",
    //         "keep product and engineering aligned",
    //         "Track progress on customer requests",
    //     ],
    //     relatedDefinitions: ["project-management", "roadmap"],
    // },
    // {
    //     slug: "clickup",
    //     name: "ClickUp",
    //     category: "project-management",
    //     description: "Manage product feedback within your ClickUp workspace",
    //     benefits: [
    //         "Centralize feedback in your all-in-one tool",
    //         "Custom views for feedback triage",
    //         "Link requests to docs and goals",
    //     ],
    //     relatedDefinitions: ["productivity", "feature-request"],
    // },

    // // ── CRM & Support ────────────────────────────────────────────────────────
    // {
    //     slug: "hubspot",
    //     name: "HubSpot",
    //     category: "analytics",
    //     description: "Enrich user feedback with HubSpot CRM data",
    //     benefits: [
    //         "See who asked for what features",
    //         "Prioritize based on deal value",
    //         "Close the loop with sales teams",
    //     ],
    //     relatedDefinitions: ["customer-success", "sales-enablement"],
    // },
    // {
    //     slug: "salesforce",
    //     name: "Salesforce",
    //     category: "analytics",
    //     description: "Connect product feedback to enterprise customer data",
    //     benefits: [
    //         "Link revenue to feature requests",
    //         "Enterprise-grade feedback management",
    //         "Identify high-value opportunities",
    //     ],
    //     relatedDefinitions: ["enterprise-sales", "product-strategy"],
    // },
    // {
    //     slug: "zendesk",
    //     name: "Zendesk",
    //     category: "communication",
    //     description: "Turn support tickets into product insights",
    //     benefits: [
    //         "Escalate tickets to product team",
    //         "Reduce support volume with public roadmap",
    //         "Keep energetic customers informed",
    //     ],
    //     relatedDefinitions: ["customer-support", "ticket-management"],
    // },

    // // ── Automation & Knowledge ───────────────────────────────────────────────
    // {
    //     slug: "zapier",
    //     name: "Zapier",
    //     category: "automation",
    //     description: "Automate workflows with 5,000+ apps",
    //     benefits: [
    //         "Connect to any tool in your stack",
    //         "Automate feedback routing",
    //         "Trigger actions based on votes",
    //     ],
    //     relatedDefinitions: ["automation", "workflow"],
    // },
    // {
    //     slug: "notion",
    //     name: "Notion",
    //     category: "project-management",
    //     description: "Embed feedback boards and roadmaps in Notion",
    //     benefits: [
    //         "Share roadmaps in your company wiki",
    //         "Organize research alongside feedback",
    //         "Collaborate on specs and PRDs",
    //     ],
    //     relatedDefinitions: ["knowledge-management", "product-specs"],
    // },
];

// ─────────────────────────────────────────────────────────────────────────────
// Use Cases
// ─────────────────────────────────────────────────────────────────────────────

export const USE_CASES: UseCaseEntry[] = [
    // ── Industry Specific ────────────────────────────────────────────────────
    {
        slug: "saas-product-feedback",
        title: "Product Feedback for SaaS Companies",
        industry: "SaaS",
        persona: "Product Manager",
        painPoints: [
            "Feedback scattered across email, Slack, and support tickets",
            "No visibility into what customers want most",
            "Difficulty closing the loop on shipped features",
        ],
        solutions: [
            "Centralized feedback board with voting",
            "Priority scoring based on customer value",
            "Automatic changelog notifications",
        ],
        relatedDefinitions: ["product-feedback", "feature-voting", "changelog"],
        relatedTools: ["nps-calculator", "churn-rate-calculator"],
    },
    {
        slug: "mobile-app-feedback",
        title: "Feedback Collection for Mobile Apps",
        industry: "Mobile",
        persona: "Mobile Developer",
        painPoints: [
            "App Store reviews are unstructured and hard to track",
            "Users can't easily report bugs in-app",
            "Hard to segment iOS vs Android feedback",
        ],
        solutions: [
            "In-app feedback widgets for iOS and Android",
            "Structured bug reporting forms",
            "Segment feedback by platform and version",
        ],
        relatedDefinitions: ["user-feedback", "mobile-analytics"],
        relatedTools: ["dau-mau-calculator", "retention-calculator"],
    },
    {
        slug: "open-source-roadmap",
        title: "Roadmap for Open Source Projects",
        industry: "Open Source",
        persona: "Maintainer",
        painPoints: [
            "GitHub Issues get cluttered with feature requests",
            "Hard to gauge community interest vs noisy minority",
            "Roadmap visibility limited to contributors",
        ],
        solutions: [
            "Dedicated feature voting board separate from Issues",
            "Public roadmap for community alignment",
            "Clear contribution guidelines integration",
        ],
        relatedDefinitions: ["open-source", "community-management"],
        relatedTools: ["github-star-tracker"], // Hypothetical tool relevant to OS
    },

    // ── Organization Stage ───────────────────────────────────────────────────
    {
        slug: "startup-roadmap",
        title: "Public Roadmap for Startups",
        industry: "Startup",
        persona: "Founder",
        painPoints: [
            "Building features customers don't want",
            "Lack of transparency with early adopters",
            "No way to validate ideas before building",
        ],
        solutions: [
            "Public roadmap to share priorities",
            "Validate ideas with customer votes",
            "Build trust with transparent development",
        ],
        relatedDefinitions: ["roadmap", "product-validation"],
        relatedTools: ["ltv-calculator", "growth-rate-calculator"],
    },
    {
        slug: "enterprise-changelog",
        title: "Changelog for Enterprise Teams",
        industry: "Enterprise",
        persona: "Customer Success Manager",
        painPoints: [
            "Customers unaware of new features",
            "Release notes lost in email inboxes",
            "No engagement metrics on announcements",
        ],
        solutions: [
            "Beautiful changelog pages for each release",
            "In-app widgets for announcements",
            "Track engagement and feedback on releases",
        ],
        relatedDefinitions: ["changelog", "product-updates"],
        relatedTools: ["retention-calculator"],
    },

    // ── Business Model ───────────────────────────────────────────────────────
    {
        slug: "b2b-customer-feedback",
        title: "Feedback Management for B2B",
        industry: "B2B",
        persona: "Product Owner",
        painPoints: [
            "High-value customers feel unheard",
            "Sales team promises features without checking",
            "Loss of key accounts due to missing features",
        ],
        solutions: [
            "Private boards for key accounts",
            "Weight votes by MRR/ARR (Integration)",
            "Manual status updates for sales enablement",
        ],
        relatedDefinitions: ["customer-success", "churn-reduction"],
        relatedTools: ["arr-calculator", "ltv-calculator"],
    },
    {
        slug: "internal-product-feedback",
        title: "Feedback for Internal Tools",
        industry: "Corporate",
        persona: "IT Manager",
        painPoints: [
            "Employees complain about tools in varied channels",
            "Shadow IT solutions cropping up",
            "No way to measure internal tool satisfaction",
        ],
        solutions: [
            "SSO-gated internal feedback portal",
            "Anonymous suggestion box options",
            "IT roadmap transparency",
        ],
        relatedDefinitions: ["employee-engagement", "digital-transformation"],
        relatedTools: ["nps-calculator"],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────────────────────

export function getHubBySlug(slug: string): ContentHub | undefined {
    return CONTENT_HUBS.find((h) => h.slug === slug);
}

export function getCompetitorBySlug(slug: string): CompetitorEntry | undefined {
    return COMPETITORS.find((c) => c.slug === slug);
}

export function getIntegrationBySlug(slug: string): IntegrationEntry | undefined {
    return INTEGRATIONS.find((i) => i.slug === slug);
}

export function getUseCaseBySlug(slug: string): UseCaseEntry | undefined {
    return USE_CASES.find((u) => u.slug === slug);
}

export function getAllCompetitorSlugs(): string[] {
    return COMPETITORS.map((c) => c.slug);
}

export function getAllIntegrationSlugs(): string[] {
    return INTEGRATIONS.map((i) => i.slug);
}

export function getAllUseCaseSlugs(): string[] {
    return USE_CASES.map((u) => u.slug);
}
