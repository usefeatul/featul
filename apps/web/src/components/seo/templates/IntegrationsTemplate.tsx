/**
 * IntegrationsTemplate - Smart template for Integration pages
 *
 * Renders a structured integration page with:
 * - Dynamic hero with integration details
 * - Benefits section
 * - "How it works" steps
 * - FAQs with schema markup
 * - Related pages section (from interlink.ts)
 */

import Link from "next/link";
import Script from "next/script";
import { Container } from "@/components/global/container";
import { VerticalLines } from "@/components/vertical-lines";
import type { IntegrationPageData } from "@/lib/data/programmatic/generators";
import type { RelatedLink } from "@/lib/seo/interlink";
import { SITE_URL } from "@/config/seo";

interface Props {
    data: IntegrationPageData;
    relatedLinks: RelatedLink[];
}

export function IntegrationsTemplate({ data, relatedLinks }: Props) {
    const { meta, integration, sections, faqs } = data;

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
            { "@type": "ListItem", position: 1, name: "Integrations", item: `${SITE_URL}/integrations` },
            { "@type": "ListItem", position: 2, name: integration.name, item: `${SITE_URL}${meta.canonical}` },
        ],
    };

    // Build SoftwareApplication Schema (for the Integration)
    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: `Featul + ${integration.name} Integration`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web application",
        offeres: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        }
    };

    return (
        <main className="min-h-screen pt-16 bg-background">
            {/* JSON-LD Schemas */}
            <Script
                id="integration-faq-jsonld"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Script
                id="integration-breadcrumb-jsonld"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <Script
                id="integration-software-jsonld"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
            />

            <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18 relative">
                <VerticalLines className="absolute z-0" />

                {/* Hero Section */}
                <section className="pt-10 md:pt-16 pb-12 relative z-10">
                    <div className="max-w-3xl">
                        <p className="text-sm text-muted-foreground mb-2">
                            <Link href="/integrations" className="hover:underline">
                                Integrations
                            </Link>
                            {" / "}
                            {integration.category.charAt(0).toUpperCase() + integration.category.slice(1)}
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
                                Connect {integration.name} →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Benefits Grid */}
                <section className="py-12 relative z-10">
                    <h2 className="text-2xl font-semibold mb-6">integration Benefits</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {sections.benefits.map((benefit, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-primary text-xl">⚡</span>
                                    <span className="font-medium text-lg">{benefit.title}</span>
                                </div>
                                <p className="text-muted-foreground">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section className="py-12 relative z-10">
                    <div className="p-8 rounded-lg border border-border bg-muted/30">
                        <h2 className="text-2xl font-semibold mb-6">How to Connect</h2>
                        <div className="space-y-6">
                            {sections.howItWorks.map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-foreground font-medium">{step}</p>
                                    </div>
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

export default IntegrationsTemplate;
