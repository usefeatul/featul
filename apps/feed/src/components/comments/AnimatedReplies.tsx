"use client"

import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@feedgot/ui/lib/utils"

export default function AnimatedReplies({
  isOpen,
  children,
  className,
  disableMotion,
}: {
  isOpen: boolean
  children: React.ReactNode
  className?: string
  disableMotion?: boolean
}) {
  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          className={cn(className)}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: disableMotion ? 0 : 0.28 }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

