import { useCallback, useRef } from "react";

type Box = { x: number; y: number; width: number; height: number };

/**
 * A highlight that slides between items, like framer-motion's shared `layoutId`, without
 * shipping an animation library. Render the indicator inside whichever item is active
 * and attach the returned ref; each time a new indicator mounts it plays a FLIP from
 * where the previous one was, using the Web Animations API.
 */
export function useSlidingIndicator({
  duration = 260,
  easing = "cubic-bezier(0.22, 1, 0.36, 1)",
}: { duration?: number; easing?: string } = {}) {
  const last = useRef<Box | null>(null);

  return useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Page coordinates, so scrolling between moves does not skew the slide.
      const box = {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      };
      const from = last.current;
      last.current = box;
      if (!from || typeof el.animate !== "function") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const dx = from.x - box.x;
      const dy = from.y - box.y;
      if (!dx && !dy && from.width === box.width && from.height === box.height)
        return;
      el.animate(
        [
          {
            transform: `translate(${dx}px, ${dy}px)`,
            width: `${from.width}px`,
            height: `${from.height}px`,
          },
          {
            transform: "translate(0, 0)",
            width: `${box.width}px`,
            height: `${box.height}px`,
          },
        ],
        { duration, easing },
      );
    },
    [duration, easing],
  );
}
