"use client";

import { useEffect, useRef, useState } from "react";

export function Scrollbar() {
  const [enabled, setEnabled] = useState(false);
  const [metrics, setMetrics] = useState({ top: 0, height: 44, progress: 0 });
  const drag = useRef<{ y: number; scroll: number; ratio: number } | null>(
    null,
  );

  useEffect(() => {
    const media = matchMedia(
      "(hover: hover) and (pointer: fine) and (forced-colors: none)",
    );
    const sync = () => {
      setEnabled(media.matches);
      document.documentElement.toggleAttribute(
        "data-home-scrollbar",
        media.matches,
      );
    };
    sync();
    media.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      document.documentElement.removeAttribute("data-home-scrollbar");
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = innerHeight;
      const full = document.documentElement.scrollHeight;
      const maximum = Math.max(0, full - viewport);
      const height = Math.min(
        viewport,
        Math.max(44, (viewport * viewport) / full),
      );
      const progress = maximum
        ? Math.min(1, Math.max(0, scrollY / maximum))
        : 0;
      setMetrics({ height, top: progress * (viewport - height), progress });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      role="scrollbar"
      aria-label="Scroll page"
      aria-controls="home-content"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(metrics.progress * 100)}
      tabIndex={0}
      className="group fixed right-0 top-0 z-[60] w-3 touch-none select-none cursor-grab outline-none active:cursor-grabbing"
      style={{
        height: metrics.height,
        transform: `translateY(${metrics.top}px)`,
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          y: event.clientY,
          scroll: scrollY,
          ratio:
            (document.documentElement.scrollHeight - innerHeight) /
            Math.max(1, innerHeight - metrics.height),
        };
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        window.scrollTo({
          top:
            drag.current.scroll +
            (event.clientY - drag.current.y) * drag.current.ratio,
          behavior: "instant",
        });
      }}
      onLostPointerCapture={() => {
        drag.current = null;
      }}
      onPointerUp={(event) => {
        drag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onKeyDown={(event) => {
        const maximum = document.documentElement.scrollHeight - innerHeight;
        const positions: Record<string, number> = {
          ArrowDown: scrollY + 40,
          ArrowUp: scrollY - 40,
          PageDown: scrollY + innerHeight * 0.9,
          PageUp: scrollY - innerHeight * 0.9,
          Home: 0,
          End: maximum,
        };
        const top = positions[event.key];
        if (top === undefined) return;
        event.preventDefault();
        window.scrollTo({ top, behavior: "instant" });
      }}
    >
      <span className="absolute inset-y-0 right-0.5 w-1 rounded-full bg-primary/55 transition-colors group-hover:bg-primary group-focus-visible:bg-primary group-focus-visible:ring-2 group-focus-visible:ring-primary/25 motion-reduce:transition-none" />
    </div>
  );
}
