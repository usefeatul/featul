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
import UserDropdownMenu from "./UserDropdownMenu";
import UserDropdownQuickSwitch from "./UserDropdownQuickSwitch";
import { useUserDropdownData } from "./useUserDropdownData";
import { useWorkspaceNavigation } from "./useWorkspaceNavigation";

export default function UserDropdown({
  className = "",
  initialUser,
}: {
  className?: string;
  initialUser?: { name?: string; email?: string; image?: string | null };
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
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<AuthMode>("sign-in");
  const [authRedirectTo, setAuthRedirectTo] = React.useState(pathname);
  const nextAuthRedirectRef = React.useRef<string | null>(null);

  const { currentSession, displayUser, initials, accounts, showAccounts } =
    useUserDropdownData({ initialUser });
  const {
    navigateAfterSwitch,
    navigateToAccountProfile,
    navigateToBrandingSettings,
  } = useWorkspaceNavigation(slug);

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
      if (switchingAccountUserId || !userId) return;
      if (accounts.some((account) => account.userId === userId && account.isCurrent)) {
        setOpen(false);
        return;
      }

      setSwitchingAccountUserId(userId);
      const toastId = toast.loading("Switching account...");
      try {
        const response = await client.account.switchDeviceAccount.$post({
          userId,
        });
        if (!response.ok) {
          throw new Error("Failed to switch account");
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["me"] }),
          queryClient.invalidateQueries({ queryKey: ["me", "sidebar"] }),
          queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
          queryClient.invalidateQueries({
            queryKey: ["multi-session", "sidebar"],
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
    [switchingAccountUserId, accounts, navigateAfterSwitch, queryClient],
  );

  const onAccount = React.useCallback(async () => {
    setOpen(false);
    await navigateToAccountProfile();
  }, [navigateToAccountProfile]);

  const onSettings = React.useCallback(async () => {
    setOpen(false);
    await navigateToBrandingSettings();
  }, [navigateToBrandingSettings]);

  const onSignOut = React.useCallback(async () => {
    if (loading || switchingAccountUserId) return;

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
  }, [router, loading, switchingAccountUserId]);

  React.useEffect(() => {
    if (!authModalOpen) {
      void queryClient.invalidateQueries({ queryKey: ["me", "sidebar"] });
      void queryClient.invalidateQueries({
        queryKey: ["multi-session", "sidebar"],
      });
    }
  }, [authModalOpen, queryClient]);

  const onOpenAddAccount = React.useCallback(() => {
    void (async () => {
      try {
        await client.account.bootstrapDeviceSession.$post();
      } catch {
        // Non-blocking: still allow adding another account.
      }
      // Add-account should always land on a workspace accessible to the new
      // active account, not the previous account's current workspace.
      nextAuthRedirectRef.current = "/start";
      closeThenOpenAuth("sign-in");
    })();
  }, [closeThenOpenAuth]);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="min-w-0">
        <DropdownMenu open={open} onOpenChange={setOpen}>
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
            loading={loading}
            onAccount={onAccount}
            onSettings={onSettings}
            onSignOut={onSignOut}
            onOpenAddAccount={onOpenAddAccount}
            onSwitchAccount={onSwitchAccount}
          />
        </DropdownMenu>
      </div>

      <UserDropdownQuickSwitch
        accounts={accounts}
        switchingAccountUserId={switchingAccountUserId}
        onSwitchAccount={onSwitchAccount}
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
