"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import type { NavItem } from "../../types/nav";
import { buildBottomNav, getSlugFromPath } from "../../config/nav";
import {
  useSidebarHotkeys,
  getShortcutForLabel,
} from "@/hooks/useSidebarHotkeys";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import UserDropdown from "@/components/account/UserDropdown";
import Timezone from "./Timezone";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import SettingsNav from "@/components/settings/global/nav";
import { useWorkspaceNav } from "@/hooks/useWorkspaceNav";
import { useCreatePostHotkey } from "@/hooks/useCreatePostHotkey";
import { Button } from "@featul/ui/components/button";
import { PlusIcon } from "@featul/ui/icons/plus";
import { CreatePostModal } from "../post/CreatePostModal";
import type { DeviceAccount, UserIdentity } from "@/components/account/types";

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
  initialDeviceAccounts,
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
        plan?: "free" | "starter" | "professional" | null;
      }
    | undefined;
  initialDomainInfo?:
    | { domain: { status: string; host?: string } | null }
    | undefined;
  initialWorkspaces:
    | {
        id: string;
        name: string;
        slug: string;
        logo?: string | null;
        plan?: "free" | "starter" | "professional" | null;
      }[]
    | undefined;
  initialUser: UserIdentity | undefined;
  initialDeviceAccounts?: DeviceAccount[] | undefined;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const slug = getSlugFromPath(pathname);
  const settingsMatch = pathname.match(/^\/workspaces\/[^/]+\/settings\/([^/?#]+)/);
  const isSettingsPage = Boolean(settingsMatch);
  const selectedSetting = settingsMatch?.[1] || "branding";

  const { primaryNav, middleNav, statusCounts } = useWorkspaceNav(
    slug,
    initialWorkspace || null,
    initialCounts,
    initialDomainInfo || null,
  );
  const [hotkeysActive, setHotkeysActive] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const openCreatePost = React.useCallback(() => setCreatePostOpen(true), []);
  useSidebarHotkeys(hotkeysActive, middleNav, router);
  useCreatePostHotkey({ onOpen: openCreatePost });

  const statusKey = (label: string) => {
    return label.trim().toLowerCase();
  };

  if (isSettingsPage) {
    return (
      <aside
        className={cn(
          "hidden lg:flex w-full lg:w-58 xl:w-60 lg:shrink-0 flex-col",
          "bg-background text-foreground",
          "lg:sticky lg:top-2 lg:h-[calc(100vh-1rem)] lg:overflow-hidden",
          className,
        )}
      >
        <SettingsNav
          slug={slug}
          selected={selectedSetting}
          workspaceName={initialWorkspace?.name}
          logoUrl={initialWorkspace?.logo}
        />
        <div className="px-4 pb-2">
          <UserDropdown
            initialUser={initialUser}
            initialDeviceAccounts={initialDeviceAccounts}
          />
        </div>
      </aside>
    );
  }

  return (
    <aside
      tabIndex={0}
      onMouseEnter={() => setHotkeysActive(true)}
      onMouseLeave={() => setHotkeysActive(false)}
      onFocus={() => setHotkeysActive(true)}
      onBlur={() => setHotkeysActive(false)}
      className={cn(
        "hidden lg:flex w-full lg:w-58 xl:w-60 lg:shrink-0 flex-col",
        "bg-background text-foreground",
        "lg:sticky lg:top-2 lg:h-[calc(100vh-1rem)] lg:overflow-hidden",
        className,
      )}
    >
      <div className="px-4 pb-2 pt-8">
        <WorkspaceSwitcher
          initialWorkspace={initialWorkspace}
          initialWorkspaces={initialWorkspaces}
        />
        <Timezone
          className="mt-2"
          initialTimezone={initialTimezone}
          initialServerNow={initialServerNow}
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
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
      </div>

      <SidebarSection className="pb-2 pt-2">
        <Button
          className="mb-1 grid h-9 w-full grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-2 rounded-md px-2 py-1 text-xs text-accent hover:bg-muted dark:bg-transparent md:text-sm"
          variant="ghost"
          size="md"
          onClick={openCreatePost}
        >
          <PlusIcon className="size-5 justify-self-center text-foreground opacity-60 transition-colors group-hover:text-primary group-hover:opacity-100" />
          <span className="min-w-0 truncate text-left text-accent transition-colors">Create Posts</span>
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
        <UserDropdown
          initialUser={initialUser}
          initialDeviceAccounts={initialDeviceAccounts}
        />
      </SidebarSection>
    </aside>
  );
}
