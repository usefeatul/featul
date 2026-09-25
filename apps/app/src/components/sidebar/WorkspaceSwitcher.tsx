"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@featul/ui/components/dropdown-menu";
import { useWorkspaceSwitcher } from "../../hooks/useWorkspaceSwitcher";
import Image from "next/image";
import { getSlugFromPath } from "../../config/nav";
import { PlusIcon } from "@/components/global/icons";
import { WorkspaceSwitcherIcon } from "@featul/ui/icons/workspace";
import type { Ws } from "../../hooks/useWorkspaceSwitcher";
import { SidebarBadge } from "./badge";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { sidebarLeadSlotClassName, sidebarRowClassName } from "./styles";
import { getPlanColorClassName } from "@/lib/plan";

const SIDEBAR_HOVER_ITEM_CLASS =
  "hover:bg-muted dark:hover:bg-white/5 focus:bg-muted dark:focus:bg-black/40 data-[highlighted]:bg-muted dark:data-[highlighted]:bg-black/40";

export default function WorkspaceSwitcher({
  className = "",
  initialWorkspace,
  initialWorkspaces,
  collapsed = false,
}: {
  className?: string;
  initialWorkspace?: Ws | null;
  initialWorkspaces?: Ws[];
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const slug = getSlugFromPath(pathname || "");
  const {
    all,
    current,
    wsInfo,
    currentLogo,
    currentName,
    handleSelectWorkspace,
    handleCreateNew,
  } = useWorkspaceSwitcher(
    slug,
    initialWorkspace || null,
    initialWorkspaces || [],
  );

  const onSelectWorkspace = React.useCallback(
    (targetSlug: string) => {
      setOpen(false);
      handleSelectWorkspace(targetSlug);
    },
    [handleSelectWorkspace],
  );
  const onCreateNew = React.useCallback(() => {
    setOpen(false);
    handleCreateNew();
  }, [handleCreateNew]);
  const currentPlan = wsInfo?.plan || current?.plan || "free";

  return (
    <div className={cn(className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              sidebarRowClassName,
              "cursor-pointer text-left transition-colors hover:bg-muted dark:hover:bg-white/5",
              collapsed &&
                "mx-auto size-9 w-9 flex-none justify-center gap-0 px-0 py-0",
            )}
            aria-label={
              collapsed ? `Switch workspace: ${currentName}` : undefined
            }
            title={collapsed ? currentName : undefined}
          >
            <span
              className={cn(
                sidebarLeadSlotClassName,
                "overflow-hidden rounded-md",
                collapsed && "size-6",
              )}
            >
              {currentLogo ? (
                <Image
                  key={currentLogo}
                  src={currentLogo}
                  alt=""
                  width={24}
                  height={24}
                  sizes="24px"
                  className="size-6 object-contain"
                  priority
                  unoptimized={currentLogo.startsWith("data:")}
                />
              ) : (
                <FeatulLogoIcon className="size-6 text-primary" />
              )}
            </span>
            {!collapsed ? (
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                <span className="truncate text-sm font-medium leading-none text-foreground">
                  {currentName}
                </span>
                <span
                  className={cn(
                    "ml-auto shrink-0 text-[10px] font-medium uppercase tracking-wide",
                    getPlanColorClassName(currentPlan),
                  )}
                >
                  {currentPlan}
                </span>
              </div>
            ) : null}
            {!collapsed ? (
              <SidebarBadge className="ml-auto shrink-0">
                <WorkspaceSwitcherIcon className="size-3 text-neutral-600 dark:text-neutral-300" />
              </SidebarBadge>
            ) : null}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-46 max-w-[95vw]"
          side={collapsed ? "right" : "bottom"}
          align={collapsed ? "start" : "center"}
          sideOffset={collapsed ? 12 : 8}
          withBackdrop
        >
          {all.length === 0 ? (
            <DropdownMenuItem disabled>No workspaces yet</DropdownMenuItem>
          ) : (
            <div className="flex flex-col">
              <div className="max-h-[200px] overflow-y-auto overflow-x-hidden scrollbar-hide">
                <div className="flex flex-col gap-1 pb-1">
                  {all.map((w) => {
                    const isCurrent = w.slug === slug;
                    const logoUrl: string | null = isCurrent
                      ? currentLogo
                      : (w.logo ?? null);
                    const name = isCurrent ? currentName : w.name;
                    return (
                      <DropdownMenuItem
                        key={w.slug}
                        onSelect={() => onSelectWorkspace(w.slug)}
                        className={cn(
                          "flex items-center gap-3 px-2 py-2 cursor-pointer",
                          SIDEBAR_HOVER_ITEM_CLASS,
                          isCurrent && "bg-muted dark:bg-black/40",
                        )}
                      >
                        {logoUrl ? (
                          <div className="relative w-8 h-8 shrink-0 rounded-md bg-muted border ring-1 ring-border overflow-hidden">
                            <Image
                              key={logoUrl}
                              src={logoUrl}
                              alt={name}
                              fill
                              sizes="32px"
                              className="object-cover"
                              unoptimized={logoUrl.startsWith("data:")}
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 shrink-0 rounded-md bg-muted border ring-1 ring-border" />
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-sm font-medium">
                            {name}
                          </span>
                          <span
                            className={cn(
                              "text-xs capitalize",
                              getPlanColorClassName(w.plan || "free"),
                            )}
                          >
                            {w.plan || "Free"}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-1 pt-1 border-t border-border -mx-2 px-2">
                <DropdownMenuItem
                  onSelect={onCreateNew}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 cursor-pointer",
                    SIDEBAR_HOVER_ITEM_CLASS,
                  )}
                >
                  <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                    <PlusIcon className="size-5 text-muted-foreground" />
                  </div>
                  <span className="truncate text-sm font-medium">
                    Add workspace
                  </span>
                </DropdownMenuItem>
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
