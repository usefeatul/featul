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
import { normalizePlan, type PlanKey } from "@/lib/plan";

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
  const currentPlan = wsInfo?.plan || current?.plan || "free";

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
          <div className="group grid min-h-11 cursor-pointer grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-md px-3 py-2 transition-colors hover:bg-muted/60">
            <div className={cn("relative size-8 justify-self-center overflow-hidden rounded-md border border-border/60 bg-card", currentLogo ? "bg-transparent" : "")}>
              {currentLogo ? (
                <Image
                  src={currentLogo}
                  alt={currentName}
                  fill
                  sizes="32px"
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-col items-start gap-1 overflow-hidden">
              <span className="truncate text-sm font-medium leading-none text-foreground">{currentName}</span>
              <PlanText plan={currentPlan} className="text-[11px]" />
            </div>
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center justify-self-end rounded-sm border border-border/60 bg-card text-accent/80 transition-colors group-hover:border-border/80 group-hover:text-accent">
              <ChevronIcon className="size-3.5" />
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-46 max-w-[95vw] p-2"
          side="bottom"
          align="center"
          sideOffset={8}
          withBackdrop
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
                          <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded-md border border-border bg-muted ring-1 ring-border/30">
                            <Image
                              src={logoUrl}
                              alt={w.name}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 shrink-0 rounded-md border border-border bg-muted ring-1 ring-border/30" />
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-sm font-medium">{w.name}</span>
                          <PlanText plan={w.plan || "free"} className="mt-1 text-xs" />
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

function PlanText({
  plan,
  className,
}: {
  plan?: string | null;
  className?: string;
}) {
  const normalizedPlan = normalizePlan(plan || "free");

  return (
    <span
      className={cn(
        "font-light capitalize leading-none",
        getPlanTextClassName(normalizedPlan),
        className,
      )}
    >
      {normalizedPlan}
    </span>
  );
}

function getPlanTextClassName(plan: PlanKey) {
  if (plan === "free") {
    return "text-green-600 dark:text-green-400";
  }

  if (plan === "starter") {
    return "text-primary";
  }

  if (plan === "professional") {
    return "text-orange-600 dark:text-orange-400";
  }

  return "text-muted-foreground";
}
