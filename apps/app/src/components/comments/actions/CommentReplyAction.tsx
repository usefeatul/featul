"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar"
import { cn } from "@featul/ui/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface CommentReplyButtonProps {
  onClick: () => void
  isActive?: boolean
  className?: string
}

export default function CommentReplyButton({ onClick, isActive, className }: CommentReplyButtonProps) {
  return (
    <Toolbar size="sm" className="w-fit">
      <Button
        onClick={onClick}
        type="button"
        variant="plain"
        size="xs"
        className={cn(
          toolbarItemClass,
          "min-w-[72px] px-3",
          isActive
            ? "text-destructive dark:text-destructive hover:text-destructive dark:hover:text-destructive"
            : "text-accent hover:text-foreground",
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
    </Button>
    </Toolbar>
  )
}
