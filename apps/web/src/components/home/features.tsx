"use client";

import { Check, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { AccentBar } from "@featul/ui/components/cardElements";
import { Switch } from "@featul/ui/components/switch";
import {
  overlayChipInnerClass,
  overlayChipShellClass,
  overlayDialogClass,
  overlayInnerClass,
} from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { Container } from "../global/container";
import { NestedOverlayCard, VisualCardIconTile, VisualCardWell } from "./visual-well";

const requestTags = [
  { text: "import CSV", tone: "remove" },
  { text: "merge duplicate requests", tone: "add" },
  { text: "custom status", tone: "add" },
  { text: "dark mode", tone: "remove" },
  { text: "Slack alerts", tone: "add" },
  { text: "public roadmap", tone: "add" },
] as const;

const captionClass = "flex flex-col px-4 py-3";

const viewport = { once: true, amount: 0.4 } as const;

const springPop = { type: "spring" as const, stiffness: 420, damping: 18 };
const springIn = { type: "spring" as const, stiffness: 280, damping: 24 };

export default function FeaturesSection() {
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = !!shouldReduceMotion;

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="my-16 sm:my-20">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="max-w-3xl text-left">
            <h2 className="font-heading text-foreground text-2xl font-semibold sm:text-3xl lg:text-3xl">
              Decide what feedback becomes product work.
            </h2>
            <div className="mt-3 flex items-start gap-2">
              <AccentBar width={8} />
              <p className="text-accent max-w-2xl text-sm leading-6 sm:text-base">
                Review customer ideas before they move forward, then let Featul
                surface the patterns worth acting on.
              </p>
            </div>
          </div>

          <div className="mt-8 grid items-stretch gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-2">
            <CaughtUpCard reduceMotion={reduceMotion} />
            <InsightsCard reduceMotion={reduceMotion} />
          </div>
        </div>
      </section>
    </Container>
  );
}

function CaughtUpCard({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <article className={cn(overlayDialogClass, "group flex h-full flex-col")}>
      <div className={cn(overlayInnerClass, "mb-2 flex flex-1 flex-col p-0")}>
        <VisualCardWell color="blue" step="01" label="Review before it ships">
          <VisualCardIconTile className="relative">
            {!reduceMotion ? (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute rounded-full border-2 border-emerald-400/70"
                initial={{ opacity: 0.85, scale: 0.7 }}
                whileInView={{ opacity: 0, scale: 1.8 }}
                viewport={viewport}
                transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
                style={{ inset: 10 }}
              />
            ) : null}
            <motion.span
              className="relative flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
              initial={reduceMotion ? false : { scale: 0.55, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={viewport}
              transition={springPop}
            >
              <Check className="size-4" strokeWidth={2.4} />
            </motion.span>
          </VisualCardIconTile>
        </VisualCardWell>
      </div>

      <div className={cn(overlayInnerClass, captionClass)}>
        <h3 className="text-foreground text-left text-base font-medium">
          You control what gets prioritized.
        </h3>
        <p className="text-accent mt-1 text-left text-sm leading-6">
          Customers can submit, vote, and explain what matters. Nothing
          changes on your roadmap until you review it.
        </p>
      </div>
    </article>
  );
}

function InsightsCard({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <article className={cn(overlayDialogClass, "flex h-full flex-col")}>
      <div className={cn(overlayInnerClass, "mb-2 flex flex-1 flex-col p-0")}>
        <VisualCardWell color="orange" step="02" label="Surface what matters">
          <motion.div
            className="w-full"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={springIn}
          >
            <NestedOverlayCard className="w-full">
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

            <div className="h-px w-full bg-border" />

            <div className="px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-medium">
                    Feature requests
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <motion.span
                      className="inline-flex"
                      initial={reduceMotion ? false : { rotate: -20, scale: 0.6, opacity: 0 }}
                      whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
                      viewport={viewport}
                      transition={{ ...springPop, delay: 0.22 }}
                    >
                      <Sparkles className="size-3.5 text-blue-600" />
                    </motion.span>
                    <span className="text-accent">Featul</span>
                    <span className="font-medium text-emerald-600">+24</span>
                    <span className="font-medium text-red-600">-8</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={overlayChipShellClass}>
                    <span
                      className={cn(
                        overlayChipInnerClass,
                        "h-5 min-h-5 px-1.5 text-[11px] font-medium text-blue-700",
                      )}
                    >
                      Pending
                    </span>
                  </span>
                  <p className="text-accent text-[11px]">needs review</p>
                </div>
              </div>

              <p className="text-foreground mt-3 text-sm leading-6">
                Customers keep asking for{" "}
                {requestTags.map((tag, index) => (
                  <motion.span
                    key={tag.text}
                    className={
                      tag.tone === "add"
                        ? "mx-0.5 inline rounded-sm bg-emerald-100 px-1 text-emerald-800"
                        : "mx-0.5 inline rounded-sm bg-red-100 px-1 text-red-700 line-through decoration-red-600"
                    }
                    initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.94 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={viewport}
                    transition={{ ...springIn, delay: 0.18 + index * 0.05 }}
                  >
                    {tag.text}
                  </motion.span>
                ))}{" "}
                so the most requested work rises to the top.
              </p>
            </div>
            </NestedOverlayCard>
          </motion.div>
        </VisualCardWell>
      </div>

      <div className={cn(overlayInnerClass, captionClass)}>
        <h3 className="text-foreground text-left text-base font-medium">
          Let Featul surface what matters.
        </h3>
        <p className="text-accent mt-1 text-left text-sm leading-6">
          Automatically group similar feedback, spot patterns, and keep
          your team focused on the requests with real momentum.
        </p>
      </div>
    </article>
  );
}
