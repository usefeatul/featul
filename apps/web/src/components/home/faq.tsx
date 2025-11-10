'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@feedgot/ui/components/accordion'
import { Container } from '../global/container'
import { faqItems } from '@/data/faqs'
import { ChevronDownIcon } from 'lucide-react'

export default function FAQsFour() {

    return (
        <Container  maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
            <section className="py-16 md:py-24">
                <div className="max-w-5xl px-4 sm:px-6">
                <div className="max-w-xl text-left">
                    <h2 className="text-balance text-3xl font-semibold">Questions &amp; Answers</h2>
                </div>

                <div className="mt-4 max-w-xl">
                    <p className="text-accent text-sm">
                        Get the essentials of feedback management—and see how Feedgot helps you ship better products.
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
                                        <AccordionTrigger className="group cursor-pointer text-left text-md sm:text-lg font-medium !no-underline hover:!no-underline justify-start [&>svg]:hidden">
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
        </Container>
    )
}