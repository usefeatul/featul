"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import {
  getSlugFromPath,
  isWorkspaceAccountPath,
  isWorkspaceSettingsPath,
  requestsBase,
  workspaceBase,
} from "@/config/nav";
import {
  ArrowBackIcon,
  EditIcon as WorkspaceCreateIcon,
  CollectIcon as WorkspaceFeedbackIcon,
} from "@/components/global/icons";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import SettingsNav from "@/components/settings/global/SettingsNav";
import AccountNav from "@/components/account/AccountNav";
import SearchAction from "@/components/requests/actions/SearchAction";
import RoadmapSearchAction from "@/components/roadmap/actions/RoadmapSearchAction";
import { CreatePostModal } from "../post/CreatePostModal";
import type { DeviceAccount, UserIdentity } from "@/components/account/types";
import { useWorkspaceNav } from "@/hooks/useWorkspaceNav";
import { useCreatePostHotkey } from "@/hooks/useCreatePostHotkey";
import { useSidebarShortcut } from "@/hooks/shortcut";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import Timezone from "./Timezone";
import Upgrade from "./upgrade";
import Rail from "./rail";
import SidebarToggle from "./toggle";
import {
  sidebarHeaderActionClassName,
  sidebarLeadSlotClassName,
  sidebarRowClassName,
} from "./styles";

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
  const workspaceNav = middleNav.filter((item) => item.label !== "My Board");

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
      <Rail
        slug={slug}
        pathname={pathname}
        items={workspaceNav}
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        onNavigate={revealNavigation}
        initialWorkspace={initialWorkspace}
        initialWorkspaces={initialWorkspaces}
        initialUser={initialUser}
        initialDeviceAccounts={initialDeviceAccounts}
      />
      <div
        id="workspace-navigation"
        inert={collapsed}
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden transition-[width] duration-200 ease-out motion-reduce:transition-none",
          collapsed ? "w-0" : "w-[248px]",
        )}
      >
        <div className="flex min-h-0 w-[248px] flex-1 flex-col border-l border-sidebar-border bg-background">
          <div className="flex h-[52px] shrink-0 items-center gap-1 px-3">
            <WorkspaceSwitcher
              className="min-w-0 flex-1"
              initialWorkspace={initialWorkspace}
              initialWorkspaces={initialWorkspaces}
            />
            {pathname.split("/")[3] === "roadmap" ? (
              <RoadmapSearchAction
                compact
                className={sidebarHeaderActionClassName}
              />
            ) : (
              <SearchAction compact className={sidebarHeaderActionClassName} />
            )}
            <SidebarToggle collapsed={collapsed} onToggle={toggleCollapsed} />
          </div>
          <div className="shrink-0 px-3 pb-3">
            <button
              type="button"
              onClick={openCreatePost}
              className={cn(
                sidebarRowClassName,
                "mt-3 cursor-pointer text-foreground hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <span className={sidebarLeadSlotClassName}>
                <WorkspaceCreateIcon className="size-5 text-muted-foreground" />
              </span>
              <span>Create post</span>
            </button>
          </div>
          <nav
            aria-label={
              isSettings
                ? "Workspace settings"
                : isAccount
                  ? "Account settings"
                  : "Workspace navigation"
            }
            className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto scrollbar-hide"
          >
            <LayoutGroup id="desktop-sidebar-nav">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={navView}
                  initial={{ opacity: 0, x: reduceMotion ? 0 : 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.12 }}
                >
                  {isSettings || isAccount ? (
                    <>
                      <SidebarSection>
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
                        />
                      </SidebarSection>
                      <SidebarSection
                        title={isSettings ? "Settings" : "Account"}
                      >
                        {isSettings ? <SettingsNav /> : <AccountNav />}
                      </SidebarSection>
                    </>
                  ) : (
                    <>
                      <SidebarSection title="Requests">
                        <SidebarItem
                          item={{
                            label: "All requests",
                            href: requestsBase(slug),
                            icon: WorkspaceFeedbackIcon,
                            exact: true,
                          }}
                          pathname={pathname}
                          mutedIcon
                          indicator={false}
                        />
                        {primaryNav.map((item) => (
                          <SidebarItem
                            key={item.label}
                            item={item}
                            pathname={pathname}
                            count={
                              statusCounts?.[item.label.trim().toLowerCase()]
                            }
                          />
                        ))}
                      </SidebarSection>
                      {boardItem ? (
                        <SidebarSection title="Workspace" className="mt-2">
                          <SidebarItem
                            item={boardItem}
                            pathname={pathname}
                            mutedIcon
                          />
                        </SidebarSection>
                      ) : null}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </LayoutGroup>
            <div className="pb-3">
              <Upgrade
                slug={slug}
                collapsed={false}
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
          <div className="shrink-0">
            <div className="flex h-[52px] items-center px-3">
              <Timezone
                className="w-full"
                initialTimezone={initialTimezone}
                initialServerNow={initialServerNow}
              />
            </div>
          </div>
        </div>
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
