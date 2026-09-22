"use client";

import { useSyncExternalStore } from "react";
import { ASSISTANT_PANEL_COOKIE } from "@/lib/changelog/panel";

const STORAGE_KEY = "featul:assistant-panel:open";
const listeners = new Set<() => void>();
let fallback: boolean | undefined;

function subscribe(listener: () => void) {
  // Migrate the previous browser-only preference for subsequent server renders.
  const preference = readPreference();
  if (preference !== undefined) writeCookie(preference);
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function readPreference() {
  try {
    const value = document.cookie.split("; ")
      .find((cookie) => cookie.startsWith(`${ASSISTANT_PANEL_COOKIE}=`))
      ?.split("=")[1];
    if (value === "true" || value === "false") return value === "true";
  } catch {
    // Fall back to the previous browser preference if cookies are unavailable.
  }
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "true" || value === "false") return value === "true";
  } catch {
    // Use the session preference when storage is unavailable.
  }
  return fallback;
}

function writeCookie(open: boolean) {
  try {
    document.cookie = `${ASSISTANT_PANEL_COOKIE}=${open}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  } catch {
    // Toggling still works with the browser or in-memory preference.
  }
}

function setOpen(open: boolean) {
  fallback = open;
  writeCookie(open);
  try {
    localStorage.setItem(STORAGE_KEY, String(open));
  } catch {
    // Toggling still works without persistent storage.
  }
  listeners.forEach((listener) => listener());
}

export function useAssistantPanel(initialOpen: boolean) {
  const open = useSyncExternalStore(
    subscribe,
    () => readPreference() ?? initialOpen,
    () => initialOpen,
  );
  return [open, setOpen] as const;
}
