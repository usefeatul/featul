"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@featul/ui/components/button";
import { DitherGradient } from "@featul/ui/components/gradient";
import { Tooltip, TooltipContent, TooltipTrigger } from "@featul/ui/components/tooltip";
import { overlayDialogClass, overlayDialogInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
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
            <Button asChild size="icon-sm" variant="default" aria-label="Upgrade plan">
              <Link href={href}><Sparkles className="size-4" /></Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>Upgrade plan</TooltipContent>
        </Tooltip>
      </div>
    ) : (
    <div className="shrink-0 px-3 pt-3">
      <section aria-label="Upgrade your plan" className={overlayDialogClass}>
        <div className={cn(overlayDialogInnerClass, "relative overflow-hidden px-3 py-3")}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-20 [mask-image:linear-gradient(to_left,black,transparent)]">
            <DitherGradient from="blue" direction="down" cell={3} opacity={0.22} />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={dismiss}
              aria-label="Hide upgrade card for three days"
              title="Hide for three days"
              className="absolute -right-1 -top-1 flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-3.5" aria-hidden />
            </button>
            <div className="flex items-center gap-2 pr-5">
              <Sparkles className="size-4 text-primary" aria-hidden />
              <p className="text-sm font-medium text-foreground">Get more from Featul</p>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              Unlock higher limits and more room for your team.
            </p>
            <Button asChild variant="default" className="mt-3 w-full">
              <Link href={href}>Upgrade plan</Link>
            </Button>
          </div>
        </div>
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
              transition: { duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] },
            },
            exit: {
              height: 0,
              transition: { duration: reduceMotion ? 0 : 0.24, delay: reduceMotion ? 0 : 0.1, ease: [0.4, 0, 0.2, 1] },
            },
          }}
        >
          <motion.div
            style={{ transformOrigin: "50% 100%" }}
            variants={{
              hidden: { opacity: 0, y: reduceMotion ? 0 : 14, scale: reduceMotion ? 1 : 0.96 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 320, damping: 28, mass: 0.8, delay: 0.06, opacity: { duration: 0.2 } },
              },
              exit: {
                opacity: 0,
                y: reduceMotion ? 0 : -8,
                scale: reduceMotion ? 1 : 0.98,
                transition: { duration: reduceMotion ? 0 : 0.16, ease: "easeOut" },
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
