"use client"

import React from "react"
import { useRouter } from "next/navigation"

interface UseFilterBarVisibilityOptions {
  hasAnyFilters: boolean
  buildClearAllHref: () => string
}

interface UseFilterBarVisibilityResult {
  isVisible: boolean
  handleClearAll: () => void
}

/** Shows the filter bar when any filter is active. Clear-all replaces the URL without scrolling. */
export function useFilterBarVisibility(
  options: UseFilterBarVisibilityOptions
): UseFilterBarVisibilityResult {
  const { hasAnyFilters, buildClearAllHref } = options
  const router = useRouter()

  const handleClearAll = React.useCallback(() => {
    if (!hasAnyFilters) return
    const href = buildClearAllHref()
    React.startTransition(() => router.replace(href, { scroll: false }))
  }, [hasAnyFilters, buildClearAllHref, router])

  return {
    isVisible: hasAnyFilters,
    handleClearAll,
  }
}
