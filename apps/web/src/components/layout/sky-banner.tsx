import type { ReactNode } from "react";
import { cn } from "@featul/ui/lib/utils";

const dashboardGlassShellClass =
  "overflow-hidden rounded-lg border-2 border-primary bg-primary p-1 backdrop-blur-xl backdrop-saturate-150 sm:p-1.5";

const dashboardGlassInnerClass = "overflow-hidden rounded-lg";

/** Product screenshot frame — frosted glass around the dashboard. */
export function SkyDashboardFrame({
  children,
  className,
  fill = false,
  "data-component": dataComponent,
}: {
  children: ReactNode;
  className?: string;
  fill?: boolean;
  "data-component"?: string;
}) {
  return (
    <div
      className={cn(fill ? "flex h-full w-full flex-col" : "w-full", className)}
      data-component={dataComponent}
    >
      <div
        className={cn(
          dashboardGlassShellClass,
          fill && "flex h-full flex-1 flex-col",
        )}
      >
        <div
          className={cn(
            dashboardGlassInnerClass,
            fill && "flex h-full flex-1 flex-col",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

const dashboardCtaInnerClass =
  "bg-cover bg-center bg-no-repeat p-6 text-left sm:p-8";

/** Bottom CTA card — hero glass chrome with the sky image inside. */
export function SkyCtaFrame({
  children,
  className,
  "data-component": dataComponent,
}: {
  children: ReactNode;
  className?: string;
  "data-component"?: string;
}) {
  return (
    <SkyDashboardFrame className={className} data-component={dataComponent}>
      <div
        className={dashboardCtaInnerClass}
        style={{ backgroundImage: "url(/image/sky.PNG)" }}
      >
        {children}
      </div>
    </SkyDashboardFrame>
  );
}
