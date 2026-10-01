"use client";

import { LayoutGroup } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";
import {
  HomeIcon,
  CollectIcon as WorkspaceFeedbackIcon,
} from "@/components/global/icons";

import UserDropdown from "@/components/account/UserDropdown";
import type { DeviceAccount, UserIdentity } from "@/components/account/types";
import WorkspaceNotificationsAction from "@/components/global/WorkspaceNotificationsAction";
import { buildBottomNav, requestsBase, workspaceBase } from "@/config/nav";
import type { NavItem } from "@/types/nav";
import type { Ws } from "@/hooks/useWorkspaceSwitcher";
import SidebarItem from "./SidebarItem";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import SidebarToggle from "./toggle";

export default function Rail({
  slug,
  pathname,
  items,
  collapsed,
  onToggle,
  onNavigate,
  initialWorkspace,
  initialWorkspaces,
  initialUser,
  initialDeviceAccounts,
}: {
  slug: string;
  pathname: string;
  items: NavItem[];
  collapsed: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  initialWorkspace?: Ws;
  initialWorkspaces?: Ws[];
  initialUser?: UserIdentity;
  initialDeviceAccounts?: DeviceAccount[];
}) {
  const settings = items.find((item) => item.label === "Settings");
  const navigation: NavItem[] = [
    {
      label: "Overview",
      href: workspaceBase(slug),
      icon: HomeIcon,
      exact: true,
    },
    {
      label: "Requests",
      href: requestsBase(slug),
      icon: WorkspaceFeedbackIcon,
    },
    ...items.filter((item) => item.label !== "Settings"),
  ];

  return (
    <div className="flex h-full w-[52px] shrink-0 flex-col items-center bg-sidebar">
      {collapsed ? (
        <div className="flex h-[52px] w-full shrink-0 items-center justify-center">
          <WorkspaceSwitcher
            initialWorkspace={initialWorkspace}
            initialWorkspaces={initialWorkspaces}
            collapsed
          />
        </div>
      ) : null}
      {collapsed ? (
        <div className="flex w-full shrink-0 justify-center border-b border-sidebar-border py-2">
          <SidebarToggle collapsed onToggle={onToggle} className="size-9" />
        </div>
      ) : null}
      <LayoutGroup id="workspace-rail">
        <nav
          aria-label="Main navigation"
          className="min-h-0 w-full flex-1 space-y-2 overflow-y-auto pt-2 scrollbar-hide"
        >
          {navigation.map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              pathname={pathname}
              collapsed
              mutedIcon
              onClick={onNavigate}
              className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          ))}
        </nav>
        <div className="mt-3 flex w-full shrink-0 flex-col items-center gap-2 pb-3">
          {settings ? (
            <SidebarItem
              item={settings}
              pathname={pathname}
              collapsed
              mutedIcon
              onClick={onNavigate}
            />
          ) : null}
          {buildBottomNav().map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              pathname={pathname}
              collapsed
              mutedIcon
            />
          ))}
          <WorkspaceNotificationsAction className="size-9 shrink-0 rounded-lg border-0 bg-transparent p-0 text-muted-foreground shadow-none ring-0 before:hidden hover:bg-sidebar-accent dark:bg-transparent dark:hover:bg-white/5" />
        </div>
        <div
          className={cn(
            "flex h-[52px] w-full shrink-0 items-center justify-center",
            collapsed && "border-t border-sidebar-border",
          )}
        >
          <UserDropdown
            className="w-9"
            initialUser={initialUser}
            initialDeviceAccounts={initialDeviceAccounts}
            collapsed
          />
        </div>
      </LayoutGroup>
    </div>
  );
}
