"use client";

import type { ReactNode } from "react";
import { cn } from "@featul/ui/lib/utils";
import { HeroSkyDither } from "@/components/layout/sky-dither";
import { APP_URL } from "@/config/auth";

const dashboardWindowClass =
  "overflow-hidden rounded-t-xl border border-b-0 border-black/10 bg-white shadow-[0_24px_64px_-28px_rgba(15,23,42,0.28)]";

function dashboardHost() {
  try {
    return new URL(APP_URL).host;
  } catch {
    return "app.featul.com";
  }
}

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

/** Product screenshot inside a browser window, clipped into the dither field. */
export function SkyDashboardFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const host = dashboardHost();

  return (
    <div className={cn("w-full max-w-[86rem]", className)}>
      <div className={dashboardWindowClass}>
        <div className="flex h-11 shrink-0 items-center gap-3 border-b border-black/[0.06] bg-[#f7f7f5] px-3 sm:px-4">
          <span className="flex shrink-0 items-center gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="mx-auto min-w-0 max-w-sm truncate rounded-md bg-black/[0.05] px-3 py-1 text-center text-[11px] leading-none text-accent">
            {host}
          </span>
          <span className="hidden w-[52px] sm:block" aria-hidden />
        </div>
        <div className="max-h-[min(58vh,36rem)] overflow-hidden sm:max-h-[min(64vh,42rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}
