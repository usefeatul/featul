"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Transition } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { cn } from "@featul/ui/lib/utils"
import { docsSections, type DocsNavItem } from "@/config/docsNav"
import { DocsTopicIcon } from "./surface"

/**
 * Each docs page renders its own tree, so navigating remounts it. This survives the remount
 * (client only; never read during SSR) so open sections and the rail's scroll stay put
 * instead of snapping back.
 */
const navMemory = { expanded: new Set<string>(), railScroll: 0 }

// Short and soft: the tree should feel responsive, never bouncy.
const glide: Transition = { type: "spring", stiffness: 520, damping: 42, mass: 0.6 }
const reveal: Transition = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }
const instant: Transition = { duration: 0 }

type Motion = { glide: Transition; reveal: Transition }

/**
 * Desktop docs navigation, the help center's tree: every section in a fixed order. The current
 * section opens in place to show its pages; the chevron peeks into any other without navigating.
 */
export function DocsNavTree() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const motionConfig: Motion = reduceMotion ? { glide: instant, reveal: instant } : { glide, reveal }
  const activeHref = pathname ?? ""
  const currentKey = docsSections.find((s) => s.items.some((i) => i.href === activeHref))?.label
  const navRef = React.useRef<HTMLElement>(null)
  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    // Empty on the server and on a fresh page load, so hydration still matches.
    const remembered = typeof window === "undefined" ? [] : [...navMemory.expanded]
    return new Set([...remembered, ...(currentKey ? [currentKey] : [])])
  })
  // Moves the marker on click, before the next page arrives, so the slide is visible.
  const [selectedHref, setSelectedHref] = React.useState(activeHref)
  const [hoveredRow, setHoveredRow] = React.useState<string | null>(null)

  React.useEffect(() => setSelectedHref(activeHref), [activeHref])

  // Moving to another section opens it too; whatever the reader opened stays open.
  React.useEffect(() => {
    if (!currentKey) return
    setExpanded((prev) => (prev.has(currentKey) ? prev : new Set(prev).add(currentKey)))
  }, [currentKey])

  React.useEffect(() => {
    navMemory.expanded = new Set(expanded)
  }, [expanded])

  // Put the rail back where the reader left it before the new page paints.
  React.useLayoutEffect(() => {
    const rail = navRef.current?.closest<HTMLElement>("[data-docs-rail]")
    if (!rail) return
    rail.scrollTop = navMemory.railScroll
    const save = () => {
      navMemory.railScroll = rail.scrollTop
    }
    rail.addEventListener("scroll", save, { passive: true })
    return () => rail.removeEventListener("scroll", save)
  }, [])

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <nav ref={navRef} aria-label="Documentation" className="text-sm">
      <p className="mb-3 flex items-center px-2 text-xs font-medium text-muted-foreground">Documentation</p>
      <LayoutGroup id="docs-nav">
        <ul className="space-y-0.5" onMouseLeave={() => setHoveredRow(null)}>
          {docsSections.map((section) => {
            const key = section.label
            const isOpen = expanded.has(key)
            const isCurrent = key === currentKey
            const listId = `docs-nav-${key.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
            const rowKey = `section:${key}`
            const first = section.items[0]
            return (
              <li key={key}>
                <motion.div
                  onMouseEnter={() => setHoveredRow(rowKey)}
                  whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                  className={cn(
                    "relative flex items-center rounded-lg transition-colors duration-150",
                    isCurrent || hoveredRow === rowKey ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {hoveredRow === rowKey ? (
                    <motion.span
                      layoutId="docs-nav-hover-section"
                      transition={motionConfig.glide}
                      aria-hidden
                      className="absolute inset-0 rounded-lg bg-muted/70 dark:bg-white/[0.05]"
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    aria-expanded={isOpen}
                    aria-controls={listId}
                    aria-label={`${isOpen ? "Collapse" : "Expand"} ${section.label}`}
                    className="relative flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:text-foreground"
                  >
                    <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={motionConfig.reveal} className="flex">
                      <ChevronRight aria-hidden className="size-3.5" strokeWidth={1.5} />
                    </motion.span>
                  </button>
                  <Link
                    href={first?.href ?? "/docs"}
                    onClick={() => {
                      if (!isOpen) toggle(key)
                      if (first) setSelectedHref(first.href)
                    }}
                    className={cn(
                      "relative flex min-w-0 flex-1 items-center gap-2 py-1.5 pr-2 text-left",
                      isCurrent && "font-medium",
                    )}
                  >
                    <DocsTopicIcon icon={section.icon} className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{section.label}</span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground/70">{section.items.length}</span>
                  </Link>
                </motion.div>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="branch"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={motionConfig.reveal}
                      className="overflow-hidden"
                    >
                      <PageBranch
                        id={listId}
                        branchKey={key}
                        items={section.items}
                        selectedHref={selectedHref}
                        hoveredRow={hoveredRow}
                        onHover={setHoveredRow}
                        onSelect={setSelectedHref}
                        motionConfig={motionConfig}
                        pressable={!reduceMotion}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </LayoutGroup>
    </nav>
  )
}

function PageBranch({
  id,
  branchKey,
  items,
  selectedHref,
  hoveredRow,
  onHover,
  onSelect,
  motionConfig,
  pressable,
}: {
  id: string
  branchKey: string
  items: DocsNavItem[]
  selectedHref: string
  hoveredRow: string | null
  onHover: (row: string) => void
  onSelect: (href: string) => void
  motionConfig: Motion
  pressable: boolean
}) {
  return (
    <ul id={id} className="mb-2 ml-[0.875rem] mt-0.5 border-l border-border/70 dark:border-white/[0.08]">
      {items.map((item) => {
        const active = item.href === selectedHref
        const rowKey = `page:${item.href}`
        const hovered = hoveredRow === rowKey
        return (
          <li key={item.href} className="relative" onMouseEnter={() => onHover(rowKey)}>
            {active ? (
              // One marker for the whole tree: it slides along the branch line to the new page.
              <motion.span
                layoutId="docs-nav-active"
                transition={motionConfig.glide}
                aria-hidden
                className="absolute -left-px inset-y-1 w-0.5 rounded-full bg-primary"
              />
            ) : null}
            {hovered ? (
              <motion.span
                layoutId={`docs-nav-hover-${branchKey}`}
                transition={motionConfig.glide}
                aria-hidden
                className="absolute inset-y-0 left-2 right-0 rounded-md bg-muted/60 dark:bg-white/[0.04]"
              />
            ) : null}
            <motion.div whileTap={pressable ? { scale: 0.985 } : undefined} className="relative origin-left">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => onSelect(item.href)}
                className={cn(
                  "block py-1.5 pl-4 pr-2 text-[13px] leading-5 transition-colors duration-150",
                  active ? "font-medium text-foreground" : hovered ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            </motion.div>
          </li>
        )
      })}
    </ul>
  )
}
