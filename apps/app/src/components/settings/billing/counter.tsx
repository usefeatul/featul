"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

/** Keep the exact price accessible while the visible number counts to it. */
export default function Counter({ value }: { value: number }) {
  const count = useMotionValue(value);
  const rounded = useTransform(count, (latest) =>
    Math.round(latest).toString(),
  );
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      count.set(value);
      return;
    }
    const animation = animate(count, value, {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => animation.stop();
  }, [count, reduceMotion, value]);

  return (
    <span className="inline-block tabular-nums">
      <span className="sr-only">{value}</span>
      <motion.span aria-hidden>{rounded}</motion.span>
    </span>
  );
}
