"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@featul/ui/components/button"
import { BoxIcon } from "@featul/ui/icons/box"

export default function EmptyRequests({ workspaceSlug, className = "" }: { workspaceSlug: string; className?: string }) {
  const href = `https://${workspaceSlug}.featul.com`

  return (
    <div className={`flex items-center justify-center min-h-[60vh] md:min-h-[70vh] py-10 px-4 ${className}`}>
      <motion.div
        className="inline-flex flex-col items-center text-center px-6 py-10  max-w-md"
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="relative flex items-center justify-center"
          animate={{ opacity: [0.9, 1, 0.9], scale: [1, 1.03, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center justify-center rounded-full size-20 sm:size-24">
            <BoxIcon className="size-10 sm:size-12" />
          </div>
        </motion.div>

        <h1 className="mt-6 text-xl sm:text-2xl font-semibold tracking-tight max-w-sm">
          Ready to collect feedback!
        </h1>
        <p className="mt-2 text-accent text-sm sm:text-base max-w-xs">
          Your feedback board is live. Share it with users to start collecting ideas.
        </p>

        <div className="mt-6 w-full">
          <Button variant="quiet" asChild className="w-full sm:w-auto px-5">
            <a href={href} target="_blank" rel="noopener noreferrer">
              Open live board
            </a>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
