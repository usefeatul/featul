"use client";

import { useEffect, useState } from "react";

const DISMISS_DURATION = 3 * 24 * 60 * 60 * 1000;

/** Separate keys preserve existing upgrade dismissals and scope every card to its user/workspace. */
export function useCardDismissal(storageKey: string) {
  const [dismissal, setDismissal] = useState<{ key: string; until: number } | null>(null);

  useEffect(() => {
    const read = () => {
      let until = 0;
      try {
        const stored = Number(localStorage.getItem(storageKey));
        if (Number.isFinite(stored) && stored > Date.now()) {
          until = Math.min(stored, Date.now() + DISMISS_DURATION);
        }
      } catch { /* Keep the card usable when browser storage is unavailable. */ }
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

  return {
    ready: dismissal?.key === storageKey,
    visible: dismissal?.key === storageKey && dismissal.until === 0,
    dismiss: () => {
      const until = Date.now() + DISMISS_DURATION;
      try { localStorage.setItem(storageKey, String(until)); } catch { /* Hide for this session. */ }
      setDismissal({ key: storageKey, until });
    },
  };
}
