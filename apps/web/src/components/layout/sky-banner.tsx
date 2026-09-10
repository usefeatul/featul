"use client";

import type { ReactNode } from "react";
import { cn } from "@featul/ui/lib/utils";
import { HeroSkyDither } from "@/components/layout/sky-dither";

const dashboardFrameClass =
  "overflow-hidden rounded-t-xl border border-b-0 border-black/10 bg-white shadow-[0_24px_64px_-28px_rgba(15,23,42,0.28)]";

export const DASHBOARD_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAGCAYAAAD68A/GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA40lEQVR4nGNgQAJmVta/zOzs/zk4OP5zcnL+5+Li+s/Nzf2fh4fnPy8v739+fv7/AgIC/4WEhP4LCwv/FxER+S8qKvpfTEzsv7i4+H8JCQn/kpKS/6WkpP5LS0v/l5GR+S8rK/tfTk7uv7y8/H8FBYX/ioqK/5WUlP4rKyv/V1FR+a+qqvpfTU3tv7q6+n8NDY3/mpqa/7W0tP5ra2v/19HR+a+rq/tfT0/vv76+/n8DA4P/hoaG/42Mjf4bGxv/BwB2mFqQvpnLTAAAAABJRU5ErkJggg==";

type SkyDashboardBannerProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  "data-component"?: string;
};

/** Full-width dither field with the dashboard floated on top. */
export function SkyDashboardBanner({
  children,
  className,
  contentClassName,
  "data-component": dataComponent,
}: SkyDashboardBannerProps) {
  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      data-component={dataComponent}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[18%] sm:top-[22%]"
      >
        <HeroSkyDither />
      </div>

      <div
        className={cn(
          "relative z-10 flex flex-col items-center justify-end pt-2",
          contentClassName,
        )}
      >
        {children}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-border"
      />
    </div>
  );
}

/** Product screenshot framed into the dither field, clipped at the bottom border. */
export function SkyDashboardFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className={dashboardFrameClass}>
        <div className="max-h-[min(58vh,36rem)] overflow-hidden sm:max-h-[min(64vh,42rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}
