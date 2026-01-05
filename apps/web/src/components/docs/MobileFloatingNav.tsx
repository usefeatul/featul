"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@featul/ui/lib/utils"
import ChevronExpandIcon from "@featul/ui/icons/chevron-expand"
import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { docsSections } from "@/config/docsNav"
import {
  getDocsCurrentPageLabel,
  getDocsCurrentSectionLabel,
} from "../../lib/mobile-nav-utils"

export function DocsMobileFloatingNav() {
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

  // Close navigation when pathname changes
  useEffect(() => {
    if (!pathname) {
      setIsOpen(false)
      return
    }
    setIsOpen(false)
  }, [pathname])

  // Handle scroll-based visibility
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
    <div
      className={cn(
        "md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-70 transition-all duration-300 ease-out",
        !isOpen && !isBottomNavVisible
          ? "translate-y-24 opacity-0"
          : "translate-y-0 opacity-100",
      )}
    >
      <motion.div
        role="group"
        aria-label="Docs navigation"
        initial={false}
        animate={{
          width: isOpen ? "min(90vw, 380px)" : "280px",
          height: isOpen ? "min(80vh, 500px)" : "48px",
        }}
        transition={{
          type: "tween",
          duration: 0.2,
          ease: "easeOut",
        }}
        className="bg-black text-white rounded-3xl shadow-lg border border-white/10 overflow-hidden flex flex-col"
      >
        {/* Navigation content panel - expands above the trigger */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="docs-mobile-nav-panel"
              id="docs-mobile-nav-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: isOpen ? 0.1 : 0 }}
              className="overflow-y-auto flex-1 p-4 space-y-5"
            >
              {docsSections.map((section, sectionIdx) => (
                <motion.div
                  key={section.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 * sectionIdx }}
                  className="space-y-2"
                >
                  <div className="text-[11px] font-medium uppercase tracking-wider text-white/40 px-2">
                    {section.label}
                  </div>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={handleClose}
                            className={cn(
                              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                              isActive
                                ? "bg-white/10 text-white font-medium"
                                : "text-white/60 hover:text-white hover:bg-white/5",
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full shrink-0 transition-colors",
                                isActive ? "bg-primary" : "bg-white/20",
                              )}
                            />
                            {item.label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom trigger bar - stays at bottom */}
        <button
          type="button"
          onClick={isOpen ? handleClose : handleOpen}
          className={cn(
            "flex items-center justify-between gap-3 px-4 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-inset h-12 w-full",
            isOpen && "border-t border-white/10",
          )}
          aria-label={`Toggle docs navigation, currently on ${currentSectionLabel} – ${currentPageLabel}`}
          aria-expanded={isOpen}
          aria-controls="docs-mobile-nav-panel"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-white min-w-0 overflow-hidden">
            <span className="text-white/50 text-xs shrink-0">
              {currentSectionLabel}
            </span>
            <span className="truncate">{currentPageLabel}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="shrink-0"
          >
            <ChevronExpandIcon className="w-4 h-4 text-white/50" />
          </motion.div>
        </button>
      </motion.div>
    </div>
  )
}

