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
import { getInitials, getDisplayUser } from "@/utils/user";
import { getSlugFromPath } from "@/config/nav";
import { client } from "@featul/api/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SignIn from "@/components/auth/SignIn";
import SignUp from "@/components/auth/SignUp";
import type { AuthMode } from "@/types/auth";
import { useCloseThenOpenAuth } from "@/hooks/useCloseThenOpenAuth";
import UserDropdownMenu, { type UserDropdownAccount } from "./UserDropdownMenu";
import UserDropdownQuickSwitch from "./UserDropdownQuickSwitch";

type SessionUser = {
  id?: string;
  name?: string;
  email?: string;
  image?: string | null;
};

type CurrentSessionState = {
  user: SessionUser | null;
  userId: string | null;
};

type DeviceAccount = {
  userId: string;
  name: string;
  image: string;
  isCurrent: boolean;
};

type WorkspaceLite = {
  slug?: string;
};

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

  const { data: currentSession } = useQuery<CurrentSessionState>({
    queryKey: ["me", "sidebar"],
    queryFn: async () => {
      const s = await authClient.getSession();
      const payload = s && typeof s === "object" && "data" in s ? s.data : s;
      const user = (payload as any)?.user || null;
      const userId =
        typeof (payload as any)?.user?.id === "string"
          ? String((payload as any).user.id)
          : null;
      return { user, userId };
    },
    initialData: () => ({
      user: (initialUser as SessionUser) || null,
      userId: null,
    }),
    placeholderData: (prev) => prev as any,
    staleTime: 60_000,
    gcTime: 900_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: true,
  });

  const { data: deviceAccounts = [] } = useQuery<DeviceAccount[]>({
    queryKey: ["multi-session", "sidebar"],
    queryFn: async () => {
      const response = await client.account.listDeviceAccounts.$get();
      if (!response.ok) return [];

      const payload = (await response.json().catch(() => null)) as {
        accounts?: Array<{
          userId?: string;
          name?: string;
          image?: string;
          isCurrent?: boolean;
        }>;
      } | null;

      const items = Array.isArray(payload?.accounts) ? payload.accounts : [];
      return items
        .map((item) => {
          const userId = String(item?.userId || "").trim();
          if (!userId) return null;

          const name = String(item?.name || "Account").trim() || "Account";
          const image = typeof item?.image === "string" ? item.image : "";
          const isCurrent = Boolean(item?.isCurrent);

          return {
            userId,
            name,
            image,
            isCurrent,
          } satisfies DeviceAccount;
        })
        .filter((value): value is DeviceAccount => Boolean(value));
    },
    enabled: true,
    placeholderData: (prev) => prev || [],
    staleTime: 30_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const user = currentSession?.user || null;
  const displayUser = getDisplayUser(user || undefined);
  const initials = getInitials(displayUser.name || "U");
  const currentUserId = String(currentSession?.userId || "").trim();

  const openAuthModal = React.useCallback(
    (mode: AuthMode) => {
      const currentPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : pathname;
      setAuthRedirectTo(currentPath || pathname || "/start");
      setAuthMode(mode);
      setAuthModalOpen(true);
    },
    [pathname],
  );

  const { closeThenOpenAuth } = useCloseThenOpenAuth({
    closeCurrent: () => setOpen(false),
    openAuth: openAuthModal,
  });

  const accounts = React.useMemo<UserDropdownAccount[]>(() => {
    const seenUserIds = new Set<string>();
    const next: UserDropdownAccount[] = [];

    for (const account of deviceAccounts) {
      if (!account.userId || seenUserIds.has(account.userId)) continue;
      seenUserIds.add(account.userId);
      next.push({
        userId: account.userId,
        name: account.name,
        image: account.image,
        isCurrent: account.isCurrent,
      });
    }

    const hasCurrentAccount = next.some((account) => account.isCurrent);
    if (!hasCurrentAccount && currentSession?.user) {
      next.unshift({
        userId: currentUserId || "__current__",
        name: displayUser.name || "Account",
        image: displayUser.image || "",
        isCurrent: true,
      });
    }

    return next.sort((left, right) => Number(right.isCurrent) - Number(left.isCurrent));
  }, [deviceAccounts, currentUserId, currentSession?.user, displayUser.name, displayUser.image]);

  const showAccounts = accounts.length > 0 || Boolean(currentSession?.user);

  const getWorkspaceSlugs = React.useCallback(async () => {
    const response = await client.workspace.listMine.$get();
    const payload = (await response.json().catch(() => null)) as {
      workspaces?: WorkspaceLite[];
    } | null;
    const workspaces = Array.isArray(payload?.workspaces) ? payload.workspaces : [];
    return workspaces
      .map((workspace) => String(workspace?.slug || "").trim())
      .filter(Boolean);
  }, []);

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

        const accessibleSlugs = await getWorkspaceSlugs();
        const targetSlug = accessibleSlugs.includes(slug)
          ? slug
          : accessibleSlugs[0] || "";

        toast.success("Account switched", { id: toastId });
        setOpen(false);

        if (targetSlug) {
          router.push(`/workspaces/${targetSlug}`);
        } else {
          router.push("/workspaces/new");
        }
      } catch {
        toast.error("Failed to switch account", { id: toastId });
      } finally {
        setSwitchingAccountUserId(null);
      }
    },
    [switchingAccountUserId, accounts, getWorkspaceSlugs, router, slug, queryClient],
  );

  const getFirstWorkspaceSlug = React.useCallback(async () => {
    const slugs = await getWorkspaceSlugs();
    return slugs[0] || "";
  }, [getWorkspaceSlugs]);

  const onAccount = React.useCallback(async () => {
    setOpen(false);
    if (slug) {
      router.push(`/workspaces/${slug}/account/profile`);
      return;
    }
    try {
      const firstSlug = await getFirstWorkspaceSlug();
      if (firstSlug) {
        router.push(`/workspaces/${firstSlug}/account/profile`);
      } else {
        router.push("/workspaces/new");
      }
    } catch {
      router.push("/workspaces/new");
    }
  }, [router, slug, getFirstWorkspaceSlug]);

  const onSettings = React.useCallback(async () => {
    setOpen(false);
    if (slug) {
      router.push(`/workspaces/${slug}/settings/branding`);
      return;
    }
    try {
      const firstSlug = await getFirstWorkspaceSlug();
      if (firstSlug) {
        router.push(`/workspaces/${firstSlug}/settings/branding`);
      } else {
        router.push("/workspaces/new");
      }
    } catch {
      router.push("/workspaces/new");
    }
  }, [router, slug, getFirstWorkspaceSlug]);

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
    closeThenOpenAuth("sign-in");
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
