/**
 * Page Generators for Programmatic SEO
 *
 * Functions to generate unique page content from the content matrix.
 * These ensure each page has distinct, intent-matched content.
 */

import type { CompetitorEntry, IntegrationEntry, UseCaseEntry } from "./content-matrix";
import { COMPETITORS, INTEGRATIONS, USE_CASES } from "./content-matrix";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GeneratedPageMeta {
    title: string;
    description: string;
    h1: string;
    canonical: string;
}

export interface ComparisonPageData {
    meta: GeneratedPageMeta;
    competitor: CompetitorEntry;
    sections: {
        intro: string;
        victoryPoints: { title: string; description: string }[];
        tradeoffs: { title: string; description: string }[];
        verdict: string;
    };
    faqs: { question: string; answer: string }[];
}

export interface IntegrationPageData {
    meta: GeneratedPageMeta;
    integration: IntegrationEntry;
    sections: {
        intro: string;
        benefits: { title: string; description: string }[];
        howItWorks: string[];
    };
    faqs: { question: string; answer: string }[];
}

export interface UseCasePageData {
    meta: GeneratedPageMeta;
    useCase: UseCaseEntry;
    sections: {
        intro: string;
        painPoints: { problem: string; impact: string }[];
        solutions: { solution: string; benefit: string }[];
    };
    faqs: { question: string; answer: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Comparison Page Generator
// ─────────────────────────────────────────────────────────────────────────────

export function generateComparisonPage(slug: string): ComparisonPageData | null {
    const competitor = COMPETITORS.find((c) => c.slug === slug);
    if (!competitor) return null;

    // Build unique description using competitor-specific data
    const primaryAdvantage = competitor.victoryPoints[0] || "privacy-first approach";
    const uniqueDescription = `${competitor.name} is known for ${competitor.tagline.toLowerCase()}. Featul offers ${primaryAdvantage.toLowerCase()}. Compare features, pricing, and privacy to find the right fit.`;

    // Unique intro based on competitor category
    const introVariants: Record<string, string> = {
        "saas": `${competitor.name} has been a popular choice for SaaS teams. But if you value EU hosting and GDPR compliance, Featul might be the better fit.`,
        "enterprise": `Enterprise teams often evaluate ${competitor.name}. Featul offers a simpler, privacy-first alternative without the complexity.`,
        "startup": `Startups love ${competitor.name} for its simplicity. Featul matches that while adding EU hosting and unified changelog.`,
    };

    // Pick intro variant based on competitor name pattern
    let introKey = "saas";
    if (["productboard", "aha", "pendo", "uservoice", "salesforce"].includes(slug)) {
        introKey = "enterprise";
    } else if (["userjot", "nolt", "upvoty", "feedbear", "convas"].includes(slug)) {
        introKey = "startup";
    }

    const meta: GeneratedPageMeta = {
        title: `Featul vs ${competitor.name}: A Detailed Comparison`,
        description: uniqueDescription,
        h1: `${competitor.name} Alternative: Why Teams Choose Featul`,
        canonical: `/alternatives/${slug}`,
    };

    const sections = {
        intro: introVariants[introKey] || `Looking for an alternative to ${competitor.name}? Featul offers a privacy-first approach to product feedback with EU hosting by default. Here's how we compare.`,
        victoryPoints: competitor.victoryPoints.map((point, i) => ({
            title: `Advantage ${i + 1}`,
            description: point,
        })),
        tradeoffs: competitor.tradeoffs.map((point, i) => ({
            title: `Consideration ${i + 1}`,
            description: point,
        })),
        verdict: `Both Featul and ${competitor.name} are solid choices for product feedback. Choose Featul if you prioritize EU hosting, GDPR compliance, and a unified feedback-roadmap-changelog experience. Consider ${competitor.name} if ${competitor.tradeoffs[0]?.toLowerCase() || "you need their specific features"}.`,
    };

    const faqs = [
        {
            question: `Is Featul a good alternative to ${competitor.name}?`,
            answer: `Yes, Featul is designed as a privacy-first alternative to ${competitor.name}. It offers EU hosting by default, GDPR compliance, and combines feedback boards, public roadmaps, and changelogs in one tool.`,
        },
        {
            question: `How does Featul pricing compare to ${competitor.name}?`,
            answer: `Featul offers transparent, affordable pricing with no hidden enterprise tiers. Visit our pricing page for current plans and see how we compare.`,
        },
        {
            question: `Can I migrate from ${competitor.name} to Featul?`,
            answer: `Yes, we offer migration support to help you move your existing feedback data from ${competitor.name} to Featul. Contact our team for assistance.`,
        },
    ];

    return { meta, competitor, sections, faqs };
}

// ─────────────────────────────────────────────────────────────────────────────
// Integration Page Generator
// ─────────────────────────────────────────────────────────────────────────────

export function generateIntegrationPage(slug: string): IntegrationPageData | null {
    const integration = INTEGRATIONS.find((i) => i.slug === slug);
    if (!integration) return null;

    const meta: GeneratedPageMeta = {
        title: `Featul + ${integration.name} Integration`,
        description: `Connect Featul with ${integration.name} to ${integration.description.toLowerCase()}. Streamline your product feedback workflow.`,
        h1: `${integration.name} Integration for Product Feedback`,
        canonical: `/integrations/${slug}`,
    };

    const sections = {
        intro: `Connect Featul with ${integration.name} to supercharge your product feedback workflow. ${integration.description}`,
        benefits: integration.benefits.map((benefit, i) => ({
            title: `Benefit ${i + 1}`,
            description: benefit,
        })),
        howItWorks: [
            `Connect your ${integration.name} account to Featul in Settings > Integrations`,
            "Configure notification preferences and sync settings",
            "Start receiving feedback updates and managing requests seamlessly",
        ],
    };

    const faqs = [
        {
            question: `How do I connect ${integration.name} to Featul?`,
            answer: `Go to Settings > Integrations in your Featul dashboard, find ${integration.name}, and click Connect. Follow the OAuth prompts to authorize the connection.`,
        },
        {
            question: `What can I do with the ${integration.name} integration?`,
            answer: integration.description,
        },
    ];

    return { meta, integration, sections, faqs };
}

// ─────────────────────────────────────────────────────────────────────────────
// Use Case Page Generator
// ─────────────────────────────────────────────────────────────────────────────

export function generateUseCasePage(slug: string): UseCasePageData | null {
    const useCase = USE_CASES.find((u) => u.slug === slug);
    if (!useCase) return null;

    const meta: GeneratedPageMeta = {
        title: useCase.title,
        description: `Learn how ${useCase.persona || "teams"} use Featul for ${useCase.title.toLowerCase()}. See solutions to common challenges and get started free.`,
        h1: useCase.title,
        canonical: `/use-cases/${slug}`,
    };

    const sections = {
        intro: `Discover how Featul helps ${useCase.industry || "modern"} teams solve real product feedback challenges.`,
        painPoints: useCase.painPoints.map((problem) => ({
            problem,
            impact: `This leads to misaligned priorities and wasted development effort.`,
        })),
        solutions: useCase.solutions.map((solution) => ({
            solution,
            benefit: `Save time and build what customers actually want.`,
        })),
    };

    const faqs = [
        {
            question: `Is Featul right for ${useCase.industry || "my"} teams?`,
            answer: `Yes, Featul is designed for ${useCase.persona || "product"} teams who need to centralize feedback, share roadmaps, and publish changelogs in one privacy-first platform.`,
        },
        {
            question: `How quickly can I get started?`,
            answer: `Most teams are up and running within 10 minutes. Sign up free and import your existing feedback or start fresh.`,
        },
    ];

    return { meta, useCase, sections, faqs };
}

// ─────────────────────────────────────────────────────────────────────────────
// Bulk generators for static params
// ─────────────────────────────────────────────────────────────────────────────

export function getAllComparisonPages(): ComparisonPageData[] {
    return COMPETITORS.map((c) => generateComparisonPage(c.slug)).filter(
        (p): p is ComparisonPageData => p !== null
    );
}

export function getAllIntegrationPages(): IntegrationPageData[] {
    return INTEGRATIONS.map((i) => generateIntegrationPage(i.slug)).filter(
        (p): p is IntegrationPageData => p !== null
    );
}

export function getAllUseCasePages(): UseCasePageData[] {
    return USE_CASES.map((u) => generateUseCasePage(u.slug)).filter(
        (p): p is UseCasePageData => p !== null
    );
}
