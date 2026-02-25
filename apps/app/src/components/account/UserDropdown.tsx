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
  sessionToken: string | null;
  userId: string | null;
};

type DeviceAccount = {
  sessionToken: string;
  userId: string;
  name: string;
  email: string;
  image: string;
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
  const [switchingToken, setSwitchingToken] = React.useState<string | null>(
    null,
  );
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<AuthMode>("sign-in");
  const [authRedirectTo, setAuthRedirectTo] = React.useState(pathname);

  const { data: currentSession } = useQuery<CurrentSessionState>({
    queryKey: ["me", "sidebar"],
    queryFn: async () => {
      const s = await authClient.getSession();
      const payload = s && typeof s === "object" && "data" in s ? s.data : s;
      const user = (payload as any)?.user || null;
      const sessionToken =
        typeof (payload as any)?.session?.token === "string"
          ? String((payload as any).session.token)
          : null;
      const userId =
        typeof (payload as any)?.user?.id === "string"
          ? String((payload as any).user.id)
          : null;
      return { user, sessionToken, userId };
    },
    initialData: () => ({
      user: (initialUser as SessionUser) || null,
      sessionToken: null,
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
      const res = await authClient.multiSession.listDeviceSessions({});
      const payload =
        res && typeof res === "object" && "data" in res ? res.data : res;
      if (!Array.isArray(payload)) return [];
      return payload
        .map((item) => {
          const sessionToken = String(
            (item as any)?.session?.token || "",
          ).trim();
          if (!sessionToken) return null;
          const user = ((item as any)?.user || {}) as SessionUser;
          const userId = String(user.id || "").trim();
          const email = String(user.email || "").trim();
          const name =
            String(user.name || email.split("@")[0] || "Account").trim() ||
            "Account";
          const image = typeof user.image === "string" ? user.image : "";
          return {
            sessionToken,
            userId,
            name,
            email,
            image,
          } satisfies DeviceAccount;
        })
        .filter((v): v is DeviceAccount => Boolean(v));
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

  const currentSessionToken = String(currentSession?.sessionToken || "");
  const currentUserId = String(currentSession?.userId || "");
  const currentEmail = String(currentSession?.user?.email || "")
    .trim()
    .toLowerCase();

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
    const merged = [...deviceAccounts];
    const currentDisplay = getDisplayUser(currentSession?.user || undefined);

    const hasCurrentInList = merged.some((account) => {
      const sameToken =
        Boolean(currentSessionToken) &&
        account.sessionToken === currentSessionToken;
      const sameUser =
        Boolean(currentUserId) && account.userId === currentUserId;
      const sameEmail =
        Boolean(currentEmail) && account.email.toLowerCase() === currentEmail;
      return sameToken || sameUser || sameEmail;
    });

    if (!hasCurrentInList && currentSession?.user) {
      merged.unshift({
        sessionToken:
          currentSessionToken ||
          `current-${currentUserId || currentEmail || "session"}`,
        userId: currentUserId,
        name: currentDisplay.name || "Account",
        email: currentDisplay.email || "",
        image: currentDisplay.image || "",
      });
    }

    const next = merged.map((account) => {
      const sameToken =
        Boolean(currentSessionToken) &&
        account.sessionToken === currentSessionToken;
      const sameUser =
        Boolean(currentUserId) && account.userId === currentUserId;
      const sameEmail =
        Boolean(currentEmail) && account.email.toLowerCase() === currentEmail;

      return {
        sessionToken: account.sessionToken,
        name: account.name,
        email: account.email,
        image: account.image,
        isCurrent: sameToken || sameUser || sameEmail,
      };
    });

    return next.sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
  }, [
    deviceAccounts,
    currentSession,
    currentSessionToken,
    currentUserId,
    currentEmail,
  ]);

  const showAccounts = accounts.length > 0 || Boolean(currentSession?.user);

  const onSwitchAccount = React.useCallback(
    async (sessionToken: string) => {
      if (switchingToken || !sessionToken) return;
      if (currentSessionToken && sessionToken === currentSessionToken) {
        setOpen(false);
        return;
      }

      setSwitchingToken(sessionToken);
      const toastId = toast.loading("Switching account...");
      try {
        const result = await authClient.multiSession.setActive({
          sessionToken,
        });
        const error = (result as any)?.error;
        if (error) {
          throw new Error(String(error.message || "Failed to switch account"));
        }

        const payload =
          result && typeof result === "object" && "data" in result
            ? result.data
            : result;
        const switchedUser = ((payload as any)?.user ||
          null) as SessionUser | null;
        const switchedToken =
          typeof (payload as any)?.session?.token === "string"
            ? String((payload as any).session.token)
            : sessionToken;
        const switchedUserId =
          typeof (payload as any)?.user?.id === "string"
            ? String((payload as any).user.id)
            : null;

        queryClient.setQueryData(["me", "sidebar"], {
          user: switchedUser,
          sessionToken: switchedToken,
          userId: switchedUserId,
        } satisfies CurrentSessionState);
        queryClient.setQueryData(["me"], { user: switchedUser });

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["me"] }),
          queryClient.invalidateQueries({ queryKey: ["me", "sidebar"] }),
          queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
          queryClient.invalidateQueries({
            queryKey: ["multi-session", "sidebar"],
          }),
        ]);

        const mineRes = await client.workspace.listMine.$get();
        const mineData = (await mineRes.json().catch(() => null)) as {
          workspaces?: WorkspaceLite[];
        } | null;

        const workspaces = Array.isArray(mineData?.workspaces)
          ? mineData.workspaces
          : [];
        const accessibleSlugs = workspaces
          .map((w) => String(w?.slug || "").trim())
          .filter(Boolean);
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
        setSwitchingToken(null);
      }
    },
    [switchingToken, currentSessionToken, router, slug, queryClient],
  );

  const getFirstWorkspaceSlug = React.useCallback(async () => {
    const res = await client.workspace.listMine.$get();
    const data = (await res.json().catch(() => null)) as {
      workspaces?: WorkspaceLite[];
    } | null;
    const list = Array.isArray(data?.workspaces) ? data.workspaces : [];
    return String(list[0]?.slug || "").trim();
  }, []);

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
    if (loading || switchingToken) return;

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
  }, [router, loading, switchingToken]);

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
            switchingToken={switchingToken}
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
        switchingToken={switchingToken}
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
