"use client";

/**
 * Adapted from Motion Primitives Text Shimmer.
 * MIT License, Copyright (c) 2024 ibelick.
 * https://github.com/ibelick/motion-primitives
 */
import { useMemo, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";

export function Shimmer({
  children,
  className,
  duration = 1.8,
  spread = 2,
}: {
  children: string;
  className?: string;
  duration?: number;
  spread?: number;
}) {
  const reducedMotion = useReducedMotion();
  const dynamicSpread = useMemo(
    () => children.length * spread,
    [children, spread],
  );

  if (reducedMotion) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      className={cn(
        "relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent",
        "[background-repeat:no-repeat,padding-box]",
        "[--base-color:#a1a1aa] [--base-gradient-color:#52525b]",
        "dark:[--base-color:#71717a] dark:[--base-gradient-color:#a1a1aa]",
        "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]",
        className,
      )}
      initial={{ backgroundPosition: "100% center" }}
      animate={{ backgroundPosition: "0% center" }}
      transition={{ repeat: Infinity, duration, ease: "linear" }}
      style={
        {
          "--spread": `${dynamicSpread}px`,
          backgroundImage:
            "var(--bg), linear-gradient(var(--base-color), var(--base-color))",
        } as CSSProperties
      }
    >
      {children}
    </motion.span>
  );
}
