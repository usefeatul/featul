"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@featul/ui/components/accordion";
import { ChevronDownIcon } from "lucide-react";
import {
  OverlayCard,
  OverlayCardPanel,
} from "@/components/shared/overlay-card";

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
        <Accordion type="single" collapsible className="mt-6 w-full space-y-3">
          {visibleItems.map((item) => (
            <OverlayCard key={item.id}>
              <OverlayCardPanel className="px-4 py-1">
                <AccordionItem
                  value={item.id}
                  className="border-none px-0"
                >
                  <AccordionTrigger className="font-heading group cursor-pointer justify-start py-3 text-left text-md font-medium !no-underline hover:!no-underline [&>svg]:hidden">
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
              </OverlayCardPanel>
            </OverlayCard>
          ))}
        </Accordion>
      </div>
    </>
  );
}
