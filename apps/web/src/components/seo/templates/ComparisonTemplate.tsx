/**
 * ComparisonTemplate - Smart template for "X vs Featul" pages
 *
 * Renders a structured comparison page with:
 * - Dynamic hero with competitor name
 * - Victory points section
 * - Trade-offs section
 * - FAQs with schema markup
 * - Related pages section (from interlink.ts)
 */

import Link from "next/link";
import Script from "next/script";
import { Container } from "@/components/global/container";
import { VerticalLines } from "@/components/vertical-lines";
import type { ComparisonPageData } from "@/lib/data/programmatic/generators";
import type { RelatedLink } from "@/lib/seo/interlink";
import { SITE_URL } from "@/config/seo";
import { serializeJsonLd } from "@/lib/security";

interface Props {
    data: ComparisonPageData;
    relatedLinks: RelatedLink[];
}

export function ComparisonTemplate({ data, relatedLinks }: Props) {
    const { meta, competitor, sections, faqs } = data;

    // Build FAQ Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
    };

    // Build Breadcrumb Schema
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Alternatives", item: `${SITE_URL}/alternatives` },
            { "@type": "ListItem", position: 2, name: `vs ${competitor.name}`, item: `${SITE_URL}${meta.canonical}` },
        ],
    };

    return (
        <main className="min-h-screen pt-16 bg-background">
            {/* JSON-LD Schemas */}
            <Script
                id="comparison-faq-jsonld"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
            />
            <Script
                id="comparison-breadcrumb-jsonld"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
            />

            <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14 relative">
                <VerticalLines className="absolute z-0" />

                {/* Hero Section */}
                <section className="pt-10 md:pt-16 pb-12 relative z-10">
                    <div className="max-w-3xl">
                        <p className="text-sm text-muted-foreground mb-2">
                            <Link href="/alternatives" className="hover:underline">
                                Alternatives
                            </Link>
                            {" / "}
                            {competitor.name}
                        </p>
                        <h1 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-bold">
                            {meta.h1}
                        </h1>
                        <p className="text-muted-foreground mt-4 text-base sm:text-lg max-w-2xl">
                            {sections.intro}
                        </p>
                    </div>
                </section>

                {/* Victory Points */}
                <section className="py-12 relative z-10">
                    <h2 className="text-2xl font-semibold mb-6">
                        Why Teams Choose Featul Over {competitor.name}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sections.victoryPoints.map((point, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-lg border border-border bg-card"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-green-500 text-lg">✓</span>
                                    <span className="font-medium">{point.title}</span>
                                </div>
                                <p className="text-muted-foreground text-sm">{point.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Trade-offs (Transparent) */}
                <section className="py-12 relative z-10">
                    <h2 className="text-2xl font-semibold mb-6">
                        When {competitor.name} Might Be Right
                    </h2>
                    <p className="text-muted-foreground mb-4">
                        We believe in transparency. Here's when you might consider {competitor.name}:
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                        {sections.tradeoffs.map((point, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-lg border border-border bg-card"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-amber-500 text-lg">⚖️</span>
                                    <span className="font-medium">{point.title}</span>
                                </div>
                                <p className="text-muted-foreground text-sm">{point.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Verdict */}
                <section className="py-12 relative z-10">
                    <div className="p-8 rounded-lg border-2 border-primary/20 bg-primary/5">
                        <h2 className="text-2xl font-semibold mb-4">The Verdict</h2>
                        <p className="text-muted-foreground">{sections.verdict}</p>
                        <div className="mt-6">
                            <Link
                                href="/pricing"
                                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                Try Featul Free →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FAQs */}
                <section className="py-12 relative z-10">
                    <h2 className="text-2xl font-semibold mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="p-6 rounded-lg border border-border bg-card">
                                <h3 className="font-semibold mb-2">{faq.question}</h3>
                                <p className="text-muted-foreground text-sm">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Related Links (The Spiderweb) */}
                {relatedLinks.length > 0 && (
                    <section className="py-12 relative z-10 border-t border-border">
                        <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
                        <div className="flex flex-wrap gap-3">
                            {relatedLinks.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.href}
                                    className="px-4 py-2 rounded-full text-sm border border-border hover:bg-accent transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </Container>
        </main>
    );
}

export default ComparisonTemplate;
