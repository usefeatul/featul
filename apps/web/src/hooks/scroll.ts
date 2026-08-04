import { useEffect } from "react"
import { escapeId } from "@/lib/toc-utils"

export function useAutoScrollActiveLink(
  activeId: string | null,
  expanded: boolean,
  containerRef: React.RefObject<HTMLElement>
) {
  useEffect(() => {
    if (!activeId || expanded) return
    const container = containerRef.current
    if (!container) return
    const viewport = container.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
    if (!viewport) return
    const selectorId = escapeId(activeId)
    const anchor = viewport.querySelector<HTMLElement>(`a[href="#${selectorId}"]`)
    if (anchor) {
      anchor.scrollIntoView({ block: "nearest", inline: "nearest" })
    }
  }, [activeId, expanded, containerRef])
}