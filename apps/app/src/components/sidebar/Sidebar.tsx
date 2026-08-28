"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import type { NavItem } from "../../types/nav";
import { buildBottomNav, getSlugFromPath, isWorkspaceAccountPath, isWorkspaceSettingsPath, workspaceBase } from "../../config/nav";
import { ArrowBackIcon } from "@featul/ui/icons/arrow-back";
import SettingsNav from "@/components/settings/global/SettingsNav";
import AccountNav from "@/components/account/AccountNav";
import {
  useSidebarHotkeys,
  getShortcutForLabel,
} from "@/hooks/useSidebarHotkeys";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import UserDropdown from "@/components/account/UserDropdown";
import Timezone from "./Timezone";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import { useWorkspaceNav } from "@/hooks/useWorkspaceNav";
import { useCreatePostHotkey } from "@/hooks/useCreatePostHotkey";
import { PlusIcon } from "@featul/ui/icons/plus";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
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
  const router = useRouter();
  const slug = getSlugFromPath(pathname);
  const isSettings = isWorkspaceSettingsPath(pathname);
  const isAccount = isWorkspaceAccountPath(pathname);

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

  return (
    <aside
      tabIndex={0}
      onMouseEnter={() => setHotkeysActive(true)}
      onMouseLeave={() => setHotkeysActive(false)}
      onFocus={() => setHotkeysActive(true)}
      onBlur={() => setHotkeysActive(false)}
      className={cn(
        "hidden lg:flex w-full lg:w-60 lg:shrink-0 flex-col bg-background",
        "lg:sticky lg:top-2 lg:h-[calc(100vh-1rem)] lg:overflow-hidden",
        className,
      )}
    >
      <div className="p-3">
        <div className={cn(sidebarRowClassName, "py-1")}>
          <span className={sidebarLeadSlotClassName}>
            <FeatulLogoIcon className="size-6" />
          </span>
          <div className="text-md font-semibold">Featul</div>
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
          </>
        )}
        </LayoutGroup>
      </div>

      <SidebarSection className="px-3 pb-4 pt-2">
        <button
          type="button"
          className={cn(
            sidebarRowClassName,
            "text-accent hover:bg-muted dark:hover:bg-black/40",
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
        <UserDropdown
          initialUser={initialUser}
          initialDeviceAccounts={initialDeviceAccounts}
        />
      </SidebarSection>
    </aside>
  );
}
