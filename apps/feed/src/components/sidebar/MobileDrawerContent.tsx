"use client";

import React from "react";
import { ScrollArea } from "@feedgot/ui/components/scroll-area";
import { DrawerContent, DrawerTitle } from "@feedgot/ui/components/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { NavItem } from "../../types/nav";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import Timezone from "./Timezone";
import SignOutButton from "@/components/auth/SignOutButton";

export default function MobileDrawerContent({
  pathname,
  primaryNav,
  statusCounts,
  secondaryNav,
  initialTimezone,
}: {
  pathname: string;
  primaryNav: NavItem[];
  statusCounts?: Record<string, number>;
  secondaryNav: NavItem[];
  initialTimezone?: string;
}) {
  const statusKey = (label: string) => {
    const t = label.trim().toLowerCase();
    if (t === "progress") return "in-progress";
    if (t === "review") return "under-review";
    if (t === "complete") return "completed";
    return t;
  };
  return (
    <DrawerContent>
      <VisuallyHidden>
        <DrawerTitle>Menu</DrawerTitle>
      </VisuallyHidden>
      <ScrollArea className="h-full">
        <div className="p-3">
          <div className="group flex items-center gap-2 rounded-md px-2 py-2">
            <img src="/logo.svg" alt="feedback" className="h-6 w-6" />
            <div className="text-sm font-semibold">feedback</div>
          </div>
          <WorkspaceSwitcher className="mt-3" />
          <Timezone className="mt-2" initialTimezone={initialTimezone} />
        </div>

        <SidebarSection title="REQUEST">
          {primaryNav.map((item) => (
            <SidebarItem key={item.label} item={item} pathname={pathname} count={statusCounts ? statusCounts[statusKey(item.label)] : undefined} />
          ))}
        </SidebarSection>

        <SidebarSection className="pb-8">
          {secondaryNav.map((item) => (
            <SidebarItem key={item.label} item={item} pathname={pathname} />
          ))}
          <SignOutButton />
        </SidebarSection>
      </ScrollArea>
    </DrawerContent>
  );
}
