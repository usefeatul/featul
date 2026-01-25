"use client";

import React from "react";
import { ScrollArea } from "@featul/ui/components/scroll-area";
import { SheetContent, SheetTitle } from "@featul/ui/components/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import type { NavItem } from "../../types/nav";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import Timezone from "./Timezone";
import UserDropdown from "@/components/account/UserDropdown";
import { Button } from "@featul/ui/components/button";
import { PlusIcon } from "@featul/ui/icons/plus";
import { getSlugFromPath } from "../../config/nav";
import { CreatePostModal } from "../post/CreatePostModal";

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
  onLinkClick,
}: {
  pathname: string;
  primaryNav: NavItem[];
  statusCounts?: Record<string, number>;
  secondaryNav: NavItem[];
  initialTimezone?: string | null;
  initialServerNow?: number;
  initialWorkspace?: { id: string; name: string; slug: string; logo?: string | null; plan?: "free" | "starter" | "professional" | null } | undefined;
  initialWorkspaces?:
  | { id: string; name: string; slug: string; logo?: string | null; plan?: "free" | "starter" | "professional" | null }[]
  | undefined;
  initialUser?: { name?: string; email?: string; image?: string | null } | undefined;
  onLinkClick?: () => void;
}) {
  const [createPostOpen, setCreatePostOpen] = React.useState(false);
  const slug = getSlugFromPath(pathname);
  const statusKey = (label: string) => {
    return label.trim().toLowerCase();
  };
  return (
    <SheetContent side="right">
      <VisuallyHidden>
        <SheetTitle>Menu</SheetTitle>
      </VisuallyHidden>
      <ScrollArea className="h-full">
        <div className="p-3">
          <div className="group flex items-center gap-2 rounded-md px-2 py-2">
            <FeatulLogoIcon className="size-6" size={24} />
            <div className="text-lg font-semibold">Featul</div>
          </div>
          <WorkspaceSwitcher className="mt-5.5" initialWorkspace={initialWorkspace} initialWorkspaces={initialWorkspaces} />
          <Timezone className="mt-2" initialTimezone={initialTimezone} initialServerNow={initialServerNow} />
        </div>

        <SidebarSection title="REQUEST">
          {primaryNav.map((item) => (
            <SidebarItem key={item.label} item={item} pathname={pathname} count={statusCounts ? statusCounts[statusKey(item.label)] : undefined} mutedIcon={false} onClick={onLinkClick} />
          ))}
        </SidebarSection>

        <SidebarSection className="pb-8">
          <Button
            className="w-full mb-1 group flex items-center gap-2 rounded-md px-3 py-2 text-xs md:text-sm justify-start text-accent hover:bg-muted dark:hover:bg-black/40"
            variant="plain"
            onClick={() => setCreatePostOpen(true)}
          >
            <PlusIcon className="size-5 text-foreground opacity-60 group-hover:text-primary group-hover:opacity-100 transition-colors" />
            <span className="transition-colors">Create Post</span>
          </Button>
          <CreatePostModal
            open={createPostOpen}
            onOpenChange={setCreatePostOpen}
            workspaceSlug={slug}
            user={initialUser}
          />
          {secondaryNav.map((item) => (
            <SidebarItem key={item.label} item={item} pathname={pathname} mutedIcon onClick={onLinkClick} />
          ))}
          <UserDropdown initialUser={initialUser} />
        </SidebarSection>
      </ScrollArea>
    </SheetContent>
  );
}
