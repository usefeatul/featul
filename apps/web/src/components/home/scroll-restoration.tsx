"use client";

import { useLayoutEffect } from "react";

export const HOME_SCROLL_KEY = "featul:home-scroll:v4";

let initializedForThisDocument = false;

function readSavedY() {
  try {
    return Number.parseInt(sessionStorage.getItem(HOME_SCROLL_KEY) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

function writeSavedY(y: number) {
  try {
    sessionStorage.setItem(HOME_SCROLL_KEY, String(Math.max(0, Math.round(y))));
  } catch {
    /* ignore private-mode quota */
  }
}

function navigationType() {
  const entry = performance.getEntriesByType(
    "navigation",
  )[0] as PerformanceNavigationTiming | undefined;
  return entry?.type ?? "navigate";
}

function shouldRestoreOnThisLoad() {
  const type = navigationType();
  return type === "reload" || type === "back_forward";
}

export function HomeScrollMemory() {
  useLayoutEffect(() => {
    history.scrollRestoration = "manual";

    const html = document.documentElement;
    const previousBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    const remount = initializedForThisDocument;
    initializedForThisDocument = true;

    // Client-side return to `/` should stay at the top (Next.js already
    // scrolled there). Only a document reload/back restores the last offset.
    const target = remount || !shouldRestoreOnThisLoad() ? window.scrollY : readSavedY();
    writeSavedY(target);

    let locked = !remount && target > 0;
    let pinning = false;

    const apply = () => {
      if (!locked) return;
      if (Math.abs(window.scrollY - target) < 2) return;
      pinning = true;
      window.scrollTo({ top: target, left: 0, behavior: "auto" });
      pinning = false;
    };

    if (locked) {
      apply();
    }

    const frame = window.requestAnimationFrame(apply);
    const pass = window.setTimeout(apply, 50);
    const settle = window.setTimeout(apply, 250);
    const unlock = window.setTimeout(() => {
      locked = false;
      html.style.opacity = "";
      html.style.scrollBehavior = previousBehavior;
    }, 400);

    const persist = () => writeSavedY(window.scrollY);

    const onScroll = () => {
      if (pinning) return;
      if (locked) {
        apply();
        return;
      }
      persist();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", persist);

    return () => {
      persist();
      window.cancelAnimationFrame(frame);
      window.clearTimeout(pass);
      window.clearTimeout(settle);
      window.clearTimeout(unlock);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", persist);
      html.style.opacity = "";
      html.style.scrollBehavior = previousBehavior;
    };
  }, []);

  return null;
}
