"use client"

import { useEffect, useState, type PropsWithChildren } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useBackgroundScaled } from "@featul/ui/hooks/use-background-scale"

/** Side gutter revealed on each side of the zoomed-out app, in px. */
const GUTTER_DESKTOP = 10
const GUTTER_MOBILE = 5

function useViewportWidth() {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const update = () => setWidth(window.innerWidth)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  return width
}

/**
 * Zooms the app out while a dialog, alert dialog or sheet is open, so
 * the overlay reads as a layer above it. The scale is derived from the viewport
 * width to leave the same gutter on the left and right at every screen size.
 */
export function ScaledBackground({ children }: PropsWithChildren) {
  const scaled = useBackgroundScaled()
  const reduceMotion = useReducedMotion()
  const width = useViewportWidth()

  const gutter = width < 640 ? GUTTER_MOBILE : GUTTER_DESKTOP
  const scale = scaled && width > 0 ? (width - gutter * 2) / width : 1

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-neutral-200 dark:bg-black"
      />
      <motion.div
        data-background-scaled={scaled ? "true" : undefined}
        className="fixed inset-0 origin-center overflow-hidden"
        initial={false}
        animate={{
          scale,
          borderRadius: scaled ? 14 : 0,
          boxShadow: scaled
            ? "0 0 0 1px rgba(0,0,0,0.06), 0 12px 32px -12px rgba(0,0,0,0.25)"
            : "0 0 0 0px rgba(0,0,0,0), 0 0px 0px 0px rgba(0,0,0,0)",
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 420, damping: 38, mass: 0.9 }
        }
      >
        {children}
      </motion.div>
    </>
  )
}
