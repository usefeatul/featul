"use client";

import { useEffect } from "react";

export const HOME_SCROLL_KEY = "featul:home-scroll:v2";

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

export function HomeScrollMemory() {
  useEffect(() => {
    history.scrollRestoration = "manual";

    const html = document.documentElement;
    const previousBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    let target = readSavedY();
    let locked = true;
    let pinning = false;

    const apply = () => {
      document.documentElement.toggleAttribute("data-scrolled", target > 0);
      if (Math.abs(window.scrollY - target) < 2) return;
      pinning = true;
      window.scrollTo({ top: target, left: 0, behavior: "auto" });
      pinning = false;
    };

    apply();
    const frame = window.requestAnimationFrame(apply);
    const pass = window.setTimeout(apply, 50);
    const settle = window.setTimeout(apply, 250);
    const unlock = window.setTimeout(() => {
      locked = false;
      html.style.opacity = "";
      html.style.scrollBehavior = previousBehavior;
    }, 500);

    const onScroll = () => {
      if (pinning) return;
      if (locked) {
        apply();
        return;
      }
      writeSavedY(window.scrollY);
      document.documentElement.toggleAttribute("data-scrolled", window.scrollY > 0);
    };

    const persist = () => {
      writeSavedY(window.scrollY);
      document.documentElement.toggleAttribute("data-scrolled", window.scrollY > 0);
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
