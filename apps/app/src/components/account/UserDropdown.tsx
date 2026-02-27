"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@featul/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@featul/ui/components/dialog";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@featul/ui/components/avatar";
import { authClient } from "@featul/auth/client";
import { toast } from "sonner";
import { getSlugFromPath } from "@/config/nav";
import { client } from "@featul/api/client";
import { useQueryClient } from "@tanstack/react-query";
import SignIn from "@/components/auth/SignIn";
import SignUp from "@/components/auth/SignUp";
import type { AuthMode } from "@/types/auth";
import { useCloseThenOpenAuth } from "@/hooks/useCloseThenOpenAuth";
import AccountActionsPopover, {
  type AccountActionsPopoverHandle,
} from "./AccountActionsPopover";
import UserDropdownMenu from "./UserDropdownMenu";
import UserDropdownQuickSwitch from "./UserDropdownQuickSwitch";
import { useUserDropdownData } from "./useUserDropdownData";
import { useWorkspaceNavigation } from "./useWorkspaceNavigation";
import { accountQueryKeys } from "./query-keys";
import type { DeviceAccount, UserDropdownAccount, UserIdentity } from "./types";
import { MAX_DEVICE_ACCOUNTS } from "./constants";

export default function UserDropdown({
  className = "",
  initialUser,
  initialDeviceAccounts,
}: {
  className?: string;
  initialUser?: UserIdentity;
  initialDeviceAccounts?: DeviceAccount[];
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname() || "/";
  const slug = React.useMemo(() => {
    const parts = (pathname || "/").split("/");
    if (parts[1] !== "workspaces") return getSlugFromPath(pathname);
    const maybe = parts[2] || "";
    if (!maybe || maybe === "account/" || maybe === "new") return "";
    return maybe;
  }, [pathname]);

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [switchingAccountUserId, setSwitchingAccountUserId] = React.useState<
    string | null
  >(null);
  const [removingAccountUserId, setRemovingAccountUserId] = React.useState<
    string | null
  >(null);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<AuthMode>("sign-in");
  const [authRedirectTo, setAuthRedirectTo] = React.useState(pathname);
  const nextAuthRedirectRef = React.useRef<string | null>(null);
  const accountActionsPopoverRef =
    React.useRef<AccountActionsPopoverHandle | null>(null);

  const { displayUser, initials, accounts, showAccounts } = useUserDropdownData(
    {
      initialUser,
      initialDeviceAccounts,
    },
  );
  const { navigateAfterSwitch, navigateToAccountProfile } =
    useWorkspaceNavigation(slug);

  const openAuthModal = React.useCallback(
    (mode: AuthMode) => {
      const currentPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : pathname;
      const redirectTo =
        nextAuthRedirectRef.current || currentPath || pathname || "/start";
      nextAuthRedirectRef.current = null;
      setAuthRedirectTo(redirectTo);
      setAuthMode(mode);
      setAuthModalOpen(true);
    },
    [pathname],
  );

  const { closeThenOpenAuth } = useCloseThenOpenAuth({
    closeCurrent: () => setOpen(false),
    openAuth: openAuthModal,
  });

  const onSwitchAccount = React.useCallback(
    async (userId: string) => {
      if (switchingAccountUserId || removingAccountUserId || !userId) return;
      if (
        accounts.some(
          (account) => account.userId === userId && account.isCurrent,
        )
      ) {
        setOpen(false);
        return;
      }

      setSwitchingAccountUserId(userId);
      accountActionsPopoverRef.current?.close();
      const toastId = toast.loading("Switching account...");
      try {
        const response = await client.account.switchDeviceAccount.$post({
          userId,
        });
        if (!response.ok) {
          throw new Error("Failed to switch account");
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: accountQueryKeys.me }),
          queryClient.invalidateQueries({
            queryKey: accountQueryKeys.meSidebar,
          }),
          queryClient.invalidateQueries({
            queryKey: accountQueryKeys.workspaces,
          }),
          queryClient.invalidateQueries({
            queryKey: accountQueryKeys.deviceAccountsSidebar,
          }),
        ]);

        toast.success("Account switched", { id: toastId });
        setOpen(false);
        await navigateAfterSwitch();
      } catch {
        toast.error("Failed to switch account", { id: toastId });
      } finally {
        setSwitchingAccountUserId(null);
      }
    },
    [
      switchingAccountUserId,
      removingAccountUserId,
      accounts,
      navigateAfterSwitch,
      queryClient,
    ],
  );

  const onRemoveAccount = React.useCallback(
    async (account: UserDropdownAccount) => {
      if (switchingAccountUserId || removingAccountUserId) return;
      if (!account?.userId || account.isCurrent) return;

      setRemovingAccountUserId(account.userId);
      const toastId = toast.loading("Removing account...");
      try {
        const response = await client.account.removeDeviceAccount.$post({
          userId: account.userId,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          throw new Error(payload?.message || "Failed to remove account");
        }

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: accountQueryKeys.deviceAccountsSidebar,
          }),
          queryClient.invalidateQueries({
            queryKey: accountQueryKeys.meSidebar,
          }),
        ]);

        toast.success("Account removed", { id: toastId });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to remove account";
        toast.error(message, { id: toastId });
      } finally {
        setRemovingAccountUserId(null);
      }
    },
    [switchingAccountUserId, removingAccountUserId, queryClient],
  );

  const onOpenAccountActions = React.useCallback(
    (event: React.MouseEvent<HTMLElement>, account: UserDropdownAccount) => {
      accountActionsPopoverRef.current?.open(event, account);
    },
    [],
  );

  const onAccount = React.useCallback(async () => {
    setOpen(false);
    await navigateToAccountProfile();
  }, [navigateToAccountProfile]);

  const onSignOut = React.useCallback(async () => {
    if (loading || switchingAccountUserId || removingAccountUserId) return;

    setLoading(true);
    try {
      await authClient.signOut();
      toast.success("Signed out");
      router.replace("/auth/sign-in");
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setLoading(false);
    }
  }, [router, loading, switchingAccountUserId, removingAccountUserId]);

  React.useEffect(() => {
    if (!authModalOpen) {
      void queryClient.invalidateQueries({
        queryKey: accountQueryKeys.meSidebar,
      });
      void queryClient.invalidateQueries({
        queryKey: accountQueryKeys.deviceAccountsSidebar,
      });
    }
  }, [authModalOpen, queryClient]);

  const onOpenAddAccount = React.useCallback(() => {
    void (async () => {
      if (accounts.length >= MAX_DEVICE_ACCOUNTS) {
        toast.error(`You can connect up to ${MAX_DEVICE_ACCOUNTS} accounts`);
        return;
      }

      try {
        const response = await client.account.bootstrapDeviceSession.$post();
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          throw new Error(
            payload?.message ||
              `You can connect up to ${MAX_DEVICE_ACCOUNTS} accounts`,
          );
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : `You can connect up to ${MAX_DEVICE_ACCOUNTS} accounts`;
        toast.error(message);
        return;
      }
      // Add-account should always land on a workspace accessible to the new
      // active account, not the previous account's current workspace.
      nextAuthRedirectRef.current = "/start";
      closeThenOpenAuth("sign-in");
    })();
  }, [accounts.length, closeThenOpenAuth]);

  const isBusy = Boolean(switchingAccountUserId || removingAccountUserId);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-1">
        <div className="min-w-0 flex-1">
          <DropdownMenu
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen);
              if (!nextOpen) {
                accountActionsPopoverRef.current?.close();
              }
            }}
          >
            <DropdownMenuTrigger asChild className="w-full cursor-pointer">
              <button
                suppressHydrationWarning
                type="button"
                className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs md:text-sm text-accent hover:bg-muted dark:hover:bg-black/40"
              >
                <div className="ml-1 overflow-hidden">
                  <Avatar className="size-5.5">
                    {displayUser.image ? (
                      <AvatarImage
                        src={displayUser.image}
                        alt={displayUser.name}
                      />
                    ) : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="truncate transition-colors">
                  {displayUser.name || "Account"}
                </span>
              </button>
            </DropdownMenuTrigger>

            <UserDropdownMenu
              showAccounts={showAccounts}
              accounts={accounts}
              switchingAccountUserId={switchingAccountUserId}
              removingAccountUserId={removingAccountUserId}
              loading={loading}
              onAccount={onAccount}
              onSignOut={onSignOut}
              onOpenAddAccount={onOpenAddAccount}
              onSwitchAccount={onSwitchAccount}
              onOpenAccountActions={onOpenAccountActions}
            />
          </DropdownMenu>
        </div>

        <UserDropdownQuickSwitch
          accounts={accounts}
          switchingAccountUserId={switchingAccountUserId}
          removingAccountUserId={removingAccountUserId}
          onSwitchAccount={onSwitchAccount}
          onOpenMenu={() => setOpen(true)}
          onOpenAccountActions={onOpenAccountActions}
        />
      </div>

      <AccountActionsPopover
        ref={accountActionsPopoverRef}
        accounts={accounts}
        isBusy={isBusy}
        removingAccountUserId={removingAccountUserId}
        onSwitchAccount={onSwitchAccount}
        onRemoveAccount={onRemoveAccount}
      />

      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent
          fluid
          showCloseButton={false}
          className="bg-transparent border-none shadow-none ring-0 ring-offset-0 p-2"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              {authMode === "sign-in" ? "Add account" : "Create account"}
            </DialogTitle>
          </DialogHeader>
          <div className="w-[min(90vw,400px)] max-h-[66vh] overflow-y-auto rounded-2xl bg-background border border-border shadow-xl">
            {authMode === "sign-in" ? (
              <SignIn
                redirectTo={authRedirectTo}
                embedded
                onSwitchMode={() => setAuthMode("sign-up")}
              />
            ) : (
              <SignUp
                redirectTo={authRedirectTo}
                embedded
                onSwitchMode={() => setAuthMode("sign-in")}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
