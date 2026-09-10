"use client";

import { useState, type ReactNode } from "react";
import { Heart } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { DitherGradient } from "@/components/dither-kit/gradient";
import type { Rgb } from "@/components/dither-kit/palette";
import { MarketingContainer, marketingRailClass } from "@/components/layout/container";
import { Button } from "@featul/ui/components/button";
import { LockIcon } from "@featul/ui/icons/lock";
import { MergeIcon } from "@featul/ui/icons/merge";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

/** Very light mix of CSS `--primary` toward white. */
const PRIMARY_DOTS: Rgb = [232, 247, 255];

const viewport = { once: true, amount: 0.4 } as const;
const springIn = { type: "spring" as const, stiffness: 280, damping: 24 };
const mockCardClass = "overflow-hidden rounded-lg bg-card ring-1 ring-border";

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
          <div className="flex flex-1 flex-col px-4 pb-4 pt-11 sm:px-5">
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

function HeartVote({
  voted,
  count,
  label,
  onToggle,
}: {
  voted: boolean;
  count: number;
  label: string;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      variant="nav"
      size="xs"
      aria-pressed={voted}
      aria-label={label}
      onClick={onToggle}
      className={cn("gap-1 tabular-nums", voted && "text-red-500")}
    >
      <Heart
        className="size-3.5"
        fill={voted ? "currentColor" : "none"}
        strokeWidth={2}
      />
      {count}
    </Button>
  );
}

function ReviewMock({ reduceMotion }: { reduceMotion: boolean }) {
  const [voted, setVoted] = useState(false);
  const [status, setStatus] = useState<"review" | "planned">("review");

  return (
    <motion.div
      className="flex h-full w-full flex-col"
      initial={false}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={viewport}
      transition={springIn}
    >
      <div className={mockCardClass}>
        <div className="px-3.5 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-foreground text-sm font-medium">CSV import</p>
              <p className="text-accent mt-0.5 text-xs">42 votes · waiting on you</p>
            </div>
            <HeartVote
              voted={voted}
              count={voted ? 43 : 42}
              label={voted ? "Remove vote from CSV import" : "Vote for CSV import"}
              onToggle={() => setVoted((value) => !value)}
            />
          </div>
          <div className="mt-3 flex gap-1.5">
            <Button
              type="button"
              variant={status === "planned" ? "default" : "nav"}
              size="xs"
              aria-pressed={status === "planned"}
              onClick={() => setStatus("planned")}
            >
              Planned
            </Button>
            <Button
              type="button"
              variant={status === "review" ? "default" : "nav"}
              size="xs"
              aria-pressed={status === "review"}
              onClick={() => setStatus("review")}
            >
              In review
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border px-3.5 py-3">
          <div className="min-w-0">
            <p className="text-foreground text-sm font-medium">SSO for the portal</p>
            <p className="text-accent mt-0.5 text-xs">Already on the roadmap</p>
          </div>
          <span className="text-accent shrink-0 text-[11px] font-medium">Planned</span>
        </div>
      </div>
      <p className="text-accent mt-auto pt-4 text-xs leading-5">
        {status === "planned"
          ? "CSV import is on the roadmap. Customers can follow it."
          : "Nothing moves to the roadmap until you review it."}
      </p>
    </motion.div>
  );
}

function MergeMock({ reduceMotion }: { reduceMotion: boolean }) {
  const [merged, setMerged] = useState(false);

  return (
    <motion.div
      className="flex h-full w-full flex-col"
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ ...springIn, delay: 0.06 }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-accent text-[11px] font-medium tracking-wide uppercase">
          {merged ? "One thread" : "3 similar posts"}
        </p>
        <Button
          type="button"
          variant="nav"
          size="xs"
          aria-pressed={merged}
          onClick={() => setMerged((value) => !value)}
        >
          <MergeIcon className="size-3" />
          {merged ? "Undo" : "Merge"}
        </Button>
      </div>

      <div className={cn("mt-3", mockCardClass)}>
        <div className="flex items-center justify-between gap-3 px-3.5 py-3">
          <div className="min-w-0">
            <p className="text-foreground text-sm font-medium">Dark mode</p>
            <p className="text-accent mt-0.5 text-xs">
              {merged ? "Votes and comments rolled up" : "18 votes"}
            </p>
          </div>
          <span className="text-foreground text-xs font-medium tabular-nums">
            {merged ? 36 : 18}
          </span>
        </div>

        <AnimatePresence initial={false}>
          {merged ? (
            <motion.div
              key="sources"
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border px-3.5 py-2">
                {duplicatePosts.slice(1).map((post) => (
                  <p
                    key={post.id}
                    className="text-accent flex items-center justify-between py-1 text-xs"
                  >
                    <span>Merged · {post.title}</span>
                    <span className="tabular-nums">{post.votes}</span>
                  </p>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dupes"
              initial={false}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            >
              {duplicatePosts.slice(1).map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between gap-3 border-t border-border px-3.5 py-3"
                >
                  <p className="text-foreground text-sm font-medium">{post.title}</p>
                  <span className="text-accent text-xs tabular-nums">{post.votes}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-accent mt-auto pt-4 text-xs leading-5">
        {merged
          ? "18 + 11 + 7 now count as one request."
          : "Same idea, three posts. Keep the votes in one place."}
      </p>
    </motion.div>
  );
}

function InternalMock({ reduceMotion }: { reduceMotion: boolean }) {
  const [internal, setInternal] = useState(true);

  return (
    <motion.div
      className="flex h-full w-full flex-col"
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ ...springIn, delay: 0.1 }}
    >
      <div className={cn("flex flex-1 flex-col", mockCardClass)}>
        <div className="flex flex-1 flex-col gap-3 px-3.5 py-3">
          <div className="flex gap-2.5">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-foreground">
              C
            </span>
            <div className="min-w-0">
              <p className="text-accent text-[11px] font-medium">Customer</p>
              <p className="text-foreground mt-0.5 text-sm leading-5">
                Can we get CSV import?
              </p>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {internal ? (
              <motion.div
                key="note"
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                className="flex gap-2.5"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-medium text-primary">
                  M
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                    <span className="text-foreground">Maya</span>
                    <span className="rounded bg-primary/10 px-1 py-px text-primary">
                      Internal
                    </span>
                  </p>
                  <p className="text-foreground mt-0.5 text-sm leading-5">
                    <span className="font-medium text-primary">@alex</span> Should
                    this wait for Q3?
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="hidden"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-accent pl-8 text-xs leading-5"
              >
                Internal notes are hidden on the public board.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-border px-3.5 py-2.5">
          <Button
            type="button"
            variant={internal ? "default" : "nav"}
            size="icon-sm"
            aria-pressed={internal}
            aria-label={
              internal
                ? "Internal note on. Click to hide from this preview."
                : "Show the internal note"
            }
            onClick={() => setInternal((value) => !value)}
          >
            <LockIcon width={12} height={12} />
          </Button>
          <p className="text-accent min-w-0 flex-1 truncate text-xs">
            {internal ? "Internal note to @alex" : "Write a public reply"}
          </p>
          <Button type="button" variant="nav" size="xs" tabIndex={-1}>
            Post
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
