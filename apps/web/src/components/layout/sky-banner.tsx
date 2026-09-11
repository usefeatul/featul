import type { ReactNode } from "react";
import { cn } from "@featul/ui/lib/utils";

const dashboardGlassShellClass =
  "overflow-hidden rounded-lg border border-border bg-primary p-1 backdrop-blur-xl backdrop-saturate-150 sm:p-1.5";

const dashboardGlassInnerClass = "overflow-hidden rounded-lg";

export const DASHBOARD_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAGCAYAAAD68A/GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA40lEQVR4nGNgQAJmVta/zOzs/zk4OP5zcnL+5+Li+s/Nzf2fh4fnPy8v739+fv7/AgIC/4WEhP4LCwv/FxER+S8qKvpfTEzsv7i4+H8JCQn/kpKS/6WkpP5LS0v/l5GR+S8rK/tfTk7uv7y8/H8FBYX/ioqK/5WUlP4rKyv/V1FR+a+qqvpfTU3tv7q6+n8NDY3/mpqa/7W0tP5ra2v/19HR+a+rq/tfT0/vv76+/n8DA4P/hoaG/42Mjf4bGxv/BwB2mFqQvpnLTAAAAABJRU5ErkJggg==";

/** Product screenshot frame — frosted glass around the dashboard. */
export function SkyDashboardFrame({
  children,
  className,
  "data-component": dataComponent,
}: {
  children: ReactNode;
  className?: string;
  "data-component"?: string;
}) {
  return (
    <div className={cn("w-full", className)} data-component={dataComponent}>
      <div className={dashboardGlassShellClass}>
        <div className={dashboardGlassInnerClass}>{children}</div>
      </div>
    </div>
  );
}
