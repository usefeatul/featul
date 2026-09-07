import type { ReactNode } from "react";
import { cn } from "@featul/ui/lib/utils";
import {
  overlayDialogClass,
  overlayInnerClass,
} from "@featul/ui/lib/overlay";

export const DASHBOARD_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAGCAYAAAD68A/GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA40lEQVR4nGNgQAJmVta/zOzs/zk4OP5zcnL+5+Li+s/Nzf2fh4fnPy8v739+fv7/AgIC/4WEhP4LCwv/FxER+S8qKvpfTEzsv7i4+H8JCQn/kpKS/6WkpP5LS0v/l5GR+S8rK/tfTk7uv7y8/H8FBYX/ioqK/5WUlP4rKyv/V1FR+a+qqvpfTU3tv7q6+n8NDY3/mpqa/7W0tP5ra2v/19HR+a+rq/tfT0/vv76+/n8DA4P/hoaG/42Mjf4bGxv/BwB2mFqQvpnLTAAAAABJRU5ErkJggg==";

type SkyDashboardBannerProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  "data-component"?: string;
};

/** Rounded sky painting frame with dashboard floated inside. */
export function SkyDashboardBanner({
  children,
  className,
  contentClassName,
  "data-component": dataComponent,
}: SkyDashboardBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl",
        "min-h-[18rem] sm:min-h-[24rem] lg:min-h-[28rem]",
        "shadow-[0_24px_80px_-24px_rgba(0,0,0,0.18)] ring-1 ring-border/50",
        className,
      )}
      data-component={dataComponent}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-[position:center_42%] bg-no-repeat"
        style={{ backgroundImage: "url(/image/sky.PNG)" }}
      />

      <div
        className={cn(
          "relative z-10 flex flex-col items-center justify-center px-4 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Product screenshot frame — same nested overlay as the original hero. */
export function SkyDashboardFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full max-w-4xl", className)}>
      <div className={overlayDialogClass}>
        <div className={overlayInnerClass}>{children}</div>
      </div>
    </div>
  );
}
