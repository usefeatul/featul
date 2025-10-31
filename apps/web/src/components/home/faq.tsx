'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@feedgot/ui/components/accordion'
import { Container } from '../container'
import { ChevronDownIcon } from 'lucide-react'

export default function FAQsFour() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'How long does shipping take?',
            answer: 'Standard shipping takes 3-5 business days, depending on your location. Express shipping options are available at checkout for 1-2 business day delivery.',
        },
        {
            id: 'item-2',
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay. For enterprise customers, we also offer invoicing options.',
        },
        {
            id: 'item-3',
            question: 'Can I change or cancel my order?',
            answer: 'You can modify or cancel your order within 1 hour of placing it. After this window, please contact our customer support team who will assist you with any changes.',
        },
        {
            id: 'item-4',
            question: 'Do you ship internationally?',
            answer: "Yes, we ship to over 50 countries worldwide. International shipping typically takes 7-14 business days. Additional customs fees may apply depending on your country's import regulations.",
        },
        {
            id: 'item-5',
            question: 'What is your return policy?',
            answer: 'We offer a 30-day return policy for most items. Products must be in original condition with tags attached. Some specialty items may have different return terms, which will be noted on the product page.',
        },
    ]

    return (
        <Container  maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
            <section className="py-16 md:py-24">
                <div className="max-w-5xl px-0 sm:px-6">
                    <div className="max-w-xl text-left">
                        <h2 className="text-balance text-3xl font-semibold">Questions &amp; Answers</h2>
                    </div>

                    <div className="mt-12 max-w-xl">
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full divide-y">
                            {faqItems.map((item) => (
                                <div
                                    className="group"
                                    key={item.id}>
                                    <AccordionItem
                                        value={item.id}
                                        className="border-none px-0 py-3">
                                        <AccordionTrigger className="group cursor-pointer text-left text-base font-medium !no-underline hover:!no-underline justify-start [&>svg]:hidden">
                                            <span className="inline-flex items-center gap-2">
                                                <ChevronDownIcon className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                                <span>{item.question}</span>
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <p className="text-left text-zinc-500 text-base">{item.answer}</p>
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