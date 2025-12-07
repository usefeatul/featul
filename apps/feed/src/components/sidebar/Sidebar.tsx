"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@feedgot/ui/lib/utils";
import type { NavItem } from "../../types/nav";
import { buildBottomNav, getSlugFromPath } from "../../config/nav";
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
import { useWorkspaceNav } from "@/hooks/useWorkspaceNav";
import { Button } from "@feedgot/ui/components/button";
import { PlusIcon } from "@feedgot/ui/icons/plus";
import { CreatePostModal } from "../post/CreatePostModal";

const secondaryNav: NavItem[] = buildBottomNav();
export default function Sidebar({
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
      }
    | undefined;
  initialDomainInfo?: { domain: { status: string; host?: string } | null } | undefined;
  initialWorkspaces:
    | { id: string; name: string; slug: string; logo?: string | null }[]
    | undefined;
  initialUser:
    | { name?: string; email?: string; image?: string | null }
    | undefined;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const slug = getSlugFromPath(pathname);

  const { primaryNav, middleNav, statusCounts } = useWorkspaceNav(
    slug,
    initialCounts,
    initialDomainInfo || null
  );
  const [hotkeysActive, setHotkeysActive] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  useSidebarHotkeys(hotkeysActive, middleNav, router);

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
        "hidden md:flex w-full md:w-60 flex-col bg-background",
        "md:sticky md:top-2 md:h-[calc(100vh-1rem)] md:overflow-hidden",
        className
      )}
    >
      <div className="p-2">
        <div className="group flex items-center gap-2 rounded-md px-1  py-1">
          <Image
            src="/logo.svg"
            alt="feedback"
            width={24}
            height={24}
            className="h-6 w-6"
            priority
          />
          <div className="text-md font-semibold">feedgot</div>
        </div>
        <WorkspaceSwitcher
          className="mt-5.5"
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
            mutedIcon={false}
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
            mutedIcon
          />
        ))}
      </SidebarSection>
      <SidebarSection className="mt-auto pb-8">
        <Button
          className="w-full mb-2 gap-2 font-medium justify-start text-accent hover:bg-muted group"
          variant="plain"
          onClick={() => setCreatePostOpen(true)}
        >
          <PlusIcon className="size-5 text-foreground group-hover:text-primary transition-colors opacity-60 group-hover:opacity-100" />
          <span className="transition-colors">Create Post</span>
        </Button>
        <CreatePostModal
          open={createPostOpen}
          onOpenChange={setCreatePostOpen}
          workspaceSlug={slug}
          user={initialUser}
        />
        {secondaryNav.map((item) => (
          <SidebarItem
            key={item.label}
            item={item}
            pathname={pathname}
            mutedIcon
          />
        ))}
        <UserDropdown initialUser={initialUser} />
      </SidebarSection>
    </aside>
  );
}
