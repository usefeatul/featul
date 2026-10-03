"use client";

import {
  MarketingContainer,
  marketingRailClass,
} from "@/components/layout/container";
import type { ReactNode } from "react";
import {
  CheckIcon,
  SparklesIcon,
  CommentsIcon,
  MergeIcon,
} from "@/components/global/icons";
import { motion, useReducedMotion } from "framer-motion";

import { Switch } from "@featul/ui/components/switch";
import {
  overlayChipInnerClass,
  overlayChipShellClass,
} from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { BentoCard as FeatureCard } from "./bento";
import { PortalPreview, WidgetPreview } from "./previews";

const rowClass = "flex items-center gap-3 px-5 py-4 sm:px-6";
const viewport = { once: true, amount: 0.4 } as const;
const springPop = { type: "spring" as const, stiffness: 420, damping: 18 };
const springIn = { type: "spring" as const, stiffness: 280, damping: 24 };

export default function FeaturesSection() {
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = !!shouldReduceMotion;

  return (
    <MarketingContainer>
      <section className="my-16 sm:my-20" data-component="Features">
        <div className={marketingRailClass}>
          <div className="max-w-2xl">
            <div>
              <h2 className="font-heading text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Everything you need for
                <span className="block text-accent">
                  a closer conversation.
                </span>
              </h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-accent sm:text-base">
              Collect ideas where customers are, find what matters, and give
              your team a clear next step. All in one workspace.
            </p>
          </div>

          <div className="mt-9 grid items-stretch gap-3 rounded-2xl border border-border/70 bg-muted/35 p-2 shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:mt-12 sm:p-3 md:grid-cols-2">
            <FeatureCard
              tone="blue"
              title="A feedback space that feels like you."
              body="Give ideas, votes, and updates a home on your own domain or Featul address. No code needed—just share the link."
              href="/docs/getting-started"
            >
              <PortalPreview className="h-full w-full rounded-none bg-transparent" />
            </FeatureCard>
            <FeatureCard
              tone="violet"
              title="Catch ideas right inside your app."
              body="Add the widget with a small snippet. Customers can share feedback and follow updates without leaving your product."
              href="/docs/getting-started/widget"
            >
              <WidgetPreview className="h-full w-full rounded-none bg-transparent" />
            </FeatureCard>
            <FeatureCard
              tone="peach"
              title="You control what gets prioritized."
              body="Customers can submit, vote, and explain what matters. Nothing changes on your roadmap until you review it."
            >
              <MockPanel reduceMotion={reduceMotion}>
                <div className={rowClass}>
                  <MockIcon
                    reduceMotion={reduceMotion}
                    className="rounded-full bg-foreground/5"
                  >
                    <CheckIcon className="size-4" />
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
              tone="mint"
              title="Let Featul surface what matters."
              body="Automatically group similar feedback, spot patterns, and keep your team focused on the requests with real momentum."
            >
              <MockPanel reduceMotion={reduceMotion} delay={0.06}>
                <div className="flex items-start justify-between gap-3 px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <p className="text-foreground text-sm font-medium">
                      Feature requests
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                      <SparklesIcon className="size-3.5" />
                      <span className="text-accent">Featul</span>
                      <span className="font-medium text-emerald-600">+24</span>
                      <span className="font-medium text-red-600">-8</span>
                    </div>
                  </div>
                  <StatusChip tone="info">3 themes</StatusChip>
                </div>
                <div className="h-px w-full bg-border" />
                <div className="px-5 py-4 sm:px-6">
                  <p className="text-foreground text-sm leading-6">
                    Customers keep asking for{" "}
                    <span className="mx-0.5 inline rounded-sm bg-emerald-100 px-1 text-emerald-800">
                      merge duplicates
                    </span>
                    <span className="mx-0.5 inline rounded-sm bg-emerald-100 px-1 text-emerald-800">
                      custom status
                    </span>
                    <span className="mx-0.5 inline rounded-sm bg-red-100 px-1 text-red-700 line-through decoration-red-600">
                      dark mode
                    </span>{" "}
                    so the most requested work rises to the top.
                  </p>
                </div>
              </MockPanel>
            </FeatureCard>

            <FeatureCard
              tone="rose"
              title="Keep one thread per idea."
              body="When people ask for the same thing in different words, merge the posts so votes and comments live in one place."
            >
              <MockPanel reduceMotion={reduceMotion} delay={0.08}>
                <div className={rowClass}>
                  <MockIcon
                    reduceMotion={reduceMotion}
                    className="rounded-md bg-foreground/5 ring-1 ring-foreground/10"
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
              tone="teal"
              title="Keep the team thread private."
              body="Leave internal comments and mention teammates without showing that discussion on the public board."
            >
              <MockPanel reduceMotion={reduceMotion} delay={0.1}>
                <div className={rowClass}>
                  <MockIcon
                    reduceMotion={reduceMotion}
                    className="rounded-md bg-foreground/5 ring-1 ring-foreground/10"
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
      </section>
    </MarketingContainer>
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
      <div className="w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        {children}
      </div>
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
