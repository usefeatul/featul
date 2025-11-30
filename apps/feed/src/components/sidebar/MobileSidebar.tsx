"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@feedgot/ui/lib/utils";
import { Drawer } from "@feedgot/ui/components/drawer";
import { useQuery } from "@tanstack/react-query";
import { client } from "@feedgot/api/client";
import {
  buildTopNav,
  buildMiddleNav,
  buildBottomNav,
  getSlugFromPath,
} from "../../config/nav";
import MobileBottomBar from "./MobileBottomBar";
import MobileDrawerContent from "./MobileDrawerContent";

export default function MobileSidebar({
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
  initialWorkspace:
    | {
        id: string;
        name: string;
        slug: string;
        logo?: string | null;
        customDomain?: string | null;
      }
    | undefined;
  initialWorkspaces:
    | { id: string; name: string; slug: string; logo?: string | null }[]
    | undefined;
  initialUser?: { name?: string; email?: string; image?: string | null } | undefined;
}) {
  const pathname = usePathname() || "/";
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
  const secondaryNav = buildBottomNav();
  const { data: statusCounts } = useQuery({
    queryKey: ["status-counts", slug],
    queryFn: async () => {
      if (!slug) return null as Record<string, number> | null;
      const res = await client.workspace.statusCounts.$get({ slug });
      const json = (await res.json()) as { counts?: Record<string, number> };
      return json.counts || null;
    },
    enabled: !!slug,
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialData: initialCounts,
  });

  return (
    <div className={cn("md:hidden", className)}>
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
