"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@feedgot/ui/lib/utils";
import type { NavItem } from "../../types/nav";
import {
  buildTopNav,
  buildMiddleNav,
  buildBottomNav,
  getSlugFromPath,
} from "../../config/nav";
import { useSidebarHotkeys, getShortcutForLabel } from "../../utils/useSidebarHotkeys";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import SignOutButton from "@/components/auth/SignOutButton";
import Timezone from "./Timezone";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
const secondaryNav: NavItem[] = buildBottomNav();

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const slug = getSlugFromPath(pathname);

  const primaryNav = buildTopNav(slug);
  const middleNav = buildMiddleNav(slug);
  const [hotkeysActive, setHotkeysActive] = useState(false);
  useSidebarHotkeys(hotkeysActive, middleNav, router);

  return (
    <aside
      tabIndex={0}
      onMouseEnter={() => setHotkeysActive(true)}
      onMouseLeave={() => setHotkeysActive(false)}
      onFocus={() => setHotkeysActive(true)}
      onBlur={() => setHotkeysActive(false)}
      className={cn(
        "mt-4 hidden md:flex md:h-screen w-full md:w-60 flex-col bg-background",
        "md:sticky md:top-4",
        className
      )}
    >
      <div className="p-3">
        <div className="group flex items-center gap-2 rounded-md px-2 py-2">
          <img src="/logo.svg" alt="feedback" className="h-6 w-6" />
          <div className="text-sm font-semibold">feedgot</div>
        </div>
        <WorkspaceSwitcher className="mt-3" />
        <Timezone className="mt-2" />
      </div>
      <SidebarSection title="REQUEST">
        {primaryNav.map((item) => (
          <SidebarItem key={item.label} item={item} pathname={pathname} />
        ))}
      </SidebarSection>

      <SidebarSection title="WORKSPACE" className="mt-4">
        {middleNav.map((item) => (
          <SidebarItem key={item.label} item={item} pathname={pathname} shortcut={getShortcutForLabel(item.label)} />
        ))}
      </SidebarSection>

      <SidebarSection className="mt-auto pb-8">
        {secondaryNav.map((item) => (
          <SidebarItem key={item.label} item={item} pathname={pathname} />
        ))}
        <SignOutButton />
      </SidebarSection>
    </aside>
  );
}
