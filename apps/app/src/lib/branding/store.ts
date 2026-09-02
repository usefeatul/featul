"use client"

import * as React from "react"
import { useSyncExternalStore } from "react"

type Listener = () => void

const logos = new Map<string, string>()
const names = new Map<string, string>()
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
  if (!slug) return
  if (!url) logos.delete(slug)
  else logos.set(slug, url)
  notify()
}

/** Optimistic in-memory workspace name cache. */
export function setLiveWorkspaceName(slug: string, name: string) {
  if (!slug) return
  const next = name.trim()
  if (!next) names.delete(slug)
  else names.set(slug, next)
  notify()
}

/** Subscribes to the optimistic logo for a workspace slug. */
export function useWorkspaceLogo(slug: string): string | null {
  const get = React.useCallback(() => logos.get(slug) ?? null, [slug])
  return useSyncExternalStore(subscribe, get, () => null)
}

/** Subscribes to the optimistic name for a workspace slug. */
export function useLiveWorkspaceName(slug: string): string | null {
  const get = React.useCallback(() => names.get(slug) ?? null, [slug])
  return useSyncExternalStore(subscribe, get, () => null)
}
