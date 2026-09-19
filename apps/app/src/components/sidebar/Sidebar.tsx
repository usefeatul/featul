"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import type { NavItem } from "../../types/nav";
import { buildBottomNav, getSlugFromPath, isWorkspaceAccountPath, isWorkspaceSettingsPath, workspaceBase } from "../../config/nav";
import { ArrowBackIcon } from "@featul/ui/icons/arrow-back";
import SettingsNav from "@/components/settings/global/SettingsNav";
import AccountNav from "@/components/account/AccountNav";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import SearchAction from "@/components/requests/actions/SearchAction";
import RoadmapSearchAction from "@/components/roadmap/actions/RoadmapSearchAction";
import { sidebarSearchClassName } from "./styles";
import UserDropdown from "@/components/account/UserDropdown";
import WorkspaceNotificationsAction from "@/components/global/WorkspaceNotificationsAction";
import Timezone from "./Timezone";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import { useWorkspaceNav } from "@/hooks/useWorkspaceNav";
import { useCreatePostHotkey } from "@/hooks/useCreatePostHotkey";
import { PlusIcon } from "@featul/ui/icons/plus";
import { LayoutGroup } from "framer-motion";
import { CreatePostModal } from "../post/CreatePostModal";
import type { DeviceAccount, UserIdentity } from "@/components/account/types";
import { sidebarLeadSlotClassName, sidebarRowClassName } from "./styles";

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
  const slug = getSlugFromPath(pathname);
  const isSettings = isWorkspaceSettingsPath(pathname);
  const isAccount = isWorkspaceAccountPath(pathname);

  const { primaryNav, middleNav, statusCounts } = useWorkspaceNav(
    slug,
    initialWorkspace || null,
    initialCounts,
    initialDomainInfo || null,
  );
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const openCreatePost = React.useCallback(() => setCreatePostOpen(true), []);
  useCreatePostHotkey({ onOpen: openCreatePost });
  const boardItem = middleNav.find((item) => item.label === "My Board");
  const workspaceNav = middleNav.filter((item) => item.label !== "My Board");

  const statusKey = (label: string) => {
    return label.trim().toLowerCase();
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex w-full lg:w-72 lg:shrink-0 flex-col border-r border-border/30 bg-muted/40 dark:bg-[#202020]",
        "lg:sticky lg:top-0 lg:h-dvh lg:overflow-hidden",
        className,
      )}
    >
      <div className="px-2 py-2">
        <WorkspaceSwitcher
          initialWorkspace={initialWorkspace}
          initialWorkspaces={initialWorkspaces}
        />
          {pathname.split("/")[3] === "roadmap" ? (
            <RoadmapSearchAction className={sidebarSearchClassName} />
          ) : (
            <SearchAction className={sidebarSearchClassName} />
          )}
        <div className="mt-4 px-1">
          <button
            type="button"
            className={cn(
              sidebarRowClassName,
              "text-foreground hover:bg-muted dark:hover:bg-white/5",
            )}
            onClick={openCreatePost}
          >
            <span className={sidebarLeadSlotClassName}>
              <PlusIcon className="size-5 text-foreground opacity-60 group-hover:text-primary group-hover:opacity-100 transition-colors" />
            </span>
            <span className="relative z-[1] min-w-0 flex-1 truncate text-left transition-colors">
              Create Posts
            </span>
          </button>
          {boardItem ? (
            <SidebarItem
              item={boardItem}
              pathname={pathname}
              mutedIcon
              className="mt-1.5"
            />
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <LayoutGroup id="desktop-sidebar-nav">
        {isSettings || isAccount ? (
          <>
            <SidebarSection>
              <SidebarItem
                item={{
                  label: "Back",
                  href: workspaceBase(slug),
                  icon: ArrowBackIcon,
                  exact: true,
                }}
                pathname={pathname}
                mutedIcon
                indicator={false}
              />
            </SidebarSection>
            <SidebarSection title={isSettings ? "SETTINGS" : "ACCOUNT"} className="mt-4">
              {isSettings ? <SettingsNav /> : <AccountNav />}
            </SidebarSection>
          </>
        ) : (
          <>
            <SidebarSection title="Requests">
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
            <SidebarSection title="Workspace" className="mt-3">
              {workspaceNav.map((item) => (
                <SidebarItem
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  mutedIcon
                />
              ))}
            </SidebarSection>
          </>
        )}
        </LayoutGroup>
      </div>

      <SidebarSection className="border-t border-border/30 px-3 pb-3 pt-3">
        <Timezone
          className="mb-3"
          initialTimezone={initialTimezone}
          initialServerNow={initialServerNow}
        />
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
            indicator={false}
          />
        ))}
        <div className="flex items-center gap-1">
          <UserDropdown
            className="min-w-0 flex-1"
            initialUser={initialUser}
            initialDeviceAccounts={initialDeviceAccounts}
          />
          <WorkspaceNotificationsAction className="size-8 shrink-0 rounded-md border-0 bg-black/5 p-0 text-accent shadow-none ring-0 before:hidden hover:bg-black/[0.08] dark:bg-[#292929] dark:hover:bg-[#303030]" />
        </div>
      </SidebarSection>
    </aside>
  );
}
