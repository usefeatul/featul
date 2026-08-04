'use client'

import { Container } from '../global/container'
import { FaqAccordion } from '@/components/shared/accordion'
import { faqItems } from '@/data/faqs'

type FAQsFourProps = {
    /** When false, skip the outer Container (e.g. already inside SkyPageShell). */
    contained?: boolean
}

export default function FAQsFour({ contained = true }: FAQsFourProps) {
    const content = (
        <section className="my-6 sm:my-8 py-4 sm:py-4 md:py-6" data-component="FAQ">
            <div className={contained ? 'w-full max-w-6xl px-0 sm:px-6' : 'w-full'}>
                <FaqAccordion
                    title="Questions &amp; Answers"
                    description="Get the essentials of feedback management and see how Featul helps you ship better products."
                    items={faqItems}
                />
            </div>
        </section>
    )

    if (!contained) return content

    return (
        <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
            {content}
        </Container>
    )
}
