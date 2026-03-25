"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

type HorizontalScrollControlsProps = {
  targetId: string;
  className?: string;
  backwardLabel: string;
  forwardLabel: string;
};

export function HorizontalScrollControls({
  targetId,
  className,
  backwardLabel,
  forwardLabel,
}: HorizontalScrollControlsProps) {
  const scrollSlider = (direction: "backward" | "forward") => {
    const slider = document.getElementById(targetId);

    if (!slider) return;

    const amount = Math.max(slider.clientWidth * 0.82, 240);
    slider.scrollBy({
      left: direction === "forward" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => scrollSlider("backward")}
        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:bg-muted"
        aria-label={backwardLabel}
      >
        <ArrowLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollSlider("forward")}
        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:bg-muted"
        aria-label={forwardLabel}
      >
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
