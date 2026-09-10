"use client";

import { useState, type ReactNode } from "react";
import { Check, ChevronUp, Lock, Unlock } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { DitherGradient } from "@/components/dither-kit/gradient";
import type { Rgb } from "@/components/dither-kit/palette";
import { MarketingContainer, marketingRailClass } from "@/components/layout/container";
import { CommentsIcon } from "@featul/ui/icons/comments";
import { MergeIcon } from "@featul/ui/icons/merge";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

/** Very light mix of CSS `--primary` toward white. */
const PRIMARY_DOTS: Rgb = [232, 247, 255];

const viewport = { once: true, amount: 0.4 } as const;
const springIn = { type: "spring" as const, stiffness: 280, damping: 24 };

const duplicatePosts = [
  { id: "dark", title: "Dark mode", votes: 18 },
  { id: "night", title: "Night theme", votes: 11 },
  { id: "oled", title: "OLED", votes: 7 },
] as const;

export default function FeaturesSection() {
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = !!shouldReduceMotion;

  return (
    <section
      className="relative overflow-hidden bg-background py-16 sm:py-20 md:py-24"
      data-component="Features"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] sm:h-[36%]"
      >
        <DitherGradient
          from={PRIMARY_DOTS}
          to="transparent"
          direction="up"
          cell={5}
          bloom="off"
          sparse
          maxDensity={0.42}
          opacity={1}
          className="[mask-image:linear-gradient(to_top,black_0%,black_45%,transparent_100%)]"
        />
      </div>
      <MarketingContainer className="relative z-10">
        <div className={marketingRailClass}>
          <div className="max-w-3xl text-left">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-[1.1] lg:text-5xl">
              Decide what feedback becomes
              <span className="mt-1 block text-primary">product work.</span>
            </h2>
            <p className="text-accent mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
              Review customer ideas before they move forward, merge repeats, and
              keep the team conversation off the public board.
            </p>
          </div>

          <div className="mt-10 grid items-stretch gap-8 sm:mt-12 sm:gap-10 lg:grid-cols-3">
            <FeatureCard
              step="01"
              title="You control what gets prioritized."
              body="Customers can submit, vote, and explain what matters. Nothing changes on your roadmap until you review it."
            >
              <ReviewMock reduceMotion={reduceMotion} />
            </FeatureCard>

            <FeatureCard
              step="02"
              title="Keep one thread per idea."
              body="When people ask for the same thing in different words, merge the posts so votes and comments live in one place."
            >
              <MergeMock reduceMotion={reduceMotion} />
            </FeatureCard>

            <FeatureCard
              step="03"
              title="Keep the team thread private."
              body="Leave internal comments and mention teammates without showing that discussion on the public board."
            >
              <InternalMock reduceMotion={reduceMotion} />
            </FeatureCard>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}

function FeatureCard({
  step,
  title,
  body,
  children,
}: {
  step: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <article className="flex h-full flex-col">
      <div className={cn(overlayDialogClass, "flex flex-1 flex-col")}>
        <div
          className={cn(
            overlayInnerClass,
            "relative mb-0 flex min-h-[240px] flex-1 flex-col bg-background p-0 sm:min-h-[300px]",
          )}
        >
          <span className="absolute right-4 top-4 z-10 text-xs font-medium tabular-nums text-accent">
            {step}
          </span>
          <div className="flex flex-1 items-center justify-center px-4 pb-6 pt-10 sm:px-6 sm:pb-8">
            {children}
          </div>
        </div>
      </div>
      <h3 className="text-foreground mt-5 text-left text-lg font-semibold tracking-tight sm:text-xl">
        {title}
      </h3>
      <p className="text-accent mt-2 text-left text-sm leading-6 sm:text-base">
        {body}
      </p>
    </article>
  );
}

function ReviewMock({ reduceMotion }: { reduceMotion: boolean }) {
  const [voted, setVoted] = useState(false);
  const [approved, setApproved] = useState(false);
  const votes = voted ? 43 : 42;

  return (
    <motion.div
      className="w-full"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={springIn}
    >
      <div className="flex gap-3 rounded-2xl bg-muted/50 p-3 ring-1 ring-foreground/5">
        <button
          type="button"
          aria-pressed={voted}
          aria-label={voted ? "Remove vote from CSV import" : "Vote for CSV import"}
          onClick={() => setVoted((value) => !value)}
          className={cn(
            "flex w-12 shrink-0 flex-col items-center justify-center rounded-xl py-2 text-sm font-semibold tabular-nums transition-colors",
            voted
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground ring-1 ring-border hover:ring-primary/40",
          )}
        >
          <ChevronUp className="size-4" strokeWidth={2.4} />
          {votes}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-foreground text-sm font-medium">CSV import</p>
              <p className="text-accent mt-0.5 text-xs">waiting on you</p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                approved
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-sky-100 text-sky-800",
              )}
            >
              {approved ? "Approved" : "Pending"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setApproved((value) => !value)}
            className={cn(
              "mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors",
              approved
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-foreground text-background hover:bg-foreground/90",
            )}
          >
            {approved ? <Check className="size-3.5" strokeWidth={2.6} /> : null}
            {approved ? "Approved" : "Approve to roadmap"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function MergeMock({ reduceMotion }: { reduceMotion: boolean }) {
  const [merged, setMerged] = useState(false);

  return (
    <motion.div
      className="w-full"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ ...springIn, delay: 0.06 }}
    >
      <div className="relative h-[8.75rem]">
        {duplicatePosts.map((post, index) => {
          const visible = merged ? index === 0 : true;
          return (
            <motion.div
              key={post.id}
              className="absolute inset-x-0 rounded-xl bg-background px-3 py-2.5 shadow-sm ring-1 ring-border"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      top: merged ? 0 : index * 30,
                      opacity: visible ? 1 : 0,
                      scale: merged && index !== 0 ? 0.94 : 1,
                    }
              }
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              style={{
                top: reduceMotion ? (merged ? 0 : index * 30) : index * 30,
                opacity: reduceMotion && !visible ? 0 : undefined,
                zIndex: duplicatePosts.length - index,
                pointerEvents: visible ? "auto" : "none",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-medium">
                    {merged ? "Dark mode" : post.title}
                  </p>
                  <p className="text-accent mt-0.5 text-xs">
                    {merged ? "Night theme, OLED rolled in" : `${post.votes} votes`}
                  </p>
                </div>
                <span className="text-foreground shrink-0 text-xs font-semibold tabular-nums">
                  {merged ? 36 : post.votes}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
      <button
        type="button"
        aria-pressed={merged}
        onClick={() => setMerged((value) => !value)}
        className={cn(
          "mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-colors",
          merged
            ? "bg-violet-100 text-violet-800 hover:bg-violet-200"
            : "bg-foreground text-background hover:bg-foreground/90",
        )}
      >
        <MergeIcon className="size-3.5" />
        {merged ? "Merged · click to undo" : "Merge duplicates"}
      </button>
    </motion.div>
  );
}

function InternalMock({ reduceMotion }: { reduceMotion: boolean }) {
  const [internal, setInternal] = useState(true);

  return (
    <motion.div
      className="w-full"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ ...springIn, delay: 0.1 }}
    >
      <div className="flex flex-col gap-2.5">
        <div className="max-w-[95%] rounded-2xl rounded-tl-md bg-muted/70 px-3 py-2">
          <p className="text-accent text-[11px] font-medium">Customer</p>
          <p className="text-foreground mt-0.5 text-sm">Can we get CSV import?</p>
        </div>
        <AnimatePresence initial={false}>
          {internal ? (
            <motion.div
              key="internal"
              initial={reduceMotion ? false : { opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
              className="overflow-hidden"
            >
              <div className="max-w-[95%] rounded-2xl rounded-tl-md bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200/80">
                <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-800">
                  <CommentsIcon className="size-3" />
                  Maya · Internal
                </p>
                <p className="text-foreground mt-0.5 text-sm">
                  Should this wait for Q3?
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <button
        type="button"
        aria-pressed={internal}
        onClick={() => setInternal((value) => !value)}
        className={cn(
          "mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-colors",
          internal
            ? "bg-emerald-700 text-white hover:bg-emerald-800"
            : "bg-foreground text-background hover:bg-foreground/90",
        )}
      >
        {internal ? (
          <Lock className="size-3.5" strokeWidth={2.2} />
        ) : (
          <Unlock className="size-3.5" strokeWidth={2.2} />
        )}
        {internal ? "Workspace only" : "Show internal note"}
      </button>
    </motion.div>
  );
}
