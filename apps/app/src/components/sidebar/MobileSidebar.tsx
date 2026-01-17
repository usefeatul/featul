"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import { Drawer } from "@featul/ui/components/drawer";
import { useWorkspaceNav } from "@/hooks/useWorkspaceNav";
import { buildBottomNav, getSlugFromPath } from "../../config/nav";
import MobileBottomBar from "./MobileBottomBar";
import MobileDrawerContent from "./MobileDrawerContent";

export default function MobileSidebar({
  className = "",
  initialCounts,
  initialTimezone,
  initialServerNow,
  initialWorkspace,
  initialDomainInfo,
  initialWorkspaces,
  initialUser,
}: {
  className?: string;
  initialCounts?: Record<string, number>;
  initialTimezone?: string | null;
  initialServerNow?: number;
  initialWorkspace:
  | {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    customDomain?: string | null;
    plan?: "free" | "starter" | "professional" | null;
  }
  | undefined;
  initialDomainInfo?: { domain: { status: string; host?: string } | null } | undefined;
  initialWorkspaces:
  | {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    plan?: "free" | "starter" | "professional" | null;
  }[]
  | undefined;
  initialUser?: { name?: string; email?: string; image?: string | null } | undefined;
}) {
  const pathname = usePathname() || "/";
  const slug = getSlugFromPath(pathname);
  const { primaryNav, middleNav, statusCounts } = useWorkspaceNav(slug, initialCounts, initialDomainInfo || null);
  const secondaryNav = buildBottomNav();

  return (
    <div className={cn("lg:hidden", className)}>
      <Drawer direction="right">
        <MobileBottomBar items={middleNav} />
        <MobileDrawerContent
          pathname={pathname}
          primaryNav={primaryNav}
          statusCounts={statusCounts ?? undefined}
          initialTimezone={initialTimezone}
          initialServerNow={initialServerNow}
          secondaryNav={secondaryNav}
          initialWorkspace={initialWorkspace}
          initialWorkspaces={initialWorkspaces}
          initialUser={initialUser}
        />
      </Drawer>
    </div>
  );
}
