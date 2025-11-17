"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@feedgot/ui/components/accordion";
import { Container } from "@/components/global/container";
import type { Alternative } from "@/config/alternatives";
import { getAlternativeFaq } from "@/data/alt-faqs";
import { ChevronDownIcon } from "lucide-react";

export default function AlternativeFAQs({ alt }: { alt: Alternative }) {
  const { description, items } = getAlternativeFaq(alt.slug);
  const limitedItems = items.slice(0, 6);

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
      <section className="py-16 md:py-24">
        <div className="max-w-5xl px-0 sm:px-6">
          <div className="max-w-xl text-left">
            <h2 className="text-balance text-2xl font-semibold">
              Questions about {alt.name} vs Feedgot
            </h2>
          </div>

          <div className="mt-4 max-w-xl">
            <p className="text-accent text-[14px]">{description}</p>
            <Accordion type="single" collapsible className="w-full">
              {limitedItems.map((item) => (
                <div className="group" key={item.id}>
                  <AccordionItem
                    value={item.id}
                    className="border-none px-0 py-3"
                  >
                    <AccordionTrigger className="group cursor-pointer text-left text-sm  font-medium !no-underline hover:!no-underline justify-start [&>svg]:hidden">
                      <span className="inline-flex items-center gap-2">
                        <ChevronDownIcon className="size-4 text-primary transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        <span>{item.question}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-6">
                      <p className="text-left text-accent text-md leading-relaxed">
                        {item.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </div>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </Container>
  );
}
