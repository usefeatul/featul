"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@oreilla/ui/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@oreilla/ui/components/dropdown-menu";
import { useWorkspaceSwitcher } from "./useWorkspaceSwitcher";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image"
import { getSlugFromPath } from "../../config/nav";
import { ChevronIcon } from "@oreilla/ui/icons/chevron";
import { PlusIcon } from "@oreilla/ui/icons/plus";
import type { Ws } from "./useWorkspaceSwitcher";

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
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const slug = getSlugFromPath(pathname || "");
  const {
    all,
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
        <DropdownMenuTrigger className="w-full cursor-pointer">
          <div className="group flex items-center gap-2 rounded-md px-1.5 py-1.5 text-md text-accent hover:bg-muted dark:hover:bg-black/40 cursor-pointer">
            <div className={cn("relative size-6 rounded-md border ring-1 ring-border overflow-hidden", currentLogo ? "bg-transparent" : "bg-muted")}>
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
            <span className="transition-colors">{currentName}</span>
            <ChevronIcon className="ml-auto size-3 text-foreground/80 transition-colors" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-40 max-w-[95vw] max-h-[80vh] overflow-auto p-2"
          side="bottom"
          align="center"
          sideOffset={8}
        >
          {all.length === 0 ? (
            <DropdownMenuItem disabled>No workspaces yet</DropdownMenuItem>
          ) : (
            <div className="flex flex-col gap-1">
              {all.map((w) => {
                const logoUrl: string | null = w.logo ?? null;
                const isCurrent = w.slug === slug;
                return (
                  <DropdownMenuItem
                    key={w.slug}
                    onSelect={() => onSelectWorkspace(w.slug)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 rounde-sm",
                      isCurrent ? "bg-muted" : "hover:bg-muted dark:hover:bg-black/40"
                    )}
                  >
                    {logoUrl ? (
                      <div className="relative w-6 h-6 rounded-md bg-muted border ring-1 ring-border overflow-hidden">
                        <Image
                          src={logoUrl}
                          alt={w.name}
                          fill
                          sizes="24px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-muted border ring-1 ring-border" />
                    )}
                    <span className="truncate text-md">{w.name}</span>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuItem
                onSelect={onCreateNew}
                className="text-sm flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted dark:hover:bg-black/40"
              >
                <PlusIcon className="size-4" />
                Add workspace
              </DropdownMenuItem>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
