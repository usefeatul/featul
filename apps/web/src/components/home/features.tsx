"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { DitherGradient } from "@/components/dither-kit/gradient";
import type { Rgb } from "@/components/dither-kit/palette";
import { MarketingContainer, marketingRailClass } from "@/components/layout/container";
import { Switch } from "@featul/ui/components/switch";
import { CommentsIcon } from "@featul/ui/icons/comments";
import { MergeIcon } from "@featul/ui/icons/merge";
import {
  overlayChipInnerClass,
  overlayChipShellClass,
  overlayDialogClass,
  overlayInnerClass,
} from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { NestedOverlayCard, VisualCardWell } from "./visual-well";

/** Very light mix of CSS `--primary` toward white. */
const PRIMARY_DOTS: Rgb = [232, 247, 255];

const rowClass = "flex items-center gap-3 px-5 py-4 sm:px-6";
const viewport = { once: true, amount: 0.4 } as const;
const springPop = { type: "spring" as const, stiffness: 420, damping: 18 };
const springIn = { type: "spring" as const, stiffness: 280, damping: 24 };

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
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[22%]"
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
          className="[mask-image:linear-gradient(to_top,black_8%,black_52%,transparent_100%)]"
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
              color="blue"
              step="01"
              title="You control what gets prioritized."
              body="Customers can submit, vote, and explain what matters. Nothing changes on your roadmap until you review it."
            >
              <MockPanel reduceMotion={reduceMotion}>
                <div className={rowClass}>
                  <MockIcon
                    reduceMotion={reduceMotion}
                    className="rounded-full bg-emerald-50 text-emerald-600"
                  >
                    <Check className="size-4" strokeWidth={2.4} />
                  </MockIcon>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-medium">
                      CSV import
                    </p>
                    <p className="text-accent mt-0.5 text-xs">
                      42 votes, waiting on you
                    </p>
                  </div>
                  <StatusChip tone="info">Pending</StatusChip>
                </div>
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <p className="text-foreground text-sm font-medium">
                      Require review before roadmap changes
                    </p>
                    <p className="text-accent mt-0.5 text-xs leading-5">
                      Approve suggested updates first.
                    </p>
                  </div>
                  <motion.span
                    className="pointer-events-none shrink-0"
                    aria-hidden
                    initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={viewport}
                    transition={{ ...springPop, delay: 0.16 }}
                  >
                    <Switch checked onCheckedChange={() => {}} tabIndex={-1} />
                  </motion.span>
                </div>
              </MockPanel>
            </FeatureCard>

            <FeatureCard
              color="purple"
              step="02"
              title="Keep one thread per idea."
              body="When people ask for the same thing in different words, merge the posts so votes and comments live in one place."
            >
              <MockPanel reduceMotion={reduceMotion} delay={0.08}>
                <div className={rowClass}>
                  <MockIcon
                    reduceMotion={reduceMotion}
                    className="rounded-md bg-foreground/5 text-violet-500 ring-1 ring-foreground/10"
                  >
                    <MergeIcon className="size-4" />
                  </MockIcon>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-medium">
                      Dark mode
                    </p>
                    <p className="text-accent mt-0.5 text-xs">
                      Also Night theme, OLED
                    </p>
                  </div>
                  <StatusChip tone="now">Merged</StatusChip>
                </div>
                <div className="h-px w-full bg-border" />
                <div className={rowClass}>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-medium">
                      Votes and comments rolled up
                    </p>
                    <p className="text-accent mt-0.5 text-xs">
                      18 + 11 + 7 now count as one request
                    </p>
                  </div>
                  <StatusChip tone="success">36 votes</StatusChip>
                </div>
              </MockPanel>
            </FeatureCard>

            <FeatureCard
              color="green"
              step="03"
              title="Keep the team thread private."
              body="Leave internal comments and mention teammates without showing that discussion on the public board."
            >
              <MockPanel reduceMotion={reduceMotion} delay={0.1}>
                <div className={rowClass}>
                  <MockIcon
                    reduceMotion={reduceMotion}
                    className="rounded-md bg-foreground/5 text-emerald-500 ring-1 ring-foreground/10"
                  >
                    <CommentsIcon className="size-4" />
                  </MockIcon>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-medium">
                      @maya Should this wait for Q3?
                    </p>
                    <p className="text-accent mt-0.5 text-xs">
                      Visible to your workspace only
                    </p>
                  </div>
                  <StatusChip tone="success">Internal</StatusChip>
                </div>
                <div className="h-px w-full bg-border" />
                <div className="flex items-start justify-between gap-3 px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <p className="text-foreground text-sm font-medium">
                      Customers never see this
                    </p>
                    <p className="text-accent mt-1 text-xs leading-5">
                      Decide in private, then publish the outcome when you are
                      ready.
                    </p>
                  </div>
                </div>
              </MockPanel>
            </FeatureCard>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}

function FeatureCard({
  color,
  step,
  title,
  body,
  children,
}: {
  color: "blue" | "orange" | "purple" | "green";
  step: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <article className="flex h-full flex-col">
      <div className={cn(overlayDialogClass, "flex flex-1 flex-col")}>
        <div className={cn(overlayInnerClass, "mb-0 flex flex-1 flex-col p-0")}>
          <VisualCardWell color={color} step={step} stepAlign="end">
            {children}
          </VisualCardWell>
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

function MockPanel({
  children,
  delay = 0,
  reduceMotion,
}: {
  children: ReactNode;
  delay?: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      className="w-full"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ ...springIn, delay }}
    >
      <NestedOverlayCard className="w-full">{children}</NestedOverlayCard>
    </motion.div>
  );
}

function MockIcon({
  children,
  className,
  reduceMotion,
}: {
  children: ReactNode;
  className: string;
  reduceMotion: boolean;
}) {
  return (
    <motion.span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center",
        className,
      )}
      initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={viewport}
      transition={springPop}
    >
      {children}
    </motion.span>
  );
}

function StatusChip({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "success" | "info" | "now";
}) {
  return (
    <span className={overlayChipShellClass}>
      <span
        className={cn(
          overlayChipInnerClass,
          "h-5 min-h-5 px-1.5 text-[11px] font-medium",
          tone === "success"
            ? "text-emerald-700"
            : tone === "now"
              ? "text-violet-700"
              : "text-blue-700",
        )}
      >
        {children}
      </span>
    </span>
  );
}
