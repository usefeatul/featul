'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@featul/ui/components/accordion'
import { Container } from '../global/container'
import { faqItems } from '@/data/faqs'
import { ChevronDownIcon } from 'lucide-react'

type FAQsFourProps = {
    /** When false, skip the outer Container (e.g. already inside SkyPageShell). */
    contained?: boolean
}

export default function FAQsFour({ contained = true }: FAQsFourProps) {
    const content = (
        <section className="my-6 sm:my-8 py-4 sm:py-4 md:py-6" data-component="FAQ">
            <div className={contained ? 'w-full max-w-6xl px-0 sm:px-6' : 'w-full'}>
                <div className="text-left">
                    <h2 className="font-heading text-balance text-3xl font-semibold">Questions &amp; Answers</h2>
                </div>

                <div className="mt-4">
                    <p className="max-w-2xl text-accent text-md">
                        Get the essentials of feedback management and see how Featul helps you ship better products.
                    </p>
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full">
                        {faqItems.map((item) => (
                            <div
                                className="group"
                                key={item.id}>
                                <AccordionItem
                                    value={item.id}
                                    className="border-none px-0 py-3">
                                    <AccordionTrigger className="font-heading group cursor-pointer text-left text-md font-medium !no-underline hover:!no-underline justify-start [&>svg]:hidden">
                                        <span className="inline-flex items-center gap-2">
                                            <ChevronDownIcon className="size-4 text-primary transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                            <span>{item.question}</span>
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-6">
                                        <p className="text-left text-accent text-md leading-relaxed">{item.answer}</p>
                                    </AccordionContent>
                                </AccordionItem>
                            </div>
                        ))}
                    </Accordion>
                </div>
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
