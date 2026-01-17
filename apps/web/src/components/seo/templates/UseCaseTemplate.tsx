/**
 * UseCaseTemplate - Smart template for Use Case pages
 *
 * Renders a structured use case page with:
 * - Problem/Solution text
 * - Pain points analysis
 * - Solution benefits
 * - Related pages section
 */

import Link from "next/link";
import Script from "next/script";
import { Container } from "@/components/global/container";
import { VerticalLines } from "@/components/vertical-lines";
import type { UseCasePageData } from "@/lib/data/programmatic/generators";
import type { RelatedLink } from "@/lib/seo/interlink";
import { SITE_URL } from "@/config/seo";

interface Props {
    data: UseCasePageData;
    relatedLinks: RelatedLink[];
}

export function UseCaseTemplate({ data, relatedLinks }: Props) {
    const { meta, useCase, sections, faqs } = data;

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
            { "@type": "ListItem", position: 1, name: "Use Cases", item: `${SITE_URL}/use-cases` },
            { "@type": "ListItem", position: 2, name: useCase.title, item: `${SITE_URL}${meta.canonical}` },
        ],
    };

    return (
        <main className="min-h-screen pt-16 bg-background">
            {/* JSON-LD Schemas */}
            <Script
                id="usecase-faq-jsonld"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Script
                id="usecase-breadcrumb-jsonld"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18 relative">
                <VerticalLines className="absolute z-0" />

                {/* Hero Section */}
                <section className="pt-10 md:pt-16 pb-12 relative z-10">
                    <div className="max-w-3xl">
                        <p className="text-sm text-muted-foreground mb-2">
                            <Link href="/use-cases" className="hover:underline">
                                Use Cases
                            </Link>
                            {" / "}
                            {useCase.industry}
                        </p>
                        <h1 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-bold">
                            {meta.h1}
                        </h1>
                        <p className="text-muted-foreground mt-4 text-base sm:text-lg max-w-2xl">
                            {sections.intro}
                        </p>
                        <div className="mt-8">
                            <Link
                                href="/start"
                                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                Start Free Trial →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Pain Points vs Solutions */}
                <section className="py-12 relative z-10">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Pain Points */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold mb-4 text-red-500/80">The Challenge</h2>
                            {sections.painPoints.map((item, i) => (
                                <div key={i} className="p-6 rounded-lg border border-red-200/20 bg-red-500/5">
                                    <h3 className="font-medium text-foreground mb-2">{item.problem}</h3>
                                    <p className="text-sm text-muted-foreground">{item.impact}</p>
                                </div>
                            ))}
                        </div>

                        {/* Solutions */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold mb-4 text-green-500/80">The Solution</h2>
                            {sections.solutions.map((item, i) => (
                                <div key={i} className="p-6 rounded-lg border border-green-200/20 bg-green-500/5">
                                    <h3 className="font-medium text-foreground mb-2">{item.solution}</h3>
                                    <p className="text-sm text-muted-foreground">{item.benefit}</p>
                                </div>
                            ))}
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

export default UseCaseTemplate;
