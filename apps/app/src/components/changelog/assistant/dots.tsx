"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";

// Five dots on a 3×3 matrix, cycling through distinct silhouettes.
const PATTERNS = [
  [0, 2, 4, 6, 8],
  [1, 3, 4, 5, 7],
  [0, 1, 4, 7, 8],
  [2, 3, 4, 5, 6],
  [0, 2, 3, 5, 7],
] as const;

export function Dots({ active = false }: { active?: boolean }) {
  const reducedMotion = useReducedMotion();
  const [pattern, setPattern] = useState(0);
  const animate = active && !reducedMotion;

  useEffect(() => {
    if (!animate) return;

    const timer = window.setInterval(() => {
      const offset = 1 + Math.floor(Math.random() * (PATTERNS.length - 1));
      setPattern((current) => (current + offset) % PATTERNS.length);
    }, 700);

    return () => window.clearInterval(timer);
  }, [animate]);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      className={cn(
        "size-3.5 shrink-0 fill-current",
        active ? "text-foreground/70" : "text-muted-foreground/50",
      )}
    >
      {(PATTERNS[pattern] ?? PATTERNS[0]).map((cell, index) => (
        <motion.circle
          key={index}
          r={1.4}
          initial={false}
          animate={{
            cx: 3 + (cell % 3) * 5,
            cy: 3 + Math.floor(cell / 3) * 5,
          }}
          transition={{
            duration: animate ? 0.3 : 0,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}
