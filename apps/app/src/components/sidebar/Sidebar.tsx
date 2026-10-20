"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import {
  buildBottomNav,
  getSlugFromPath,
  isWorkspaceAccountPath,
  isWorkspaceSettingsPath,
  workspaceBase,
} from "@/config/nav";
import {
  ArrowBackIcon,
  EditIcon as WorkspaceCreateIcon,
} from "@/components/global/icons";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import SettingsNav from "@/components/settings/global/SettingsNav";
import AccountNav from "@/components/account/AccountNav";
import { CreatePostModal } from "../post/CreatePostModal";
import type { DeviceAccount, UserIdentity } from "@/components/account/types";
import { useWorkspaceNav } from "@/hooks/useWorkspaceNav";
import { usePinnedNav } from "@/hooks/usePinnedNav";
import { useCreatePostHotkey } from "@/hooks/useCreatePostHotkey";
import { useSidebarShortcut } from "@/hooks/shortcut";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import Timezone from "./Timezone";
import Upgrade from "./upgrade";
import UserDropdown from "@/components/account/UserDropdown";
import WorkspaceNotificationsAction from "@/components/global/WorkspaceNotificationsAction";
import SidebarToggle from "./toggle";
import { sidebarLeadSlotClassName, sidebarRowClassName } from "./styles";

const SIDEBAR_COLLAPSED_COOKIE = "featul_sidebar_collapsed";
export default function Sidebar({
  className = "",
  initialCollapsed = false,
  initialPins,
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
  initialPins?: string[];
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
    { domain: { status: string; host?: string } | null } | undefined;
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
  const reduceMotion = useReducedMotion();
  const navView = isSettings ? "settings" : isAccount ? "account" : "workspace";
  const { primaryNav, middleNav, statusCounts } = useWorkspaceNav(
    slug,
    initialWorkspace || null,
    initialCounts,
    initialDomainInfo || null,
  );
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const openCreatePost = React.useCallback(() => setCreatePostOpen(true), []);
  useCreatePostHotkey({ onOpen: openCreatePost });
  const boardItem = middleNav.find((item) => item.label === "My Board");
  const workspaceNav = React.useMemo(
    () => middleNav.filter((item) => item.label !== "My Board"),
    [middleNav],
  );
  const pinnableNav = React.useMemo(
    () => [...primaryNav, ...workspaceNav],
    [primaryNav, workspaceNav],
  );
  const { pinnedItems, isPinned, togglePin } = usePinnedNav(
    slug,
    pinnableNav,
    initialPins,
  );
  const requestNav = primaryNav.filter((item) => !isPinned(item.label));
  const unpinnedWorkspaceNav = workspaceNav.filter(
    (item) => !isPinned(item.label),
  );

  const setSidebarCollapsed = React.useCallback((next: boolean) => {
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=${String(next)}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, []);
  const toggleCollapsed = React.useCallback(
    () => setSidebarCollapsed(!collapsed),
    [collapsed, setSidebarCollapsed],
  );
  const revealNavigation = React.useCallback(
    () => setSidebarCollapsed(false),
    [setSidebarCollapsed],
  );
  useSidebarShortcut(toggleCollapsed);

  return (
    <aside
      aria-label="Workspace sidebar"
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "hidden h-dvh shrink-0 bg-sidebar text-sidebar-foreground lg:flex",
        className,
      )}
    >
      <div
        id="workspace-navigation"
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden transition-[width] duration-200 ease-out motion-reduce:transition-none",
          collapsed ? "w-[52px]" : "w-[264px]",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center gap-1",
            collapsed ? "flex-col px-1.5 py-2" : "h-[52px] px-3",
          )}
        >
          <WorkspaceSwitcher
            className={collapsed ? "" : "min-w-0 flex-1"}
            initialWorkspace={initialWorkspace}
            initialWorkspaces={initialWorkspaces}
            collapsed={collapsed}
          />
          <SidebarToggle collapsed={collapsed} onToggle={toggleCollapsed} />
        </div>
        <div
          className={cn(
            "shrink-0 pb-1",
            collapsed ? "space-y-2 px-1.5" : "space-y-1.5 px-3",
          )}
        >
          <button
            type="button"
            onClick={openCreatePost}
            aria-label="Create post"
            title={collapsed ? "Create post" : undefined}
            className={cn(
              sidebarRowClassName,
              "h-9 cursor-pointer py-0 text-foreground hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              collapsed && "mx-auto size-9 w-9 justify-center gap-0 px-0",
            )}
          >
            <span className={sidebarLeadSlotClassName}>
              <WorkspaceCreateIcon className="size-5 text-neutral-600 transition-colors duration-200 group-hover:text-primary dark:text-neutral-300 dark:group-hover:text-primary" />
            </span>
            {!collapsed ? <span>Create post</span> : null}
          </button>
          <LayoutGroup id="desktop-sidebar-actions">
            {boardItem ? (
              <SidebarItem
                item={boardItem}
                pathname={pathname}
                collapsed={collapsed}
                mutedIcon
              />
            ) : null}
          </LayoutGroup>
        </div>
        <nav
          aria-label={
            isSettings
              ? "Workspace settings"
              : isAccount
                ? "Account settings"
                : "Workspace navigation"
          }
          className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto scrollbar-hide"
        >
          <LayoutGroup id="desktop-sidebar-nav">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={navView}
                className="shrink-0"
                initial={{ opacity: 0, x: reduceMotion ? 0 : 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.12 }}
              >
                {isSettings || isAccount ? (
                  <>
                    <SidebarSection collapsed={collapsed}>
                      <SidebarItem
                        item={{
                          label: "Back to workspace",
                          href: workspaceBase(slug),
                          icon: ArrowBackIcon,
                          exact: true,
                        }}
                        pathname={pathname}
                        mutedIcon
                        indicator={false}
                        collapsed={collapsed}
                        onClick={revealNavigation}
                      />
                    </SidebarSection>
                    <SidebarSection
                      title={isSettings ? undefined : "Account"}
                      collapsed={collapsed}
                    >
                      {isSettings ? (
                        <SettingsNav
                          collapsed={collapsed}
                          onLinkClick={revealNavigation}
                        />
                      ) : (
                        <AccountNav
                          collapsed={collapsed}
                          onLinkClick={revealNavigation}
                        />
                      )}
                    </SidebarSection>
                  </>
                ) : (
                  <>
                    {pinnedItems.length > 0 ? (
                      <SidebarSection title="Pinned" collapsed={collapsed}>
                        {pinnedItems.map((item) => {
                          const isRequest = primaryNav.includes(item);
                          return (
                            <SidebarItem
                              key={item.label}
                              item={item}
                              pathname={pathname}
                              collapsed={collapsed}
                              mutedIcon={!isRequest}
                              onClick={
                                item.external ? undefined : revealNavigation
                              }
                              count={
                                isRequest
                                  ? statusCounts?.[
                                      item.label.trim().toLowerCase()
                                    ]
                                  : undefined
                              }
                              pinned
                              onTogglePin={togglePin}
                            />
                          );
                        })}
                      </SidebarSection>
                    ) : null}
                    {requestNav.length > 0 ? (
                      <SidebarSection title="Requests" collapsed={collapsed}>
                        {requestNav.map((item) => (
                          <SidebarItem
                            key={item.label}
                            item={item}
                            pathname={pathname}
                            collapsed={collapsed}
                            onClick={revealNavigation}
                            count={
                              statusCounts?.[item.label.trim().toLowerCase()]
                            }
                            onTogglePin={togglePin}
                          />
                        ))}
                      </SidebarSection>
                    ) : null}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
            {!isSettings && !isAccount && unpinnedWorkspaceNav.length > 0 ? (
              <SidebarSection title="Workspace" collapsed={collapsed} className="shrink-0">
                {unpinnedWorkspaceNav.map((item) => (
                  <SidebarItem
                    key={item.label}
                    item={item}
                    pathname={pathname}
                    collapsed={collapsed}
                    mutedIcon
                    onClick={item.external ? undefined : revealNavigation}
                    onTogglePin={togglePin}
                  />
                ))}
              </SidebarSection>
            ) : null}
          </LayoutGroup>
          <div className="mt-auto shrink-0 pb-11">
            <Upgrade
              slug={slug}
              collapsed={collapsed}
              initialPlan={initialWorkspace?.plan}
              userKey={
                initialDeviceAccounts?.find((account) => account.isCurrent)
                  ?.userId ??
                initialUser?.email ??
                "default"
              }
            />
          </div>
        </nav>
        <LayoutGroup id="desktop-sidebar-footer">
          <SidebarSection collapsed={collapsed} className="shrink-0">
            {buildBottomNav().map((item) => (
              <SidebarItem
                key={item.label}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                mutedIcon
              />
            ))}
            <Timezone
              collapsed={collapsed}
              initialTimezone={initialTimezone}
              initialServerNow={initialServerNow}
            />
            <div
              className={cn(
                "flex items-center gap-1",
                collapsed && "flex-col-reverse",
              )}
            >
              <UserDropdown
                className={collapsed ? "w-9" : "min-w-0 flex-1"}
                initialUser={initialUser}
                initialDeviceAccounts={initialDeviceAccounts}
                collapsed={collapsed}
              />
              <WorkspaceNotificationsAction className="size-9 shrink-0 rounded-lg border-0 bg-transparent p-0 text-muted-foreground shadow-none ring-0 before:hidden hover:bg-sidebar-accent dark:bg-transparent dark:hover:bg-white/5" />
            </div>
          </SidebarSection>
        </LayoutGroup>
      </div>
      <CreatePostModal
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        workspaceSlug={slug}
        user={initialUser}
      />
    </aside>
  );
}
