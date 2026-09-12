"use client";

import { useLayoutEffect } from "react";

export const HOME_SCROLL_KEY = "featul:home-scroll:v4";
export const HOME_NAV_CREATE_KEY = "featul:nav-over-create:v1";

export function writeNavOverCreate(over: boolean) {
  try {
    sessionStorage.setItem(HOME_NAV_CREATE_KEY, over ? "1" : "0");
  } catch {
    /* ignore private-mode quota */
  }
}

/** Visual primary band: heading block plus the half-image extension. */
export function getCreateBandBounds() {
  const create = document.querySelector("[data-component='Create']");
  if (!create) return null;
  const a = create.getBoundingClientRect();
  const extend = document.querySelector("[data-create-band-extend]");
  if (!extend) return { top: a.top, bottom: a.bottom };
  const b = extend.getBoundingClientRect();
  return { top: Math.min(a.top, b.top), bottom: Math.max(a.bottom, b.bottom) };
}

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

    const syncScrolled = (y: number) => {
      html.toggleAttribute("data-scrolled", y > 0);
    };

    const apply = () => {
      if (!locked) return;
      syncScrolled(target);
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

    const persist = () => {
      writeSavedY(window.scrollY);
      syncScrolled(window.scrollY);
      const band = getCreateBandBounds();
      if (!band) {
        writeNavOverCreate(false);
        return;
      }
      writeNavOverCreate(!(band.bottom <= 0 || band.top >= 64));
    };

    syncScrolled(target);

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
