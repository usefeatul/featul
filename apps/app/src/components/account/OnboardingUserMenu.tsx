"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@featul/ui/components/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import { cn } from "@featul/ui/lib/utils";
import { LogoutIcon } from "@featul/ui/icons/logout";
import { BoardIcon } from "@featul/ui/icons/board";
import { TrashIcon } from "@featul/ui/icons/trash";
import { authClient } from "@featul/auth/client";
import { toast } from "sonner";
import { getDisplayUser, getInitials } from "@/utils/user";
import { randomAvatarUrl } from "@/utils/avatar";
import { fetchUserWorkspaces } from "@/lib/workspace/client";
import { DeleteAccountDialog } from "@/components/account/DeleteAccountDialog";
import type { UserIdentity } from "./types";

const MENU_HOVER_ITEM_CLASS =
  "hover:bg-muted dark:hover:bg-black/40 focus:bg-muted dark:focus:bg-black/40 data-[highlighted]:bg-muted dark:data-[highlighted]:bg-black/40";

export default function OnboardingUserMenu({
  className = "",
  initialUser,
}: {
  className?: string;
  initialUser?: UserIdentity;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [workspaceSlug, setWorkspaceSlug] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    fetchUserWorkspaces()
      .then((workspaces) => {
        if (!mounted) return;
        setWorkspaceSlug(workspaces[0]?.slug || null);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const displayUser = getDisplayUser(initialUser);
  const initials = getInitials(displayUser.name || "U");
  const avatarSrc =
    displayUser.image ||
    randomAvatarUrl(displayUser.email || displayUser.name);

  const onSignOut = React.useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      await authClient.signOut();
      toast.success("Signed out");
      router.replace("/auth/signin");
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setLoading(false);
    }
  }, [loading, router]);

  return (
    <div className={cn("pointer-events-auto", className)}>
      <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            suppressHydrationWarning
            type="button"
            className="inline-flex cursor-pointer items-center rounded-md p-0 text-accent"
            aria-label="Account menu"
          >
            <Avatar className="relative size-6 overflow-visible bg-muted ring-1 ring-border">
              <AvatarImage src={avatarSrc} alt={displayUser.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="pointer-events-auto z-[70] w-48 max-w-[85vw]"
          side="bottom"
          align="start"
          sideOffset={8}
        >
          <DropdownMenuLabel className="px-2.5 py-1.5 font-normal">
            <div className="truncate text-sm text-foreground">
              {displayUser.name}
            </div>
            {displayUser.email ? (
              <div className="truncate text-xs text-accent">
                {displayUser.email}
              </div>
            ) : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaceSlug ? (
            <DropdownMenuItem
              onSelect={() => router.push(`/workspaces/${workspaceSlug}`)}
              className={cn(
                "group flex h-9 items-center gap-2 rounded-md px-2.5",
                MENU_HOVER_ITEM_CLASS,
              )}
            >
              <BoardIcon className="size-4 text-foreground" />
              <span>Workspace</span>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onSelect={onSignOut}
            className={cn(
              "group flex h-9 items-center gap-2 rounded-md px-2.5",
              MENU_HOVER_ITEM_CLASS,
            )}
            aria-disabled={loading}
          >
            <LogoutIcon className="size-4 text-foreground transition-colors group-hover:text-red-500 group-hover:opacity-100" />
            <span className="transition-colors group-hover:text-foreground">
              Sign out
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setDeleteDialogOpen(true)}
            className={cn(
              "group flex h-9 items-center gap-2 rounded-md px-2.5",
              MENU_HOVER_ITEM_CLASS,
            )}
          >
            <TrashIcon className="size-4 text-foreground transition-colors group-hover:text-red-500 group-hover:opacity-100" />
            <span className="transition-colors group-hover:text-foreground">
              Delete account
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
