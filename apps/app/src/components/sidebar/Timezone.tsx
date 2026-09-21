"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import { ClockIcon } from "@featul/ui/icons/clock";
import { getSlugFromPath } from "../../config/nav";
import { formatTime12h } from "@/lib/time";
import { friendlyTimezoneCity } from "@/lib/timezone";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@featul/ui/components/tooltip";
import { useWorkspaceTimezone } from "@/hooks/useWorkspaceTimezone";
import { sidebarLeadSlotClassName, sidebarRowClassName } from "./styles";

interface TimezoneProps {
  className?: string;
  initialTimezone?: string | null;
  initialServerNow?: number;
  collapsed?: boolean;
}

export default function Timezone({
  className = "",
  initialTimezone,
  initialServerNow,
  collapsed = false,
}: TimezoneProps) {
  const pathname = usePathname();
  const slug = getSlugFromPath(pathname || "");

  const drift = React.useMemo(
    () => (initialServerNow ? initialServerNow - Date.now() : 0),
    [initialServerNow]
  );

  const { timezone } = useWorkspaceTimezone(slug || "", initialTimezone || undefined);

  const [time, setTime] = React.useState<string>(() =>
    timezone ? formatTime12h(timezone, new Date(Date.now() + drift)) : ""
  );

  React.useEffect(() => {
    if (!timezone) return;

    const updateTime = () => {
      setTime(formatTime12h(timezone, new Date(Date.now() + drift)));
    };

    updateTime();

    let intervalId: number | undefined;
    const now = Date.now() + drift;
    const timeoutId = window.setTimeout(() => {
      updateTime();
      intervalId = window.setInterval(updateTime, 60_000);
    }, 60_000 - (now % 60_000));

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [timezone, drift]);

  if (!timezone || !time) return null;

  const city = friendlyTimezoneCity(timezone);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            tabIndex={0}
            aria-label={`${city} workspace time, ${time}`}
            className={cn(
              sidebarRowClassName,
              "cursor-default text-muted-foreground outline-none transition-colors hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-ring/50",
              collapsed &&
                "mx-auto size-9 w-9 flex-none justify-center gap-0 px-0 py-0",
              className,
            )}
          >
            <span className={sidebarLeadSlotClassName}>
              <ClockIcon
                className="size-5 text-neutral-400 transition-colors duration-200 group-hover:text-primary dark:text-neutral-300 dark:group-hover:text-primary"
              />
            </span>
            {!collapsed ? (
              <>
                <span className="min-w-0 flex-1 truncate text-foreground/75">
                  {city} time
                </span>
                <time className="shrink-0 text-xs font-medium tabular-nums text-foreground/80">
                  {time}
                </time>
              </>
            ) : null}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="text-xs">
          <span className="font-semibold">Workspace timezone:</span> {timezone}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
