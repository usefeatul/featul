"use client";

import { useId, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DitherGradient } from "@featul/ui/components/gradient";
import { modalCardInnerClass, modalCardShellClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
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
            className={cn(modalCardShellClass, "pointer-events-none absolute inset-x-0 bottom-0")}
            style={{ top: index * 6, marginInline: (layers - index) * 6, opacity: 0.45 + index * 0.2 }}
          />
        ))}
        {/* Settings-card frame: counter and close in the shell header, copy on the inner surface. */}
        <article aria-labelledby={titleId} className={cn(modalCardShellClass, "relative flex flex-col")}>
          <div className="flex h-7 items-center justify-between pr-0.5 pl-2">
            <span className="text-[10px] tabular-nums text-muted-foreground" aria-live="polite" aria-atomic="true">
              {total - cards.length + 1} of {total}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={dismiss}
              aria-label={`Hide ${card.title} card for three days`}
              title="Hide for three days"
              className="-mr-1 flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground dark:hover:bg-foreground/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
          <div className={cn(modalCardInnerClass, "relative isolate p-3")}>
            {/* Pattern sits in the top-left corner and fades out toward the copy. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10"
              style={{ maskImage: "radial-gradient(ellipse 85% 75% at top left, black 10%, rgba(0,0,0,0.4) 45%, transparent 80%)" }}
            >
              <DitherGradient key={card.id} to="primary" direction="down" cell={3} opacity={0.45} />
            </div>
            <motion.div
              key={card.id}
              className="relative"
              initial={reduceMotion ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              <p id={titleId} className="text-xs font-medium text-foreground">{card.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{card.description}</p>
              <div className="mt-1">{card.action}</div>
            </motion.div>
          </div>
        </article>
      </div>
    </section>
  );
}
