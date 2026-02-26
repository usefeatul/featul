"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@featul/auth/client";
import { client } from "@featul/api/client";
import { getDisplayUser, getInitials } from "@/utils/user";
import type { UserDropdownAccount } from "./UserDropdownMenu";

export type SessionUser = {
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

type UseUserDropdownDataProps = {
  initialUser?: { name?: string; email?: string; image?: string | null };
};

function normalizeDeviceAccountsPayload(payload: unknown): DeviceAccount[] {
  const accounts = Array.isArray((payload as { accounts?: unknown[] } | null)?.accounts)
    ? ((payload as { accounts?: unknown[] }).accounts as unknown[])
    : [];

  return accounts
    .map((item) => {
      const value = (item || {}) as {
        userId?: string;
        name?: string;
        image?: string;
        isCurrent?: boolean;
      };

      const userId = String(value.userId || "").trim();
      if (!userId) return null;

      const name = String(value.name || "Account").trim() || "Account";
      const image = typeof value.image === "string" ? value.image : "";
      const isCurrent = Boolean(value.isCurrent);

      return {
        userId,
        name,
        image,
        isCurrent,
      } satisfies DeviceAccount;
    })
    .filter((value): value is DeviceAccount => Boolean(value));
}

function buildAccountsList({
  deviceAccounts,
  currentSession,
  currentUserId,
  fallbackName,
  fallbackImage,
}: {
  deviceAccounts: DeviceAccount[];
  currentSession: CurrentSessionState | undefined;
  currentUserId: string;
  fallbackName: string;
  fallbackImage: string;
}): UserDropdownAccount[] {
  const seenUserIds = new Set<string>();
  const accounts: UserDropdownAccount[] = [];

  for (const account of deviceAccounts) {
    if (!account.userId || seenUserIds.has(account.userId)) continue;
    seenUserIds.add(account.userId);
    accounts.push({
      userId: account.userId,
      name: account.name,
      image: account.image,
      isCurrent: account.isCurrent,
    });
  }

  if (!accounts.some((account) => account.isCurrent) && currentSession?.user) {
    accounts.unshift({
      userId: currentUserId || "__current__",
      name: fallbackName || "Account",
      image: fallbackImage || "",
      isCurrent: true,
    });
  }

  return accounts.sort((left, right) => Number(right.isCurrent) - Number(left.isCurrent));
}

export function useUserDropdownData({ initialUser }: UseUserDropdownDataProps) {
  const { data: currentSession } = useQuery<CurrentSessionState>({
    queryKey: ["me", "sidebar"],
    queryFn: async () => {
      const session = await authClient.getSession();
      const payload =
        session && typeof session === "object" && "data" in session
          ? session.data
          : session;

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
      const payload = await response.json().catch(() => null);
      return normalizeDeviceAccountsPayload(payload);
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

  const accounts = React.useMemo(
    () =>
      buildAccountsList({
        deviceAccounts,
        currentSession,
        currentUserId,
        fallbackName: displayUser.name || "Account",
        fallbackImage: displayUser.image || "",
      }),
    [
      deviceAccounts,
      currentSession,
      currentUserId,
      displayUser.name,
      displayUser.image,
    ],
  );

  return {
    currentSession,
    displayUser,
    initials,
    accounts,
    showAccounts: accounts.length > 0 || Boolean(currentSession?.user),
  };
}
