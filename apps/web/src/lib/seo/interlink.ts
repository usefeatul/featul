/**
 * Internal Linking Utility (The "Spiderweb")
 *
 * Automatically generates related page links to ensure no orphan pages
 * and to build hub-and-spoke internal linking structure.
 */

import { COMPETITORS, INTEGRATIONS, USE_CASES } from "../data/programmatic/content-matrix";
import { getDefinitionBySlug, getAllDefinitionSlugs } from "@/types/definitions";
import { getCategoryBySlug, getAllCategorySlugs } from "@/types/tools";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RelatedLink {
    href: string;
    label: string;
    type: "hub" | "definition" | "tool" | "competitor" | "integration" | "use-case" | "blog";
}

export interface LinkContext {
    currentSlug: string;
    currentType: RelatedLink["type"];
    /** Optional: specific slugs to prioritize */
    prioritySlugs?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Core linking function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get related pages for internal linking.
 * Returns 3-5 relevant pages based on the current page context.
 */
export function getRelatedPages(context: LinkContext): RelatedLink[] {
    const { currentSlug, currentType, prioritySlugs = [] } = context;
    const links: RelatedLink[] = [];

    // 1. Add priority links first (if provided)
    for (const slug of prioritySlugs) {
        const link = resolveSlugToLink(slug);
        if (link && links.length < 5) {
            links.push(link);
        }
    }

    // 2. Add related by type (up to 5 total)
    switch (currentType) {
        case "competitor":
            addCompetitorRelated(currentSlug, links);
            break;
        case "integration":
            addIntegrationRelated(currentSlug, links);
            break;
        case "use-case":
            addUseCaseRelated(currentSlug, links);
            break;
        case "definition":
            addDefinitionRelated(currentSlug, links);
            break;
        case "tool":
            addToolRelated(currentSlug, links);
            break;
        default:
            addGenericRelated(links);
    }

    // Dedupe and limit to 5
    const seen = new Set<string>();
    return links.filter((link) => {
        if (seen.has(link.href)) return false;
        seen.add(link.href);
        return true;
    }).slice(0, 5);
}

// ─────────────────────────────────────────────────────────────────────────────
// Type-specific related link generators
// ─────────────────────────────────────────────────────────────────────────────

function addCompetitorRelated(slug: string, links: RelatedLink[]) {
    const competitor = COMPETITORS.find((c) => c.slug === slug);
    if (!competitor) return;

    // Add related definitions
    for (const defSlug of competitor.relatedDefinitions.slice(0, 2)) {
        const def = getDefinitionBySlug(defSlug);
        if (def) {
            links.push({
                href: `/definitions/${defSlug}`,
                label: `What is ${def.name}?`,
                type: "definition",
            });
        }
    }

    // Add related tools
    for (const toolSlug of competitor.relatedTools.slice(0, 2)) {
        links.push({
            href: `/tools`,
            label: `${toolSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`,
            type: "tool",
        });
    }

    // Add other competitors
    const others = COMPETITORS.filter((c) => c.slug !== slug).slice(0, 2);
    for (const other of others) {
        links.push({
            href: `/alternatives/${other.slug}`,
            label: `Featul vs ${other.name}`,
            type: "competitor",
        });
    }
}

function addIntegrationRelated(slug: string, links: RelatedLink[]) {
    const integration = INTEGRATIONS.find((i) => i.slug === slug);
    if (!integration) return;

    // Add related definitions
    for (const defSlug of integration.relatedDefinitions.slice(0, 1)) {
        const def = getDefinitionBySlug(defSlug);
        if (def) {
            links.push({
                href: `/definitions/${defSlug}`,
                label: `What is ${def.name}?`,
                type: "definition",
            });
        }
    }

    // Add other integrations in same category
    const sameCategory = INTEGRATIONS.filter(
        (i) => i.category === integration.category && i.slug !== slug
    ).slice(0, 1);
    for (const other of sameCategory) {
        links.push({
            href: `/integrations/${other.slug}`,
            label: `${other.name} Integration`,
            type: "integration",
        });
    }

    // Add relevant use cases (cross-hub connection)
    const useCases = USE_CASES.slice(0, 1);
    for (const uc of useCases) {
        links.push({
            href: `/use-cases/${uc.slug}`,
            label: uc.title,
            type: "use-case",
        });
    }

    // Add a top competitor (cross-hub connection)
    const topCompetitor = COMPETITORS[0];
    if (topCompetitor) {
        links.push({
            href: `/alternatives/${topCompetitor.slug}`,
            label: `Featul vs ${topCompetitor.name}`,
            type: "competitor",
        });
    }

    // Add hub link
    links.push({
        href: "/tools",
        label: "All Tools & Calculators",
        type: "hub",
    });
}

function addUseCaseRelated(slug: string, links: RelatedLink[]) {
    const useCase = USE_CASES.find((u) => u.slug === slug);
    if (!useCase) return;

    // Add related definitions
    for (const defSlug of useCase.relatedDefinitions.slice(0, 1)) {
        const def = getDefinitionBySlug(defSlug);
        if (def) {
            links.push({
                href: `/definitions/${defSlug}`,
                label: `What is ${def.name}?`,
                type: "definition",
            });
        }
    }

    // Add related tools (limit to 1)
    for (const toolSlug of useCase.relatedTools.slice(0, 1)) {
        links.push({
            href: `/tools`,
            label: `${toolSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`,
            type: "tool",
        });
    }

    // Add integrations (cross-hub connection)
    const integrations = INTEGRATIONS.slice(0, 1);
    for (const int of integrations) {
        links.push({
            href: `/integrations/${int.slug}`,
            label: `${int.name} Integration`,
            type: "integration",
        });
    }

    // Add a top competitor (cross-hub connection)
    const topCompetitor = COMPETITORS[0];
    if (topCompetitor) {
        links.push({
            href: `/alternatives/${topCompetitor.slug}`,
            label: `Featul vs ${topCompetitor.name}`,
            type: "competitor",
        });
    }

    // Add alternatives hub
    links.push({
        href: "/alternatives",
        label: "Compare with Alternatives",
        type: "hub",
    });
}

function addDefinitionRelated(slug: string, links: RelatedLink[]) {
    // Add tools hub
    links.push({
        href: "/tools",
        label: "Tools & Calculators",
        type: "hub",
    });

    // Add other definitions
    const allDefs = getAllDefinitionSlugs().filter((s) => s !== slug).slice(0, 2);
    for (const defSlug of allDefs) {
        const def = getDefinitionBySlug(defSlug);
        if (def) {
            links.push({
                href: `/definitions/${defSlug}`,
                label: def.name,
                type: "definition",
            });
        }
    }

    // Add alternatives
    links.push({
        href: "/alternatives",
        label: "Compare Featul with Alternatives",
        type: "hub",
    });
}

function addToolRelated(slug: string, links: RelatedLink[]) {
    // Add definitions hub
    links.push({
        href: "/definitions",
        label: "SaaS Metrics Definitions",
        type: "hub",
    });

    // Add other categories
    const categories = getAllCategorySlugs().slice(0, 2);
    for (const cat of categories) {
        const category = getCategoryBySlug(cat);
        if (category) {
            links.push({
                href: `/tools/categories/${cat}`,
                label: category.name,
                type: "tool",
            });
        }
    }

    // Add alternatives
    links.push({
        href: "/alternatives",
        label: "Compare with Alternatives",
        type: "hub",
    });
}

function addGenericRelated(links: RelatedLink[]) {
    links.push(
        { href: "/tools", label: "Tools & Calculators", type: "hub" },
        { href: "/definitions", label: "SaaS Definitions", type: "hub" },
        { href: "/alternatives", label: "Compare Alternatives", type: "hub" },
        { href: "/blog", label: "Blog", type: "hub" }
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: resolve any slug to a link (for priority slugs)
// ─────────────────────────────────────────────────────────────────────────────

function resolveSlugToLink(slug: string): RelatedLink | null {
    // Check definitions
    const def = getDefinitionBySlug(slug);
    if (def) {
        return { href: `/definitions/${slug}`, label: def.name, type: "definition" };
    }

    // Check competitors
    const competitor = COMPETITORS.find((c) => c.slug === slug);
    if (competitor) {
        return { href: `/alternatives/${slug}`, label: `Featul vs ${competitor.name}`, type: "competitor" };
    }

    // Check integrations
    const integration = INTEGRATIONS.find((i) => i.slug === slug);
    if (integration) {
        return { href: `/integrations/${slug}`, label: `${integration.name} Integration`, type: "integration" };
    }

    // Check use cases
    const useCase = USE_CASES.find((u) => u.slug === slug);
    if (useCase) {
        return { href: `/use-cases/${slug}`, label: useCase.title, type: "use-case" };
    }

    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb helper
// ─────────────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
    label: string;
    href: string;
}

export function getBreadcrumbs(path: string): BreadcrumbItem[] {
    const parts = path.split("/").filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

    let currentPath = "";
    for (const part of parts) {
        currentPath += `/${part}`;

        // Humanize the label
        let label = part.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        // Special cases
        if (part === "tools") label = "Tools";
        if (part === "definitions") label = "Definitions";
        if (part === "alternatives") label = "Alternatives";
        if (part === "categories") label = "Categories";

        crumbs.push({ label, href: currentPath });
    }

    return crumbs;
}
