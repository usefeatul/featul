"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@featul/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@featul/ui/components/tooltip";
import { Sparkles, X } from "@/components/global/icons";
import { fetchWorkspaceBySlug, workspaceQueryKeys } from "@/lib/workspace/client";

const DISMISS_DURATION = 3 * 24 * 60 * 60 * 1000;

export default function Upgrade({ slug, collapsed, initialPlan, userKey }: {
  slug: string;
  userKey: string;
  collapsed: boolean;
  initialPlan?: "free" | "starter" | "professional" | null;
}) {
  const reduceMotion = useReducedMotion();
  const storageKey = `featul:upgrade-dismissed:${encodeURIComponent(userKey)}:${slug}`;
  const [dismissal, setDismissal] = useState<{ key: string; until: number } | null>(null);

  useEffect(() => {
    const read = () => {
      let until = 0;
      try {
        const stored = Number(localStorage.getItem(storageKey));
        if (Number.isFinite(stored) && stored > Date.now()) {
          until = Math.min(stored, Date.now() + DISMISS_DURATION);
        }
      } catch { /* The card remains usable when browser storage is unavailable. */ }
      setDismissal({ key: storageKey, until });
    };
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) read();
    };
    read();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [storageKey]);

  useEffect(() => {
    if (!dismissal?.until || dismissal.key !== storageKey) return;
    const timer = window.setTimeout(() => {
      setDismissal({ key: storageKey, until: 0 });
    }, Math.max(0, dismissal.until - Date.now()));
    return () => window.clearTimeout(timer);
  }, [dismissal, storageKey]);

  const dismiss = () => {
    const until = Date.now() + DISMISS_DURATION;
    try { localStorage.setItem(storageKey, String(until)); } catch { /* Hide for this session. */ }
    setDismissal({ key: storageKey, until });
  };

  const { data: workspace } = useQuery({
    queryKey: workspaceQueryKeys.bySlug(slug),
    queryFn: () => fetchWorkspaceBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
    refetchOnMount: false,
  });
  const plan = workspace?.plan ?? initialPlan;
  const visible = Boolean(slug && plan && plan !== "professional" && dismissal?.key === storageKey && dismissal.until === 0);

  const href = `/workspaces/${slug}/settings/billing`;
  const content = collapsed ? (
    <div className="flex shrink-0 justify-center px-1.5 py-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild size="icon-sm" variant="ghost" aria-label="View upgrade plans" className="text-muted-foreground dark:bg-transparent dark:text-muted-foreground">
            <Link href={href}><Sparkles className="size-4" /></Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>View plans</TooltipContent>
      </Tooltip>
    </div>
  ) : (
    <div className="shrink-0 px-3 pt-3">
      <section aria-label="Upgrade your plan" className="relative rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide upgrade card for three days"
          title="Hide for three days"
          className="absolute right-1.5 top-1.5 flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3.5" aria-hidden />
        </button>
        <p className="pr-5 text-xs font-medium text-foreground">Need more room?</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Higher limits as your team grows.
        </p>
        <Link
          href={href}
          className="mt-1 inline-flex min-h-6 items-center rounded-sm text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View plans
        </Link>
      </section>
    </div>
  );

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          key={storageKey}
          className="shrink-0 overflow-hidden"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={{
            hidden: { height: 0 },
            visible: {
              height: "auto",
              transition: { duration: reduceMotion ? 0 : 0.18, ease: "easeOut" },
            },
            exit: {
              height: 0,
              transition: { duration: reduceMotion ? 0 : 0.18, ease: "easeOut" },
            },
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { duration: reduceMotion ? 0 : 0.18 },
              },
              exit: {
                opacity: 0,
                transition: { duration: reduceMotion ? 0 : 0.12 },
              },
            }}
          >
            {content}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
