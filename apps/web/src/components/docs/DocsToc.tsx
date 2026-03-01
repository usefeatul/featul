"use client"

import { cn } from "@featul/ui/lib/utils"
import type { TocItem } from "@/lib/toc"
import {
  buildTocPath,
  getProgressForIndex,
  getTocHeight,
  TOC_ITEM_HEIGHT,
  TOC_INDENT_OFFSET,
} from "@/lib/toc-path"
import { useId, useLayoutEffect, useMemo } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useActiveHeading } from "@/hooks/use-active-heading"

interface DocsTocProps {
  items: TocItem[]
}

const TOC_TRACK_TOP_TRIM = 0
const TOC_TRACK_BOTTOM_TRIM = 13

export function DocsToc({ items }: DocsTocProps) {
  const activeId = useActiveHeading(items, '[data-docs-scroll-container="true"]')
  const rawClipPathId = useId()
  const clipPathId = useMemo(
    () => `docs-toc-track-${rawClipPathId.replace(/:/g, "")}`,
    [rawClipPathId]
  )

  // Find active index
  const activeIndex = useMemo(() => {
    return items.findIndex((item) => item.id === activeId)
  }, [items, activeId])

  // Build the SVG path for the zig-zag border track
  const { pathD, pathLength, itemPositions } = useMemo(
    () => buildTocPath(items),
    [items]
  )

  // Spring-animated progress along the path (0 to 1)
  const targetProgress = useMotionValue(0)
  const springProgress = useSpring(targetProgress, {
    stiffness: 120,
    damping: 20,
    mass: 1,
  })

  // Update progress when active item changes
  useLayoutEffect(() => {
    const isLastItemActive = activeIndex === items.length - 1
    const progress = isLastItemActive
      ? 1
      : getProgressForIndex(activeIndex, itemPositions, pathLength)
    targetProgress.set(progress)
  }, [activeIndex, itemPositions, items.length, pathLength, targetProgress])

  // Convert progress to stroke-dashoffset
  const strokeDashoffset = useTransform(
    springProgress,
    [0, 1],
    [pathLength, 0]
  )

  if (!items?.length) return null

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    const container = document.querySelector<HTMLElement>(
      '[data-docs-scroll-container="true"]'
    )
    const el = document.getElementById(id)
    if (!container || !el) return

    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const offsetInContainer = elRect.top - containerRect.top
    const targetY = offsetInContainer + container.scrollTop

    container.scrollTo({ top: targetY, behavior: "smooth" })

    if (history?.replaceState) {
      history.replaceState(null, "", `#${id}`)
    }
  }

  const totalHeight = getTocHeight(items.length)
  const clipHeight = totalHeight - TOC_TRACK_TOP_TRIM - TOC_TRACK_BOTTOM_TRIM
  const trackClipPath = clipHeight > 0 ? `url(#${clipPathId})` : undefined

  return (
    <nav aria-label="On this page" className="text-xs text-accent">
      <div className="text-md font-bold text-foreground mb-3">On this page</div>
      <div className="relative" style={{ paddingLeft: TOC_INDENT_OFFSET + 8 }}>
        {/* SVG for zig-zag border track */}
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          width={TOC_INDENT_OFFSET + 4}
          height={totalHeight}
          style={{ overflow: "visible" }}
        >
          {trackClipPath && (
            <defs>
              <clipPath id={clipPathId}>
                <rect
                  x={-4}
                  y={TOC_TRACK_TOP_TRIM}
                  width={TOC_INDENT_OFFSET + 13}
                  height={clipHeight}
                />
              </clipPath>
            </defs>
          )}

          {/* Background track */}
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="text-border/50"
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath={trackClipPath}
          />
          {/* Animated progress indicator */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="text-primary"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            style={{ strokeDashoffset }}
            clipPath={trackClipPath}
          />
        </svg>

        {/* Nav items */}
        <ul className="list-none pl-0 m-0 space-y-0">
          {items.map((item) => {
            const isH3 = item.level === 3

            return (
              <li
                key={item.id}
                style={{
                  marginLeft: isH3 ? 0 : -TOC_INDENT_OFFSET,
                  height: TOC_ITEM_HEIGHT,
                }}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={cn(
                    "flex items-center h-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-md",
                    activeId === item.id && "text-foreground font-medium"
                  )}
                  aria-current={activeId === item.id ? "location" : undefined}
                >
                  {item.text}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
