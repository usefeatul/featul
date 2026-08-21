"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"
import { XMarkIcon } from "@featul/ui/icons/xmark"
import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { docsSections } from "@/config/docsNav"
import {
  getDocsCurrentPageLabel,
  getDocsCurrentSectionLabel,
} from "../../lib/nav"
import { useIsDocsMobile } from "@/hooks/docs"

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
          overlayDialogClass,
          "flex flex-col overflow-hidden shadow-2xl",
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
              <div className={cn(overlayInnerClass, "mx-2 mt-2")}>
                <div className="h-[min(60vh,360px)] overflow-y-auto overscroll-contain">
                  <div className="py-1">
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
                      <div className="px-4 pt-3 pb-1.5">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          {section.label}
                        </span>
                      </div>

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
                                "mx-2 block rounded-lg px-3 py-2 text-sm transition-all duration-150",
                                isActive
                                  ? "bg-primary/10 font-medium text-foreground"
                                  : "text-muted-foreground hover:bg-primary/5 hover:text-foreground active:bg-primary/10",
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          className={cn(overlayInnerClass, "mx-2 mb-2 shrink-0", isOpen && "mt-2")}
        >
          <button
            type="button"
            onClick={handleToggle}
            className="flex h-11 w-full items-center justify-between gap-3 px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset"
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
                  className="flex w-full items-center justify-between"
                >
                  <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    Navigation
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-accent">Close</span>
                    <XMarkIcon className="text-accent" size={16} />
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
                  <span className="text-xs text-muted-foreground">
                    {currentSectionLabel}
                  </span>
                  <span className="text-border">/</span>
                  <span className="text-sm font-medium text-foreground">
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
