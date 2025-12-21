"use client";

import React from "react";
import Image from "next/image";
import { ScrollArea } from "@oreilla/ui/components/scroll-area";
import { DrawerContent, DrawerTitle } from "@oreilla/ui/components/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { NavItem } from "../../types/nav";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import Timezone from "./Timezone";
import UserDropdown from "@/components/account/UserDropdown";

export default function MobileDrawerContent({
  pathname,
  primaryNav,
  statusCounts,
  secondaryNav,
  initialTimezone,
  initialServerNow,
  initialWorkspace,
  initialWorkspaces,
  initialUser,
}: {
  pathname: string;
  primaryNav: NavItem[];
  statusCounts?: Record<string, number>;
  secondaryNav: NavItem[];
  initialTimezone?: string | null;
  initialServerNow?: number;
  initialWorkspace?: { id: string; name: string; slug: string; logo?: string | null } | undefined;
  initialWorkspaces?: { id: string; name: string; slug: string; logo?: string | null }[] | undefined;
  initialUser?: { name?: string; email?: string; image?: string | null } | undefined;
}) {
  const statusKey = (label: string) => {
    return label.trim().toLowerCase();
  };
  return (
    <DrawerContent>
      <VisuallyHidden>
        <DrawerTitle>Menu</DrawerTitle>
      </VisuallyHidden>
      <ScrollArea className="h-full">
        <div className="p-3">
          <div className="group flex items-center gap-2 rounded-md  px-2 py-2">
            <Image src="/logo.svg" alt="feedback" width={24} height={24} />
            <div className="text-sm font-semibold">feedback</div>
          </div>
          <WorkspaceSwitcher className="mt-3" initialWorkspace={initialWorkspace} initialWorkspaces={initialWorkspaces} />
          <Timezone className="mt-2" initialTimezone={initialTimezone} initialServerNow={initialServerNow} />
        </div>

        <SidebarSection title="REQUEST">
          {primaryNav.map((item) => (
            <SidebarItem key={item.label} item={item} pathname={pathname} count={statusCounts ? statusCounts[statusKey(item.label)] : undefined} mutedIcon={false} />
          ))}
        </SidebarSection>

        <SidebarSection className="pb-8">
          {secondaryNav.map((item) => (
            <SidebarItem key={item.label} item={item} pathname={pathname} mutedIcon />
          ))}
          <UserDropdown initialUser={initialUser} />
        </SidebarSection>
      </ScrollArea>
    </DrawerContent>
  );
}
