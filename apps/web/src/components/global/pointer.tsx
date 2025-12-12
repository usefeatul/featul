"use client"

import { cn } from "@oreilla/ui/lib/utils"
import { PointerDownIcon } from "@oreilla/ui/icons/pointer-down"
import { motion } from "framer-motion"

interface PointerProps {
  className?: string
  alt?: string
}

export function Pointer({ className, alt = "Switch features pointer" }: PointerProps) {
  return (
    <motion.div
      className={cn("flex justify-center", className)}
      initial={false}
      animate={{ y: [0, 2, 0], opacity: [0.65, 1, 0.65] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
    >
      <PointerDownIcon aria-label={alt} className="size-12 text-primary" opacity={1} />
    </motion.div>
  )
}

export default Pointer