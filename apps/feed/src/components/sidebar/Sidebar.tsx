"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@feedgot/ui/lib/utils";
import type { NavItem } from "../../types/nav";
import {
  buildTopNav,
  buildMiddleNav,
  buildBottomNav,
  getSlugFromPath,
} from "../../config/nav";
import {
  useSidebarHotkeys,
  getShortcutForLabel,
} from "../../utils/useSidebarHotkeys";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import UserDropdown from "@/components/account/UserDropdown";
import Image from "next/image";
import Timezone from "./Timezone";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import { useQuery } from "@tanstack/react-query";
import { client } from "@feedgot/api/client";
const secondaryNav: NavItem[] = buildBottomNav();

export default function Sidebar({
  className = "",
  initialCounts,
  initialTimezone,
  initialServerNow,
  initialWorkspace,
  initialWorkspaces,
  initialUser,
}: {
  className?: string;
  initialCounts?: Record<string, number>;
  initialTimezone?: string | null;
  initialServerNow?: number;
  initialWorkspace?:
    | {
        id: string;
        name: string;
        slug: string;
        logo?: string | null;
      }
    | undefined;
  initialWorkspaces?:
    | { id: string; name: string; slug: string; logo?: string | null }[]
    | undefined;
  initialUser?: { name?: string; email?: string; image?: string | null } | undefined;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const slug = getSlugFromPath(pathname);

  const primaryNav = React.useMemo(() => buildTopNav(slug), [slug]);
  const { data: wsInfo } = useQuery<{
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    domain?: string | null;
    customDomain?: string | null;
  } | null>({
    queryKey: ["workspace", slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await client.workspace.bySlug.$get({ slug });
      const data = (await res.json()) as {
        workspace: {
          id: string;
          name: string;
          slug: string;
          logo?: string | null;
          domain?: string | null;
          customDomain?: string | null;
        } | null;
      };
      return data.workspace;
    },
    enabled: !!slug,
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnMount: false,
    initialData: null,
  });
  const customDomain = wsInfo?.customDomain ?? null;
  const middleNav = React.useMemo(
    () => buildMiddleNav(slug, customDomain),
    [slug, customDomain]
  );
  const [hotkeysActive, setHotkeysActive] = useState(false);
  useSidebarHotkeys(hotkeysActive, middleNav, router);

  const { data: statusCounts } = useQuery<Record<string, number> | null>({
    queryKey: ["status-counts", slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await client.workspace.statusCounts.$get({ slug });
      const data = (await res.json()) as { counts?: Record<string, number> };
      return data?.counts || null;
    },
    enabled: !!slug,
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialData: initialCounts,
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
        "mt-1 hidden md:flex md:h-screen w-full md:w-60 flex-col bg-background",
        "md:sticky md:top-4",
        className
      )}
    >
      <div className="p-2">
        <div className="group flex items-center gap-2 rounded-md px-2 py-2">
          <Image src="/logo.svg" alt="feedback" width={24} height={24} className="h-6 w-6" priority />
          <div className="text-md font-semibold">feedgot</div>
        </div>
        <WorkspaceSwitcher
          className="mt-3"
          initialWorkspace={initialWorkspace}
          initialWorkspaces={initialWorkspaces}
        />
        <Timezone
          className="mt-2"
          initialTimezone={initialTimezone}
          initialServerNow={initialServerNow}
        />
      </div>
      <SidebarSection title="REQUEST">
        {primaryNav.map((item) => (
          <SidebarItem
            key={item.label}
            item={item}
            pathname={pathname}
            count={
              statusCounts ? statusCounts[statusKey(item.label)] : undefined
            }
          />
        ))}
      </SidebarSection>

      <SidebarSection title="WORKSPACE" className="mt-4">
        {middleNav.map((item) => (
          <SidebarItem
            key={item.label}
            item={item}
            pathname={pathname}
            shortcut={getShortcutForLabel(item.label)}
          />
        ))}
      </SidebarSection>

      <SidebarSection className="mt-auto pb-8">
        {secondaryNav.map((item) => (
          <SidebarItem key={item.label} item={item} pathname={pathname} />
        ))}
        <UserDropdown initialUser={initialUser}
        />
      </SidebarSection>
    </aside>
  );
}
