"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";

export function WidgetPanel({
  active,
  className,
  children,
}: {
  active: boolean;
  className?: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={false}
      animate={{ opacity: active ? 1 : 0, y: active || reduceMotion ? 0 : 4 }}
      transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
      className={cn(active ? "flex min-h-0 flex-1 flex-col" : "hidden", className)}
      aria-hidden={!active}
    >
      {children}
    </motion.div>
  );
}
