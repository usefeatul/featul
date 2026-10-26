'use client'

import { MarketingContainer } from '@/components/layout/container'
import { FaqAccordion } from '@/components/shared/accordion'
import { faqItems } from '@/data/faqs'
import { homeFaq } from '@/data/home'

type FAQsFourProps = {
    /** When false, skip the outer Container (e.g. already inside SkyPageShell). */
    contained?: boolean
}

export default function FAQsFour({ contained = true }: FAQsFourProps) {
    const content = (
        <section className="my-12 sm:my-16 py-4 sm:py-4 md:py-6" data-component="FAQ">
            <div className={contained ? 'w-full max-w-6xl px-0 sm:px-6' : 'w-full'}>
                <FaqAccordion
                    title={homeFaq.title}
                    description={homeFaq.description}
                    items={faqItems}
                />
            </div>
        </section>
    )

    if (!contained) return content

    return (
        <MarketingContainer>
            {content}
        </MarketingContainer>
    )
}
