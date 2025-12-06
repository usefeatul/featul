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
          key="content"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: { opacity: 1, height: "auto" },
            collapsed: { opacity: 0, height: 0 },
          }}
          transition={
            disableMotion
              ? { duration: 0 }
              : {
                  height: { type: "spring", bounce: 0, duration: 0.3 },
                  opacity: { duration: 0.2 },
                }
          }
          className="overflow-hidden"
        >
          <div className={cn(className)}>{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
