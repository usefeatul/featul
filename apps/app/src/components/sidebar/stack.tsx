"use client";

import { useId, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "@/components/global/icons";

export type StackCard = {
  id: string;
  title: string;
  description: string;
  action: ReactNode;
  dismiss: () => void;
};

export default function Stack({ cards, total }: { cards: StackCard[]; total: number }) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const card = cards[0];
  if (!card) return null;
  const layers = Math.min(cards.length - 1, 2);

  const dismiss = () => {
    // Keep keyboard focus on the next card, or return it to navigation when the stack is empty.
    if (cards.length === 1 && document.activeElement === closeRef.current) {
      closeRef.current?.closest("nav")?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
    }
    card.dismiss();
  };

  return (
    <section aria-label="Workspace tips" className="shrink-0 px-3 pt-3">
      <div className="relative" style={{ paddingTop: layers * 6 }}>
        {Array.from({ length: layers }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 rounded-lg border border-border/60 bg-muted"
            style={{ top: index * 6, marginInline: (layers - index) * 6, opacity: 0.45 + index * 0.2 }}
          />
        ))}
        <article aria-labelledby={titleId} className="relative rounded-lg border border-border/70 bg-sidebar p-3 shadow-sm">
          <div className="mb-2 flex h-6 items-center justify-between">
            <span className="text-[10px] tabular-nums text-muted-foreground" aria-live="polite" aria-atomic="true">
              {total - cards.length + 1} of {total}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={dismiss}
              aria-label={`Hide ${card.title} card for three days`}
              title="Hide for three days"
              className="-mr-1 flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
          <motion.div
            key={card.id}
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <p id={titleId} className="text-xs font-medium text-foreground">{card.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{card.description}</p>
            <div className="mt-1">{card.action}</div>
          </motion.div>
        </article>
      </div>
    </section>
  );
}
