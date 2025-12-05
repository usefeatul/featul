"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useRequestNavigation(
  workspaceSlug: string,
  navigationData?: {
    prev?: { slug: string } | null
    next?: { slug: string } | null
  }
) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : ""

  const prevHref = navigationData?.prev 
    ? `/workspaces/${workspaceSlug}/requests/${navigationData.prev.slug}${queryString}` 
    : undefined
    
  const nextHref = navigationData?.next 
    ? `/workspaces/${workspaceSlug}/requests/${navigationData.next.slug}${queryString}` 
    : undefined

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!navigationData) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input/textarea is focused
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement?.isContentEditable
      ) {
        return
      }

      if ((e.key === "ArrowLeft" || e.key === "z") && prevHref) {
        router.push(prevHref)
      } else if ((e.key === "ArrowRight" || e.key === "x") && nextHref) {
        router.push(nextHref)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [prevHref, nextHref, router, navigationData])

  return {
    prevHref,
    nextHref,
    searchParams
  }
}
