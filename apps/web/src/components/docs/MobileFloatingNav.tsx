"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@featul/ui/lib/utils"
import { XMarkIcon } from "@featul/ui/icons/xmark"
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

  function handleToggle(): void {
    setIsOpen((prev) => !prev)
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
      {/* Unified floating container */}
      <motion.div
        role="group"
        aria-label="Docs navigation"
        initial={false}
        animate={{
          width: isOpen ? "min(90vw, 340px)" : "auto",
          height: isOpen ? "min(70vh, 440px)" : 44,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 32,
          mass: 0.8,
        }}
        className="bg-[#0a0a0a] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="open-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col h-full"
            >
              {/* Navigation content */}
              <div
                id="docs-mobile-nav-panel"
                className="flex-1 overflow-y-auto overscroll-contain"
              >
                <div className="py-2">
                  {docsSections.map((section, sectionIdx) => (
                    <motion.div
                      key={section.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                        delay: sectionIdx * 0.04,
                      }}
                    >
                      {/* Section label */}
                      <div className="px-4 pt-3 pb-1.5">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/25 font-semibold">
                          {section.label}
                        </span>
                      </div>

                      {/* Items */}
                      {section.items.map((item, itemIdx) => {
                        const isActive = pathname === item.href
                        return (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                              delay: sectionIdx * 0.04 + itemIdx * 0.02,
                            }}
                          >
                            <Link
                              href={item.href}
                              onClick={handleClose}
                              className={cn(
                                "block mx-2 px-3 py-2 rounded-lg text-[13px] transition-all duration-150",
                                isActive
                                  ? "bg-white/[0.08] text-white font-medium"
                                  : "text-white/50 hover:text-white/80 hover:bg-white/[0.04] active:bg-white/[0.06]",
                              )}
                            >
                              <span className="truncate">{item.label}</span>
                            </Link>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer with title and close - at bottom */}
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center justify-between gap-3 px-4 h-12 shrink-0 border-t border-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-inset w-full"
                aria-label="Close navigation"
              >
                <span className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-medium">
                  Navigation
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-white/50 font-medium">Close</span>
                  <XMarkIcon className="text-white/50" size={16} />
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="closed-trigger"
              type="button"
              onClick={handleToggle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 min-w-0 overflow-hidden h-11 px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-inset"
              aria-label={`Toggle docs navigation, currently on ${currentSectionLabel} – ${currentPageLabel}`}
              aria-expanded={isOpen}
              aria-controls="docs-mobile-nav-panel"
            >
              <span className="text-[11px] text-white/35 shrink-0">
                {currentSectionLabel}
              </span>
              <span className="text-white/20">/</span>
              <span className="text-[13px] text-white/80 font-medium truncate">
                {currentPageLabel}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
