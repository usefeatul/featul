"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GoogleIcon } from "@featul/ui/icons/google";
import { StarIcon } from "@featul/ui/icons/star";

const REVIEWS = [
  "Featul is the kind of product I'm happy to open every day.",
  "Votes, roadmap, and changelog finally live in one workspace.",
  "We were collecting feedback the same afternoon we signed up.",
  "Workspace pricing instead of a seat tax. Easy yes from the team.",
  "EU hosted, MIT licensed, and the public board looks like us.",
] as const;

const INTERVAL_MS = 5000;

const fade = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1] as const,
};

function ReviewCopy({ quote }: { quote: string }) {
  return (
    <span className="flex flex-wrap items-center justify-start gap-x-3 gap-y-1.5">
      <span className="inline-flex items-center gap-2" aria-hidden>
        <span className="text-xs font-light">on</span>
        <GoogleIcon className="size-3.5" />
      </span>
      <span className="text-neutral-400" aria-hidden>
        —
      </span>
      <span className="text-sm font-light italic leading-snug">
        &ldquo;{quote}&rdquo;
      </span>
    </span>
  );
}

export function HeroReviews() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduceMotion || paused) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % REVIEWS.length);
    }, INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [paused, reduceMotion]);

  const quote = REVIEWS[index] ?? REVIEWS[0];

  return (
    <div
      className="mt-8 flex items-center justify-start gap-2 sm:mt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="inline-flex shrink-0 items-center gap-px text-neutral-500" aria-hidden>
        {Array.from({ length: 5 }, (_, star) => (
          <StarIcon
            key={star}
            width={12}
            height={12}
            className="size-3 fill-current"
          />
        ))}
      </span>
      <div
        className="relative grid min-w-0 max-w-3xl text-neutral-500"
        aria-live="polite"
        aria-atomic="true"
      >
        {REVIEWS.map((review) => (
          <span
            key={review}
            aria-hidden
            className="invisible col-start-1 row-start-1"
          >
            <ReviewCopy quote={review} />
          </span>
        ))}
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={quote}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={fade}
            className="col-start-1 row-start-1 m-0"
          >
            <span className="sr-only">Google review: </span>
            <ReviewCopy quote={quote} />
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
