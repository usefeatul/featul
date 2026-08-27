"use client"

import * as React from "react"
import { useSyncExternalStore } from "react"

type Listener = () => void

const logos = new Map<string, string>()
const listeners = new Set<Listener>()

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  for (const l of listeners) l()
}

/** Optimistic in-memory workspace logo cache. */
export function setWorkspaceLogo(slug: string, url: string) {
  if (!slug || !url) return
  logos.set(slug, url)
  notify()
}

/** Subscribes to the optimistic logo for a workspace slug. */
export function useWorkspaceLogo(slug: string): string | null {
  const get = React.useCallback(() => logos.get(slug) ?? null, [slug])
  return useSyncExternalStore(subscribe, get, () => null)
}
