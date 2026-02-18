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
import Image from "next/image"
import { getSlugFromPath } from "../../config/nav";
import { ChevronIcon } from "@featul/ui/icons/chevron";
import { PlusIcon } from "@featul/ui/icons/plus";
import type { Ws } from "../../hooks/useWorkspaceSwitcher";

export default function WorkspaceSwitcher({
  className = "",
  initialWorkspace,
  initialWorkspaces,
}: {
  className?: string;
  initialWorkspace?: Ws | null;
  initialWorkspaces?: Ws[];
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
  } = useWorkspaceSwitcher(slug, initialWorkspace || null, initialWorkspaces || []);

  const onSelectWorkspace = React.useCallback((targetSlug: string) => {
    setOpen(false);
    handleSelectWorkspace(targetSlug);
  }, [handleSelectWorkspace]);
  const onCreateNew = React.useCallback(() => {
    setOpen(false);
    handleCreateNew();
  }, [handleCreateNew]);

  return (
    <div className={cn(className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="w-full cursor-pointer rounded-md">
          <div className="group flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted dark:hover:bg-black/40 cursor-pointer">
            <div className={cn("relative size-7 rounded-md border border-border ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black overflow-hidden", currentLogo ? "bg-transparent" : "bg-card")}>
              {currentLogo ? (
                <Image
                  src={currentLogo}
                  alt={currentName}
                  fill
                  sizes="24px"
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>
            <div className="flex flex-col items-start gap-1 overflow-hidden">
              <span className="text-sm font-medium leading-none truncate text-foreground">{currentName}</span>
              <span className="text-xs text-accent capitalize leading-none">{wsInfo?.plan || current?.plan || "Free"}</span>
            </div>
            <span className="ml-auto rounded-sm border border-border bg-card px-1.5 py-0.5 text-xs ring-1 ring-border/20 ring-offset-1 ring-offset-white transition-colors dark:bg-black/50 dark:ring-offset-black">
              <ChevronIcon className="size-3 text-accent" />
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-46 max-w-[95vw] p-2"
          side="bottom"
          align="center"
          sideOffset={8}
        >
          {all.length === 0 ? (
            <DropdownMenuItem disabled>No workspaces yet</DropdownMenuItem>
          ) : (
            <div className="flex flex-col">
              <div className="max-h-[200px] overflow-y-auto overflow-x-hidden scrollbar-hide">
                <div className="flex flex-col gap-1 pb-1">
                  {all.map((w) => {
                    const logoUrl: string | null = w.logo ?? null;
                    const isCurrent = w.slug === slug;
                    return (
                      <DropdownMenuItem
                        key={w.slug}
                        onSelect={() => onSelectWorkspace(w.slug)}
                        className={cn(
                          "flex items-center gap-3 px-2 py-2 rounded-sm cursor-pointer",
                          isCurrent ? "bg-muted" : "hover:bg-muted"
                        )}
                      >
                        {logoUrl ? (
                          <div className="relative w-8 h-8 shrink-0 rounded-md bg-muted border ring-1 ring-border overflow-hidden">
                            <Image
                              src={logoUrl}
                              alt={w.name}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 shrink-0 rounded-md bg-muted border ring-1 ring-border" />
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-sm font-medium">{w.name}</span>
                          <span className="text-xs text-muted-foreground capitalize">
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
                  className="flex items-center gap-3 px-2 py-2 rounded-sm cursor-pointer hover:bg-muted"
                >
                  <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                    <PlusIcon className="size-5 text-muted-foreground" />
                  </div>
                  <span className="truncate text-sm font-medium">Add workspace</span>
                </DropdownMenuItem>
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
