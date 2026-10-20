"use client"

import React from "react"
import type { NavItem } from "@/types/nav"
import { serializeSidebarPins, sidebarPinsCookieName } from "@/lib/sidebar/pins"

/** Per-workspace pinned sidebar items, keyed by label and kept in pin order. Seeded from the server cookie. */
export function usePinnedNav(slug: string, items: NavItem[], initialPins: string[] = []) {
  const [pins, setPins] = React.useState<{ slug: string; labels: string[] }>({ slug, labels: initialPins })
  // Reset when switching workspaces client-side; the layout passes that workspace's cookie.
  const labels = pins.slug === slug ? pins.labels : initialPins

  const togglePin = React.useCallback(
    (label: string) => {
      const next = labels.includes(label) ? labels.filter((l) => l !== label) : [...labels, label]
      document.cookie = `${sidebarPinsCookieName(slug)}=${serializeSidebarPins(next)}; Path=/; Max-Age=31536000; SameSite=Lax`
      setPins({ slug, labels: next })
    },
    [labels, slug],
  )

  const pinnedItems = React.useMemo(
    () => labels.map((label) => items.find((item) => item.label === label)).filter((item): item is NavItem => !!item),
    [labels, items],
  )
  const isPinned = React.useCallback((label: string) => labels.includes(label), [labels])

  return { pinnedItems, isPinned, togglePin }
}
