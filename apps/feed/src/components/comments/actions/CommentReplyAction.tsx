"use client"

import React from "react"
import { ReplyIcon } from "@feedgot/ui/icons/reply"
import { cn } from "@feedgot/ui/lib/utils"
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
      className={cn(
        "inline-flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer font-medium min-w-[70px]",
        className
      )}
      aria-label={isActive ? "Cancel reply" : "Reply to comment"}
      aria-expanded={isActive}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isActive ? (
           <motion.span
            key="cancel"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex items-center gap-1.5"
          >
            Cancel
          </motion.span>
        ) : (
          <motion.span
            key="reply"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex items-center gap-1.5"
          >
            <ReplyIcon className="h-3.5 w-3.5" />
            Reply
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
