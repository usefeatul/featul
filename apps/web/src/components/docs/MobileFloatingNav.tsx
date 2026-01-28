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
import { useIsDocsMobile } from "@/hooks/use-docs-mobile"

export function DocsMobileFloatingNav() {
  const isMobile = useIsDocsMobile()
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
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-70 transition-all duration-300 ease-out",
        !isOpen && (!isBottomNavVisible || !isMobile)
          ? "translate-y-24 opacity-0"
          : "translate-y-0 opacity-100",
      )}
    >
      {/* Container that morphs between states */}
      <motion.div
        role="group"
        aria-label="Docs navigation"
        layout
        initial={false}
        transition={{
          layout: {
            type: "spring",
            stiffness: 400,
            damping: 30,
          },
        }}
        className={cn(
          "bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col",
          isOpen && "w-[calc(100vw-32px)] max-w-[380px]",
        )}
      >
        {/* Open state content */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="nav-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "min(60vh, 380px)" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                opacity: { duration: 0.15 },
                height: { type: "spring", stiffness: 400, damping: 30 },
              }}
              className="overflow-hidden"
            >
              <div className="h-[min(60vh,380px)] overflow-y-auto overscroll-contain">
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
                                  ? "bg-white/10 text-white font-medium"
                                  : "text-white/50 hover:text-white/80 hover:bg-white/10 active:bg-white/20",
                              )}
                            >
                              {item.label}
                            </Link>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom bar - always visible, changes content based on state */}
        <motion.div
          layout
          className={cn(
            "shrink-0",
            isOpen && "border-t border-white/10",
          )}
        >
          <button
            type="button"
            onClick={handleToggle}
            className="flex items-center justify-between gap-3 px-4 h-11 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-inset"
            aria-label={
              isOpen
                ? "Close navigation"
                : `Toggle docs navigation, currently on ${currentSectionLabel} – ${currentPageLabel}`
            }
            aria-expanded={isOpen}
            aria-controls="docs-mobile-nav-panel"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.div
                  key="close-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="flex items-center justify-between w-full"
                >
                  <span className="text-xs uppercase tracking-[0.15em] text-white/30 font-medium">
                    Navigation
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-white/50 font-medium">Close</span>
                    <XMarkIcon className="text-white/50" size={16} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="trigger-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="text-[11px] text-white/35">
                    {currentSectionLabel}
                  </span>
                  <span className="text-white/20">/</span>
                  <span className="text-[13px] text-white/80 font-medium">
                    {currentPageLabel}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
