"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@feedgot/ui/lib/utils";
import { Drawer } from "@feedgot/ui/components/drawer";
import {
  buildTopNav,
  buildMiddleNav,
  buildBottomNav,
  getSlugFromPath,
} from "../../config/nav";
import MobileBottomBar from "./MobileBottomBar";
import MobileDrawerContent from "./MobileDrawerContent";

export default function MobileSidebar({ className = "", initialCounts, initialTimezone, initialServerNow, initialWorkspace }: { className?: string; initialCounts?: Record<string, number>; initialTimezone?: string | null; initialServerNow?: number; initialWorkspace?: { id: string; name: string; slug: string; logo?: string | null } | undefined }) {
  const pathname = usePathname() || "/";
  const slug = getSlugFromPath(pathname);
  const primaryNav = buildTopNav(slug);
  const middleNav = buildMiddleNav(slug);
  const secondaryNav = buildBottomNav();

  return (
    <div className={cn("md:hidden", className)}>
      <Drawer direction="right">
        <MobileBottomBar items={middleNav} />
        <MobileDrawerContent
          pathname={pathname}
          primaryNav={primaryNav}
          statusCounts={initialCounts}
          initialTimezone={initialTimezone}
          initialServerNow={initialServerNow}
          secondaryNav={secondaryNav}
          initialWorkspace={initialWorkspace as any}
        />
      </Drawer>
    </div>
  );
}
