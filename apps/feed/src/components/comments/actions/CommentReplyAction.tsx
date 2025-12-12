"use client"

import React from "react"
import { cn } from "@oreilla/ui/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface CommentReplyButtonProps {
  onClick: () => void
  isActive?: boolean
  className?: string
}

export default function CommentReplyButton({ onClick, isActive, className }: CommentReplyButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 text-xs py-2 px-2 transition-colors cursor-pointer font-medium min-w-[70px]",
        className
      )}
      aria-label={isActive ? "Cancel reply" : "Reply to comment"}
      aria-expanded={isActive}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isActive ? (
           <motion.span
            key="cancel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="flex items-center gap-1.5"
          >
            Cancel
          </motion.span>
        ) : (
          <motion.span
            key="reply"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="flex items-center gap-1.5"
          >
            Reply
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
