"use client";

import React from "react";
import { motion } from "framer-motion";
import { DitherClouds } from "@featul/ui/components/clouds";
import { DitherGradient } from "@featul/ui/components/gradient";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import { LoaderIcon } from "@/components/global/icons";

export const stepMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
} as const;

/** Raised card surface shared with the help import done screen. */
export const raisedCardClass =
  "rounded-xl [corner-shape:squircle] border border-black/[0.08] bg-card shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1px_1px_rgba(0,0,0,0.03)] dark:border-white/[0.08] dark:bg-[color-mix(in_oklab,var(--card),white_3%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";

/** Brand banner: the kit's primary contours behind a headline. */
export function DataBanner({
  eyebrow,
  title,
  description,
  busy = false,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Swaps the eyebrow pill for a spinner while work is running. */
  busy?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative isolate shrink-0 overflow-hidden bg-primary px-5 pb-6 pt-5 text-white sm:px-6">
      <div className="absolute inset-0 -z-10 opacity-90">
        <DitherClouds primary fit="cover" />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-r from-[var(--primary)] via-[color-mix(in_oklab,var(--primary)_70%,transparent)] to-transparent"
      />
      {eyebrow ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
          {busy ? <LoaderIcon className="size-3" /> : null}
          {eyebrow}
        </span>
      ) : null}
      <h2 className={cn("text-xl font-semibold tracking-tight", eyebrow && "mt-2")}>{title}</h2>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm text-white/85">{description}</p>
      ) : null}
      {children}
    </div>
  );
}

/** Small white pills under a banner headline. */
export function BannerChips({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2 text-xs text-white/90">
      {items.map((item) => (
        <li key={item} className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur-sm">
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Dither fade at the top of a finished step, with one real card rising out of it.
 * The card runs past the plate's bottom and is clipped, so it reads as continuing
 * behind the divider instead of ending on it.
 */
export function ResultPlate({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate shrink-0 overflow-hidden px-6 pt-8 sm:px-10">
      <div
        className="absolute inset-0 -z-10"
        style={{
          maskImage:
            "radial-gradient(ellipse 85% 100% at 50% 0%, black 0%, rgba(0,0,0,0.45) 55%, transparent 95%)",
        }}
      >
        <DitherGradient to="primary" direction="down" cell={3} opacity={0.45} />
      </div>
      <div className={cn("mx-auto -mb-4 max-w-sm pb-4", raisedCardClass)}>{children}</div>
    </div>
  );
}

/** Headline and actions under a result plate. */
export function ResultFooter({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border/60 px-5 pb-5 pt-4 sm:px-6 dark:border-white/[0.07]">
      <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
      {description ? <p className="mt-1 text-sm text-accent">{description}</p> : null}
      <div className="mt-4 flex justify-end gap-2">{children}</div>
    </div>
  );
}

/** Failure step: the banner stays, with the reason and a retry underneath. */
export function DataErrorStep({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <motion.div key="error" {...stepMotion}>
      <DataBanner eyebrow="Something went wrong" title={title} />
      <div className="px-5 py-5 sm:px-6">
        <p className="text-sm text-destructive">{message}</p>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
