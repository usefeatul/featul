import { useEffect, useRef, useState } from "react";

function clamp(n: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n));
}

export function useReadingProgress(targetSelector: string = "article") {
  const [percent, setPercent] = useState(0);
  const [visible, setVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector<HTMLElement>(targetSelector);
      if (!el) {
        // Fallback to page scroll
        const doc = document.documentElement;
        const max = Math.max(
          1,
          (doc.scrollHeight || 0) - (window.innerHeight || 0)
        );
        const p = max > 0 ? clamp(window.scrollY / max) : 0;
        setPercent(Math.round(p * 100));
        return;
      }

      const rect = el.getBoundingClientRect();
      const start = rect.top + window.scrollY;
      const height = el.offsetHeight;
      const max = Math.max(1, height - window.innerHeight);
      const raw = (window.scrollY - start) / max;
      const p = clamp(raw);
      setPercent(Math.round(p * 100));
    };

    const scheduleMeasure = () => {
      if (rafId.current != null) return;
      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);

    // Recalculate when the target element's size changes (e.g. images load)
    let ro: ResizeObserver | null = null;
    const el = document.querySelector<HTMLElement>(targetSelector);
    if (el && "ResizeObserver" in window) {
      ro = new ResizeObserver(scheduleMeasure);
      ro.observe(el);
    }

    return () => {
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      if (rafId.current != null) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      if (ro) ro.disconnect();
    };
  }, [targetSelector]);

  useEffect(() => {
    if (percent >= 100) {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setVisible(false), 700);
    } else {
      if (!visible) setVisible(true);
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    }
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [percent, visible]);

  return { percent, visible };
}