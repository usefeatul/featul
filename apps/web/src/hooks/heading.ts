import { useEffect, useState } from "react"
import type { TocItem } from "@/lib/toc"

export function useActiveHeading(items: TocItem[], rootSelector?: string) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null)

  useEffect(() => {
    if (!items?.length) return

    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el)

    if (!headings.length) return

    const root = rootSelector
      ? document.querySelector<HTMLElement>(rootSelector)
      : null

    function getScrollTop(): number {
      return root ? root.scrollTop : window.scrollY
    }

    function getViewportHeight(): number {
      return root ? root.clientHeight : window.innerHeight
    }

    function getScrollHeight(): number {
      if (root) return root.scrollHeight
      const doc = document.documentElement
      const body = document.body
      return Math.max(doc.scrollHeight, body?.scrollHeight ?? 0)
    }

    function getHeadingTop(el: HTMLElement): number {
      if (root) {
        const rootRect = root.getBoundingClientRect()
        return el.getBoundingClientRect().top - rootRect.top + root.scrollTop
      }
      return el.getBoundingClientRect().top + window.scrollY
    }

    function resolveActiveHeadingId(): string {
      const scrollTop = getScrollTop()
      const viewportHeight = getViewportHeight()
      const scrollHeight = getScrollHeight()

      if (scrollTop + viewportHeight >= scrollHeight - 2) {
        return headings[headings.length - 1]!.id
      }

      const probeY = scrollTop + Math.min(200, viewportHeight * 0.28)
      let current = headings[0]!

      for (const heading of headings) {
        if (getHeadingTop(heading) <= probeY) {
          current = heading
          continue
        }
        break
      }

      return current.id
    }

    let rafId = 0
    const updateActiveHeading = () => {
      const nextId = resolveActiveHeadingId()
      setActiveId((prevId) => (prevId === nextId ? prevId : nextId))
    }

    const scheduleUpdate = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        updateActiveHeading()
      })
    }

    updateActiveHeading()

    const scrollTarget: HTMLElement | Window = root ?? window
    scrollTarget.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)

    return () => {
      scrollTarget.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [items, rootSelector])

  return activeId
}
