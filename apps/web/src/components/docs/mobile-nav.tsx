"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@featul/ui/lib/utils"
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo"
import ChevronExpandIcon from "@featul/ui/icons/chevron-expand"
import type { ReactElement } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@featul/ui/components/button"
import { AnimatePresence, motion } from "framer-motion"
import { docsSections, type DocsNavSection } from "@/config/docsNav"

/**
 * Derives the current page label from a docs pathname.
 *
 * @param pathname - The current Next.js pathname or null.
 * @returns A human-readable page label.
 */
export function getDocsCurrentPageLabel(pathname: string | null): string {
  if (!pathname) return "Introduction"
  const parts = pathname.split("/").filter(Boolean)
  if (parts.length === 0) return "Introduction"
  const lastPart = parts[parts.length - 1]
  if (!lastPart) return "Introduction"
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, " ")
}

/**
 * Derives the current docs section label from a pathname and section config.
 *
 * @param pathname - The current Next.js pathname or null.
 * @param sections - The docs navigation sections definition.
 * @returns The label of the current section or a default fallback.
 */
export function getDocsCurrentSectionLabel(
  pathname: string | null,
  sections: DocsNavSection[],
): string {
  if (!pathname) return "Getting started"
  for (const section of sections) {
    const hasMatch = section.items.some((item) => item.href === pathname)
    if (hasMatch) return section.label
  }
  return "Getting started"
}

/**
 * Mobile navigation for the docs layout, including a floating bottom pill
 * that expands into a full-screen navigation sheet.
 *
 * This component is only rendered on small screens.
 */
export function DocsMobileNav(): ReactElement {
  const pathname = usePathname()

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isBottomNavVisible, setIsBottomNavVisible] = useState<boolean>(true)
  const lastScrollYRef = useRef<number>(0)

  const currentPageLabel = useMemo(
    () => getDocsCurrentPageLabel(pathname),
    [pathname],
  )

  const currentSectionLabel = useMemo(
    () => getDocsCurrentSectionLabel(pathname, docsSections),
    [pathname],
  )

  function handleOpen(): void {
    setIsOpen(true)
  }

  function handleClose(): void {
    setIsOpen(false)
  }

  useEffect(() => {
    if (!pathname) {
      setIsOpen(false)
      return
    }

    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleScroll(): void {
      const currentScrollY = window.scrollY
      const lastScrollY = lastScrollYRef.current

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsBottomNavVisible(false)
      } else {
        setIsBottomNavVisible(true)
      }

      lastScrollYRef.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-14 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-medium text-sm">
            <FeatulLogoIcon className="text-muted-foreground" size={16} />
            <span>Docs</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-xs h-8">
            Log in
          </Button>
          <Button size="sm" className="text-xs h-8 rounded-full bg-foreground text-background hover:bg-foreground/90">
            Register
          </Button>
        </div>
      </div>

      {/* Floating Bottom Navigation Pill / Expanded Menu */}
      <div
        className={cn(
          "md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-70 w-auto max-w-[calc(100vw-32px)]",
          !isOpen && !isBottomNavVisible ? "translate-y-24 opacity-0" : "translate-y-0 opacity-100",
        )}
      >
        <motion.div
          role="group"
          aria-label="Docs navigation"
          initial={false}
          animate={{
            width: isOpen ? "90vw" : "50vw",
            height: isOpen ? "80vh" : "3rem",
            transition: isOpen
              ? {
                  width: { duration: 0.3, ease: "easeOut" },
                  height: { delay: 0.3, duration: 0.2, ease: "easeIn" },
                }
              : {
                  height: { duration: 0.2, ease: "easeIn" },
                  width: { delay: 0.2, duration: 0.3, ease: "easeOut" },
                },
          }}
          style={{ originY: 1 }}
          className={cn(
            "bg-black text-white rounded-4xl shadow-lg border border-white/10 overflow-hidden flex flex-col mx-auto",
            "max-w-[380px]",
          )}
        >
          {isOpen && (
            <div
              id="docs-mobile-nav-panel"
              className="overflow-y-auto flex-1 p-4 space-y-6"
            >
              {docsSections.map((section) => (
                <div key={section.label} className="space-y-2">
                  <div className="text-xs font-medium uppercase tracking-wider text-white/40 px-2">
                    {section.label}
                  </div>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={handleClose}
                            className={cn(
                              "flex items-center gap-3 rounded-4xl px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-white/10 text-white font-medium"
                                : "text-accent hover:text-white hover:bg-white/5",
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-sm transition-colors",
                                isActive ? "bg-primary text-white" : "bg-white/20",
                              )}
                            />
                            {item.label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={isOpen ? handleClose : handleOpen}
            className="flex w-full items-center px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label={`Toggle docs navigation, currently on ${currentSectionLabel} – ${currentPageLabel}`}
            aria-expanded={isOpen}
            aria-controls="docs-mobile-nav-panel"
          >
            <div
              className={cn(
                "flex w-full items-center px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-out",
                isOpen ? "justify-between" : "justify-center",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-accent text-xs">{currentSectionLabel}</span>
                <span>{currentPageLabel}</span>
              </div>
              <div className="flex items-center pl-2 pr-1">
                <ChevronExpandIcon className="w-4 h-4 text-accent" />
              </div>
            </div>
          </button>
        </motion.div>
      </div>
    </>
  )
}
