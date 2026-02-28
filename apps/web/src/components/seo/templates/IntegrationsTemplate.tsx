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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@featul/ui/components/accordion";
import type { IntegrationPageData } from "@/lib/data/programmatic/generators";
import type { RelatedLink } from "@/lib/seo/interlink";
import { SITE_URL } from "@/config/seo";
import { ArrowLeft } from "lucide-react";

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
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        }
    };

    return (
        <main className="min-h-[calc(100vh-64px)] bg-background pt-16">
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

            <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
                <section className="py-12 sm:py-16" data-component="IntegrationDetail">
                    <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                        <p className="text-sm text-accent mb-2">
                            <Link href="/integrations" className="hover:text-primary">
                                Integrations
                            </Link>
                            {" / "}
                            {integration.name}
                        </p>

                        <h1 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
                            {meta.h1}
                        </h1>
                        <p className="text-accent mt-4 max-w-3xl">{sections.intro}</p>

                        <div className="mt-6">
                            <Link
                                href="https://app.featul.com/auth/sign-in"
                                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Connect {integration.name}
                            </Link>
                        </div>

                        <div className="mt-12 border-y border-border/70">
                            <section className="py-10">
                                <h2 className="text-xl font-semibold">Integration Benefits</h2>
                                <p className="mt-2 text-sm text-accent">
                                    What you get by connecting {integration.name}.
                                </p>
                                <ul className="mt-6 space-y-3 text-accent">
                                    {sections.benefits.map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-3 leading-relaxed">
                                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground/60" />
                                            <span>{benefit.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="border-t border-border/70 py-10">
                                <h2 className="text-xl font-semibold">How to Connect</h2>
                                <p className="mt-2 text-sm text-accent">
                                    Follow these steps to set up the integration.
                                </p>
                                <ol className="mt-6 space-y-3 text-accent">
                                    {sections.howItWorks.map((step, i) => (
                                        <li key={i} className="flex items-start gap-3 leading-relaxed">
                                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                                {i + 1}
                                            </span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </section>

                            <section className="border-t border-border/70 py-10">
                                <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                                <p className="mt-2 text-sm text-accent">
                                    Common setup and usage questions.
                                </p>
                                <Accordion type="single" collapsible className="mt-6 w-full border-y border-border/60">
                                    {faqs.map((faq, i) => (
                                        <AccordionItem
                                            key={i}
                                            id={`faq-${integration.slug}-${i + 1}`}
                                            value={`faq-${integration.slug}-${i + 1}`}
                                            className="px-0"
                                        >
                                            <AccordionTrigger className="py-4 text-left text-base font-medium !no-underline hover:!no-underline">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-sm leading-relaxed text-accent">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </section>

                            {relatedLinks.length > 0 ? (
                                <section className="border-t border-border/70 py-10">
                                    <h2 className="text-xl font-semibold">Related Resources</h2>
                                    <p className="mt-2 text-sm text-accent">
                                        Explore more pages related to this integration.
                                    </p>
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {relatedLinks.map((link, i) => (
                                            <Link
                                                key={i}
                                                href={link.href}
                                                className="rounded-md border border-border px-3 py-1.5 text-sm text-accent hover:text-primary"
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            ) : null}
                        </div>

                        <div className="mt-6">
                            <Link
                                href="/integrations"
                                className="inline-flex h-8 items-center rounded-md px-2 text-sm text-accent hover:text-primary"
                            >
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                View all integrations
                            </Link>
                        </div>
                    </div>
                </section>
            </Container>
        </main>
    );
}

export default IntegrationsTemplate;
