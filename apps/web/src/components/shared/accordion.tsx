"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@featul/ui/components/accordion";
import { ChevronDownIcon } from "lucide-react";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
  title: string;
  description?: string;
  limit?: number;
};

export function FaqAccordion({
  items,
  title,
  description,
  limit,
}: FaqAccordionProps) {
  const visibleItems = limit ? items.slice(0, limit) : items;

  return (
    <>
      <div className="text-left">
        <h2 className="font-heading text-balance text-3xl font-semibold">
          {title}
        </h2>
      </div>

      <div className="mt-4">
        {description && (
          <p className="max-w-2xl text-accent text-md">{description}</p>
        )}
        <Accordion type="single" collapsible className="w-full">
          {visibleItems.map((item) => (
            <div className="group" key={item.id}>
              <AccordionItem
                value={item.id}
                className="border-none px-0 py-3"
              >
                <AccordionTrigger className="font-heading group cursor-pointer text-left text-md font-medium !no-underline hover:!no-underline justify-start [&>svg]:hidden">
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
    </>
  );
}
