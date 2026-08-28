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
import Timezone from "./Timezone";
import UserDropdown from "@/components/account/UserDropdown";
import { PlusIcon } from "@featul/ui/icons/plus";
import { getSlugFromPath, isWorkspaceAccountPath, isWorkspaceSettingsPath, workspaceBase } from "../../config/nav";
import SettingsNav from "@/components/settings/global/SettingsNav";
import AccountNav from "@/components/account/AccountNav";
import { ArrowBackIcon } from "@featul/ui/icons/arrow-back";
import { sidebarLeadSlotClassName, sidebarRowClassName } from "./styles";
import { CreatePostModal } from "../post/CreatePostModal";
import { LayoutGroup } from "framer-motion";
import type { DeviceAccount, UserIdentity } from "@/components/account/types";
import { cn } from "@featul/ui/lib/utils";

export default function MobileDrawerContent({
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
    <DrawerContent>
      <VisuallyHidden>
        <DrawerTitle>Menu</DrawerTitle>
      </VisuallyHidden>
      <ScrollArea className="h-full">
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
          <Timezone
            className="mt-2"
            initialTimezone={initialTimezone}
            initialServerNow={initialServerNow}
          />
        </div>

        {isSettings || isAccount ? (
          <LayoutGroup id={isSettings ? "mobile-settings-nav" : "mobile-account-nav"}>
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
            <SidebarSection title={isSettings ? "SETTINGS" : "ACCOUNT"} className="mt-4">
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
                    statusCounts ? statusCounts[statusKey(item.label)] : undefined
                  }
                  mutedIcon={false}
                  onClick={onLinkClick}
                />
              ))}
            </SidebarSection>
          </LayoutGroup>
        )}

        <SidebarSection className="pb-8">
          <button
            type="button"
            className={cn(
              sidebarRowClassName,
              "text-accent hover:bg-muted dark:hover:bg-black/40",
            )}
            onClick={() => setCreatePostOpen(true)}
          >
            <span className={sidebarLeadSlotClassName}>
              <PlusIcon className="size-5 text-foreground opacity-60 group-hover:text-primary group-hover:opacity-100 transition-colors" />
            </span>
            <span className="relative z-[1] min-w-0 flex-1 truncate text-left transition-colors">
              Create Posts
            </span>
          </button>
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
              onClick={onLinkClick}
            />
          ))}
          <UserDropdown
            initialUser={initialUser}
            initialDeviceAccounts={initialDeviceAccounts}
          />
        </SidebarSection>
      </ScrollArea>
    </DrawerContent>
  );
}
