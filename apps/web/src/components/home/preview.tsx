"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { CommentsIcon } from "@/components/global/icons";
import { cn } from "@featul/ui/lib/utils";

/** Decorative app previews: reveal once in view, with no motion for reduced-motion preferences. */
export function Preview({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      data-preview
      className={cn(
        "w-full min-w-0 rounded-xl border border-border bg-card text-foreground shadow-[0_4px_16px_-6px_rgba(0,0,0,0.16)]",
        className,
      )}
      initial={reduceMotion ? "visible" : "hidden"}
      animate={reduceMotion ? "visible" : undefined}
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: reduceMotion ? 0 : 0.45,
            ease: "easeOut",
            staggerChildren: reduceMotion ? 0 : 0.14,
            delayChildren: reduceMotion ? 0 : 0.16,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function PreviewStep({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: reduceMotion ? 0 : 0.35, ease: "easeOut" },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function Engagement({
  votes,
  comments,
}: {
  votes: number;
  comments?: number;
}) {
  return (
    <span className="inline-flex shrink-0 items-center gap-3 text-[11px] tabular-nums text-accent">
      <span className="inline-flex items-center gap-1">
        <Heart className="size-3.5" />
        {votes}
      </span>
      {comments !== undefined && (
        <span className="inline-flex items-center gap-1">
          <CommentsIcon className="size-3.5" />
          {comments}
        </span>
      )}
    </span>
  );
}
