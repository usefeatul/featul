"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Check, Globe, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { AccentBar } from "@featul/ui/components/cardElements";
import {
  overlayChipInnerClass,
  overlayChipShellClass,
  overlayDialogClass,
  overlayInnerClass,
} from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { Container } from "../global/container";
import { VisualCardWell } from "./visual-well";

const rowClass = "flex items-center gap-3 px-5 py-4 sm:px-6";

const captionClass = "flex flex-col px-4 py-3";

const viewport = { once: true, amount: 0.4 } as const;

const springPop = { type: "spring" as const, stiffness: 420, damping: 18 };
const springIn = { type: "spring" as const, stiffness: 280, damping: 24 };

export default function Create() {
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = !!shouldReduceMotion;

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="my-10 sm:my-14" data-component="Create">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="max-w-3xl text-left">
            <h2 className="font-heading text-foreground text-2xl font-semibold sm:text-3xl lg:text-3xl">
              Up and running in 30 seconds
            </h2>
            <div className="mt-3 flex items-start gap-2">
              <AccentBar width={8} />
              <p className="text-accent max-w-2xl text-sm leading-6 sm:text-base">
                Create a workspace, invite your team, and share a branded
                feedback board without adding setup work to your roadmap.
              </p>
            </div>
          </div>

          <div className="mt-8 grid items-stretch gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-2">
            <Link
              href="/docs/getting-started/index"
              className="block h-full min-w-0"
              aria-label="Learn more about creating your workspace"
            >
              <article className={cn(overlayDialogClass, "flex h-full flex-col")}>
                <div className={cn(overlayInnerClass, "mb-2 flex flex-1 flex-col p-0")}>
                  <VisualCardWell color="blue" step="01" label="Create your workspace">
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
                            Workspace ready
                          </p>
                          <p className="text-accent mt-0.5 text-xs">
                            Boards and roles included
                          </p>
                        </div>
                        <StatusChip tone="success">Ready</StatusChip>
                      </div>
                      <div className="h-px w-full bg-border" />
                      <div className={rowClass}>
                        <MockIcon
                          reduceMotion={reduceMotion}
                          delay={0.1}
                          className="rounded-md bg-foreground/5 text-blue-500 ring-1 ring-foreground/10"
                        >
                          <Users className="size-4" />
                        </MockIcon>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground text-sm font-medium">
                            Invite your team
                          </p>
                          <p className="text-accent mt-0.5 text-xs">
                            Owners, admins, and members
                          </p>
                        </div>
                      </div>
                    </MockPanel>
                  </VisualCardWell>
                </div>

                <div className={cn(overlayInnerClass, captionClass)}>
                  <h3 className="text-foreground text-left text-base font-medium">
                    Create your workspace
                  </h3>
                  <p className="text-accent mt-1 text-left text-sm leading-6">
                    Sign up with email, choose your workspace, and get your
                    feedback portal live without touching your codebase.
                  </p>
                </div>
              </article>
            </Link>

            <Link
              href="/docs/branding-setup/domain"
              className="block h-full min-w-0"
              aria-label="Learn more about sharing your board"
            >
              <article className={cn(overlayDialogClass, "flex h-full flex-col")}>
                <div className={cn(overlayInnerClass, "mb-2 flex flex-1 flex-col p-0")}>
                  <VisualCardWell color="green" step="02" label="Share your board">
                    <MockPanel reduceMotion={reduceMotion} delay={0.06}>
                      <div className={rowClass}>
                        <MockIcon
                          reduceMotion={reduceMotion}
                          className="rounded-md bg-foreground/5 text-emerald-500 ring-1 ring-foreground/10"
                        >
                          <Globe className="size-4" />
                        </MockIcon>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground truncate text-sm font-medium">
                            feedback.yourbrand.com
                          </p>
                          <p className="text-accent mt-0.5 text-xs">
                            Custom domain connected
                          </p>
                        </div>
                      </div>
                      <div className="h-px w-full bg-border" />
                      <div className="flex items-start justify-between gap-3 px-5 py-4 sm:px-6">
                        <div className="min-w-0">
                          <p className="text-foreground text-sm font-medium">
                            Public feedback board
                          </p>
                          <p className="text-accent mt-1 text-xs leading-5">
                            Collect votes, comments, and new requests in one
                            place your customers already recognize.
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <StatusChip tone="success">Live</StatusChip>
                          <StatusChip tone="info">Branded</StatusChip>
                        </div>
                      </div>
                    </MockPanel>
                  </VisualCardWell>
                </div>

                <div className={cn(overlayInnerClass, captionClass)}>
                  <h3 className="text-foreground text-left text-base font-medium">
                    Share your board
                  </h3>
                  <p className="text-accent mt-1 text-left text-sm leading-6">
                    Use your workspace subdomain or custom domain to collect
                    votes, comments, and new requests in one place.
                  </p>
                </div>
              </article>
            </Link>
          </div>
        </div>
      </section>
    </Container>
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
      className="w-full overflow-hidden rounded-lg bg-background shadow-md ring-1 ring-black/10 dark:ring-white/10"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ ...springIn, delay }}
    >
      {children}
    </motion.div>
  );
}

function MockIcon({
  children,
  className,
  delay = 0,
  reduceMotion,
}: {
  children: ReactNode;
  className: string;
  delay?: number;
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
      transition={{ ...springPop, delay }}
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
  tone: "success" | "info";
}) {
  return (
    <span className={overlayChipShellClass}>
      <span
        className={cn(
          overlayChipInnerClass,
          "h-5 min-h-5 px-1.5 text-[11px] font-medium",
          tone === "success" ? "text-emerald-700" : "text-blue-700",
        )}
      >
        {children}
      </span>
    </span>
  );
}
