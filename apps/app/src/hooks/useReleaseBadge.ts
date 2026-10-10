"use client";

import { useEffect, useState } from "react";
import {
  JUST_SHIPPED_DURATION,
  releaseBadge,
} from "@/components/widget/release";

export function useReleaseBadge(entry: Parameters<typeof releaseBadge>[0]) {
  const [now, setNow] = useState(Date.now);
  const publishedAt = entry.publishedAt
    ? new Date(entry.publishedAt).getTime()
    : NaN;

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    refresh();
    const remaining = publishedAt + JUST_SHIPPED_DURATION - Date.now();
    const timer =
      remaining > 0 && remaining <= JUST_SHIPPED_DURATION
        ? window.setTimeout(refresh, remaining)
        : undefined;
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [publishedAt]);

  return releaseBadge(entry, now);
}
