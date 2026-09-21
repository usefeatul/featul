"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import type { NavItem } from "../../types/nav";
import {
  buildBottomNav,
  getSlugFromPath,
  isWorkspaceAccountPath,
  isWorkspaceSettingsPath,
  workspaceBase,
} from "../../config/nav";
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
import { WorkspaceCreateIcon } from "@featul/ui/icons/workspace";
import { LayoutGroup } from "framer-motion";
import { CreatePostModal } from "../post/CreatePostModal";
import type { DeviceAccount, UserIdentity } from "@/components/account/types";
import { sidebarLeadSlotClassName, sidebarRowClassName } from "./styles";
import { PanelIcon } from "@featul/ui/icons/panel";

const secondaryNav: NavItem[] = buildBottomNav();
const SIDEBAR_COLLAPSED_COOKIE = "featul_sidebar_collapsed";
export default function Sidebar({
  className = "",
  initialCollapsed = false,
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
  initialCollapsed?: boolean;
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
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const navRef = React.useRef<HTMLDivElement>(null);
  const [navScrollable, setNavScrollable] = useState(false);
  const openCreatePost = React.useCallback(() => setCreatePostOpen(true), []);
  useCreatePostHotkey({ onOpen: openCreatePost });
  const boardItem = middleNav.find((item) => item.label === "My Board");
  const workspaceNav = middleNav.filter((item) => item.label !== "My Board");

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=${String(next)}; Path=/; Max-Age=31536000; SameSite=Lax`;
      return next;
    });
  }, []);

  const statusKey = (label: string) => {
    return label.trim().toLowerCase();
  };

  React.useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const updateScrollable = () => {
      setNavScrollable(nav.scrollHeight > nav.clientHeight + 1);
    };

    updateScrollable();
    const observer = new ResizeObserver(updateScrollable);
    observer.observe(nav);
    Array.from(nav.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [
    collapsed,
    isAccount,
    isSettings,
    pathname,
    primaryNav.length,
    workspaceNav.length,
  ]);

  return (
    <aside
      className={cn(
        "relative hidden w-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out lg:flex lg:shrink-0",
        collapsed ? "lg:w-[50px]" : "lg:w-[268px]",
        "lg:sticky lg:top-0 lg:h-dvh lg:overflow-hidden",
        className,
      )}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <div className={cn("px-2 py-2", collapsed && "px-1.5")}>
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "h-9 gap-1",
          )}
        >
          {collapsed ? (
            <WorkspaceSwitcher
              className="w-9"
              initialWorkspace={initialWorkspace}
              initialWorkspaces={initialWorkspaces}
              collapsed
            />
          ) : (
            <>
              <WorkspaceSwitcher
                className="min-w-0 flex-1"
                initialWorkspace={initialWorkspace}
                initialWorkspaces={initialWorkspaces}
              />
              <button
                type="button"
                onClick={toggleCollapsed}
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label="Collapse sidebar"
                aria-expanded={true}
                title="Collapse sidebar"
              >
                <PanelIcon className="size-[18px]" />
              </button>
            </>
          )}
        </div>
        {pathname.split("/")[3] === "roadmap" ? (
          <RoadmapSearchAction
            compact={collapsed}
            className={cn(
              sidebarSearchClassName,
              collapsed && "mx-auto flex size-9 justify-center px-0",
            )}
          />
        ) : (
          <SearchAction
            compact={collapsed}
            className={cn(
              sidebarSearchClassName,
              collapsed && "mx-auto flex size-9 justify-center px-0",
            )}
          />
        )}
        <div className={cn("mt-4 px-1", collapsed && "px-0")}>
          <button
            type="button"
            className={cn(
              sidebarRowClassName,
              "cursor-pointer text-foreground hover:bg-muted dark:hover:bg-white/5",
              collapsed &&
                "mx-auto size-9 w-9 flex-none justify-center gap-0 px-0 py-0",
            )}
            onClick={openCreatePost}
            aria-label={collapsed ? "Create post" : undefined}
            title={collapsed ? "Create post" : undefined}
          >
            <span className={sidebarLeadSlotClassName}>
              <WorkspaceCreateIcon className="size-5 text-neutral-400 transition-colors group-hover:text-primary dark:text-neutral-300 dark:group-hover:text-primary" />
            </span>
            {!collapsed ? (
              <span className="relative z-[1] min-w-0 flex-1 truncate text-left transition-colors">
                Create Posts
              </span>
            ) : null}
          </button>
          {boardItem ? (
            <SidebarItem
              item={boardItem}
              pathname={pathname}
              mutedIcon
              className="mt-1.5"
              collapsed={collapsed}
            />
          ) : null}
        </div>
      </div>

      <div ref={navRef} className="flex-1 overflow-y-auto scrollbar-hide">
        <LayoutGroup id="desktop-sidebar-nav">
          {isSettings || isAccount ? (
            <>
              <SidebarSection
                className={collapsed ? "border-t border-sidebar-border" : ""}
                collapsed={collapsed}
              >
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
                  collapsed={collapsed}
                />
              </SidebarSection>
              <SidebarSection
                title={isSettings ? "SETTINGS" : "ACCOUNT"}
                className={
                  collapsed ? "border-t border-sidebar-border" : "mt-4"
                }
                collapsed={collapsed}
              >
                {isSettings ? (
                  <SettingsNav collapsed={collapsed} />
                ) : (
                  <AccountNav collapsed={collapsed} />
                )}
              </SidebarSection>
            </>
          ) : (
            <>
              <SidebarSection
                title="Requests"
                className={collapsed ? "border-t border-sidebar-border" : ""}
                collapsed={collapsed}
              >
                {primaryNav.map((item) => (
                  <SidebarItem
                    key={item.label}
                    item={item}
                    pathname={pathname}
                    count={
                      statusCounts
                        ? statusCounts[statusKey(item.label)]
                        : undefined
                    }
                    mutedIcon={false}
                    collapsed={collapsed}
                  />
                ))}
              </SidebarSection>
              <SidebarSection
                title="Workspace"
                className={
                  collapsed ? "border-t border-sidebar-border" : "mt-3"
                }
                collapsed={collapsed}
              >
                {workspaceNav.map((item) => (
                  <SidebarItem
                    key={item.label}
                    item={item}
                    pathname={pathname}
                    mutedIcon
                    collapsed={collapsed}
                  />
                ))}
              </SidebarSection>
            </>
          )}
        </LayoutGroup>
      </div>

      <SidebarSection
        className={cn(
          collapsed ? "px-1.5 pb-2 pt-2" : "px-3 pb-3 pt-3",
          collapsed
            ? "border-t border-sidebar-border"
            : navScrollable && "border-t border-border/30",
        )}
        collapsed={collapsed}
      >
        <Timezone
          className={collapsed ? "mb-2" : "mb-3"}
          initialTimezone={initialTimezone}
          initialServerNow={initialServerNow}
          collapsed={collapsed}
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
            collapsed={collapsed}
          />
        ))}
        {collapsed ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="mx-auto mt-2 flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label="Expand sidebar"
            aria-expanded={false}
            title="Expand sidebar"
          >
            <PanelIcon className="size-[18px]" />
          </button>
        ) : null}
        <div
          className={cn(
            "flex items-center gap-1",
            collapsed && "flex-col gap-2",
          )}
        >
          {collapsed ? (
            <>
              <WorkspaceNotificationsAction className="size-9 shrink-0 rounded-md border-0 bg-transparent p-0 text-accent shadow-none ring-0 before:hidden hover:bg-black/[0.06] dark:bg-transparent dark:hover:bg-white/[0.05]" />
              <UserDropdown
                className="w-full min-w-0 flex-1"
                initialUser={initialUser}
                initialDeviceAccounts={initialDeviceAccounts}
                collapsed
              />
            </>
          ) : (
            <>
              <UserDropdown
                className="min-w-0 flex-1"
                initialUser={initialUser}
                initialDeviceAccounts={initialDeviceAccounts}
              />
              <WorkspaceNotificationsAction className="size-8 shrink-0 rounded-md border-0 bg-transparent p-0 text-accent shadow-none ring-0 before:hidden hover:bg-black/[0.06] dark:bg-transparent dark:hover:bg-white/[0.05]" />
            </>
          )}
        </div>
      </SidebarSection>
    </aside>
  );
}
