"use client"

import { useSyncExternalStore } from "react"
import { REQUEST_PANEL_COOKIE } from "@/lib/request/panel"

const listeners = new Set<() => void>()
let fallback: boolean | undefined

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function getSnapshot() {
  try {
    const value = document.cookie.split("; ").find((cookie) => cookie.startsWith(REQUEST_PANEL_COOKIE + "="))?.split("=")[1]
    if (value !== undefined) return value === "true"
  } catch {
    // Keep toggling usable when browser storage is unavailable.
  }
  return fallback ?? false
}

function setOpen(open: boolean) {
  fallback = open
  try {
    document.cookie = `${REQUEST_PANEL_COOKIE}=${open}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`
  } catch {
    // The in-memory preference still works if cookies are blocked.
  }
  listeners.forEach((listener) => listener())
}

/** Server snapshot avoids a closed first paint; client snapshot survives prefetched routes. */
export function useRequestPanel(initialOpen: boolean) {
  const open = useSyncExternalStore(subscribe, getSnapshot, () => initialOpen)
  return [open, setOpen] as const
}
