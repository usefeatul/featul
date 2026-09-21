"use client";

import React from "react";
import { ScrollArea } from "@featul/ui/components/scroll-area";
import { DrawerContent, DrawerTitle } from "@featul/ui/components/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import type { NavItem } from "../../types/nav";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import SearchAction from "@/components/requests/actions/SearchAction";
import RoadmapSearchAction from "@/components/roadmap/actions/RoadmapSearchAction";
import { sidebarSearchClassName } from "./styles";
import Timezone from "./Timezone";
import UserDropdown from "@/components/account/UserDropdown";
import WorkspaceNotificationsAction from "@/components/global/WorkspaceNotificationsAction";
import { WorkspaceCreateIcon } from "@featul/ui/icons/workspace";
import {
  getSlugFromPath,
  isWorkspaceAccountPath,
  isWorkspaceSettingsPath,
  workspaceBase,
} from "../../config/nav";
import SettingsNav from "@/components/settings/global/SettingsNav";
import AccountNav from "@/components/account/AccountNav";
import { ArrowBackIcon } from "@featul/ui/icons/arrow-back";
import { sidebarLeadSlotClassName, sidebarRowClassName } from "./styles";
import { CreatePostModal } from "../post/CreatePostModal";
import { LayoutGroup } from "framer-motion";
import type { DeviceAccount, UserIdentity } from "@/components/account/types";
import { cn } from "@featul/ui/lib/utils";

export default function MobileDrawerContent({
  boardItem,
  pathname,
  primaryNav,
  statusCounts,
  secondaryNav,
  initialTimezone,
  initialServerNow,
  initialWorkspace,
  initialWorkspaces,
  initialUser,
  initialDeviceAccounts,
  onLinkClick,
}: {
  boardItem?: NavItem;
  pathname: string;
  primaryNav: NavItem[];
  statusCounts?: Record<string, number>;
  secondaryNav: NavItem[];
  initialTimezone?: string | null;
  initialServerNow?: number;
  initialWorkspace?:
    | {
        id: string;
        name: string;
        slug: string;
        logo?: string | null;
        plan?: "free" | "starter" | "professional" | null;
      }
    | undefined;
  initialWorkspaces?:
    | {
        id: string;
        name: string;
        slug: string;
        logo?: string | null;
        plan?: "free" | "starter" | "professional" | null;
      }[]
    | undefined;
  initialUser?: UserIdentity | undefined;
  initialDeviceAccounts?: DeviceAccount[] | undefined;
  onLinkClick?: () => void;
}) {
  const [createPostOpen, setCreatePostOpen] = React.useState(false);
  const slug = getSlugFromPath(pathname);
  const isSettings = isWorkspaceSettingsPath(pathname);
  const isAccount = isWorkspaceAccountPath(pathname);
  const statusKey = (label: string) => {
    return label.trim().toLowerCase();
  };
  return (
    <DrawerContent className="flex flex-col bg-sidebar pb-[env(safe-area-inset-bottom)] text-sidebar-foreground">
      <VisuallyHidden>
        <DrawerTitle>Menu</DrawerTitle>
      </VisuallyHidden>
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-3">
          <div className={cn(sidebarRowClassName, "py-1")}>
            <span className={sidebarLeadSlotClassName}>
              <FeatulLogoIcon className="size-6" size={24} />
            </span>
            <div className="text-lg font-semibold">Featul</div>
          </div>
          <WorkspaceSwitcher
            className="mt-5.5"
            initialWorkspace={initialWorkspace}
            initialWorkspaces={initialWorkspaces}
          />
          {pathname.split("/")[3] === "roadmap" ? (
            <RoadmapSearchAction className={sidebarSearchClassName} />
          ) : (
            <SearchAction className={sidebarSearchClassName} />
          )}
          <button
            type="button"
            className={cn(
              sidebarRowClassName,
              "mt-4",
              "cursor-pointer text-foreground hover:bg-muted dark:hover:bg-white/5",
            )}
            onClick={() => setCreatePostOpen(true)}
          >
            <span className={sidebarLeadSlotClassName}>
              <WorkspaceCreateIcon className="size-5 text-neutral-600 transition-colors group-hover:text-primary dark:text-neutral-300 dark:group-hover:text-primary" />
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
              onClick={onLinkClick}
            />
          ) : null}
          <Timezone
            className="mt-2"
            initialTimezone={initialTimezone}
            initialServerNow={initialServerNow}
          />
        </div>

        {isSettings || isAccount ? (
          <LayoutGroup
            id={isSettings ? "mobile-settings-nav" : "mobile-account-nav"}
          >
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
                onClick={onLinkClick}
              />
            </SidebarSection>
            <SidebarSection
              title={isSettings ? "SETTINGS" : "ACCOUNT"}
              className="mt-4"
            >
              {isSettings ? (
                <SettingsNav onLinkClick={onLinkClick} />
              ) : (
                <AccountNav onLinkClick={onLinkClick} />
              )}
            </SidebarSection>
          </LayoutGroup>
        ) : (
          <LayoutGroup id="mobile-workspace-nav">
            <SidebarSection title="REQUEST">
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
                  onClick={onLinkClick}
                />
              ))}
            </SidebarSection>
          </LayoutGroup>
        )}
      </ScrollArea>
      <CreatePostModal
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        workspaceSlug={slug}
        user={initialUser}
      />
      <div className="shrink-0 space-y-1.5 px-3 pb-3 pt-1">
        {secondaryNav.map((item) => (
          <SidebarItem
            key={item.label}
            item={item}
            pathname={pathname}
            mutedIcon
            indicator={false}
            onClick={onLinkClick}
          />
        ))}
        <div className="flex items-center gap-1">
          <UserDropdown
            className="min-w-0 flex-1"
            initialUser={initialUser}
            initialDeviceAccounts={initialDeviceAccounts}
          />
          <WorkspaceNotificationsAction className="size-8 shrink-0 rounded-md border-0 bg-transparent p-0 text-accent shadow-none ring-0 before:hidden hover:bg-black/[0.06] dark:bg-transparent dark:hover:bg-white/[0.05]" />
        </div>
      </div>
    </DrawerContent>
  );
}
