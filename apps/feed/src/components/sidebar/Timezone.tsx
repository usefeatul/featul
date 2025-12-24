"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@oreilla/ui/lib/utils";
import { client } from "@oreilla/api/client";
import { getSlugFromPath } from "../../config/nav";
import { formatTime12h } from "@/lib/time";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@oreilla/ui/components/tooltip";

export default function Timezone({ className = "", initialTimezone, initialServerNow }: { className?: string; initialTimezone?: string | null; initialServerNow?: number }) {
  const pathname = usePathname();
  const slug = getSlugFromPath(pathname || "");
  const [tz, setTz] = React.useState<string | null>(initialTimezone || null);
  const driftRef = React.useRef<number>(initialServerNow ? initialServerNow - Date.now() : 0);
  const [time, setTime] = React.useState<string | null>(() => (initialTimezone ? formatTime12h(initialTimezone, new Date(Date.now() + driftRef.current)) : null));

  React.useEffect(() => {
    let active = true;
    if (!slug) {
      setTz(null);
      return;
    }
    (async () => {
      try {
        const res = await client.workspace.bySlug.$get({ slug });
        const data = await res.json();
        const timezone = data?.workspace?.timezone || null;
        if (active) setTz(timezone);
      } catch {
        if (active) setTz(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  React.useEffect(() => {
    if (!tz) return;
    const format = () => setTime(formatTime12h(tz, new Date(Date.now() + driftRef.current)));
    format();
    const id = setInterval(format, 1000);
    return () => clearInterval(id);
  }, [tz]);

  if (!tz || !time) return null;

  return (
    <div className={cn("px-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-accent">TIME</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="rounded-sm bg-muted px-1 py-0.5 text-xs font-medium text-foreground">{time}</span>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6} align="end">
              <span className="font-bold">Current workspace time</span> in the workspace's timezone. All dates, ranges, and graphs you see are matched to this timezone.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
