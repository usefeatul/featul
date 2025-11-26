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
import { useQuery } from "@tanstack/react-query";
const secondaryNav: NavItem[] = buildBottomNav();

export default function Sidebar({ className = "", initialCounts, initialTimezone, initialServerNow, initialWorkspace }: { className?: string; initialCounts?: Record<string, number>; initialTimezone?: string | null; initialServerNow?: number; initialWorkspace?: { id: string; name: string; slug: string; logo?: string | null } | undefined }) {
  const pathname = usePathname();
  const router = useRouter();
  const slug = getSlugFromPath(pathname);

  const primaryNav = buildTopNav(slug);
  const middleNav = buildMiddleNav(slug);
  const [hotkeysActive, setHotkeysActive] = useState(false);
  useSidebarHotkeys(hotkeysActive, middleNav, router);

  const { data: statusCounts } = useQuery({
    queryKey: ["status-counts", slug],
    queryFn: async () => {
      if (!slug) return null as any;
      const res = await fetch(`/api/status-counts?slug=${encodeURIComponent(slug)}`);
      const json = (await res.json()) as { counts?: Record<string, number> };
      return json.counts || null;
    },
    enabled: !!slug,
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialData: initialCounts,
    placeholderData: (prev) => prev ?? initialCounts ?? null,
  });

  const statusKey = (label: string) => {
    return label.trim().toLowerCase();
  };

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
        <WorkspaceSwitcher className="mt-3" initialWorkspace={initialWorkspace as any} />
        <Timezone className="mt-2" initialTimezone={initialTimezone} initialServerNow={initialServerNow} />
      </div>
      <SidebarSection title="REQUEST">
        {primaryNav.map((item) => (
          <SidebarItem key={item.label} item={item} pathname={pathname} count={statusCounts ? statusCounts[statusKey(item.label)] : undefined} />
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
