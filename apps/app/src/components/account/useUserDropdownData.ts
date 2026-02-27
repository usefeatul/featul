"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@featul/auth/client";
import { client } from "@featul/api/client";
import { getDisplayUser, getInitials } from "@/utils/user";
import { accountQueryKeys } from "./query-keys";
import {
  buildAccountsList,
  normalizeDeviceAccountsPayload,
} from "./device-account-utils";
import type {
  CurrentSessionState,
  DeviceAccount,
  SessionUser,
  UserIdentity,
} from "./types";

type UseUserDropdownDataProps = {
  initialUser?: UserIdentity;
  initialDeviceAccounts?: DeviceAccount[];
};

export function useUserDropdownData({
  initialUser,
  initialDeviceAccounts = [],
}: UseUserDropdownDataProps) {
  const normalizedInitialDeviceAccounts = React.useMemo(
    () => normalizeDeviceAccountsPayload({ accounts: initialDeviceAccounts }),
    [initialDeviceAccounts],
  );

  const { data: currentSession } = useQuery<CurrentSessionState>({
    queryKey: accountQueryKeys.meSidebar,
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

  const { data: deviceAccounts = normalizedInitialDeviceAccounts } = useQuery<
    DeviceAccount[]
  >({
    queryKey: accountQueryKeys.deviceAccountsSidebar,
    queryFn: async () => {
      const response = await client.account.listDeviceAccounts.$get();
      if (!response.ok) {
        throw new Error("Failed to load device accounts");
      }
      const payload = await response.json().catch(() => null);
      return normalizeDeviceAccountsPayload(payload);
    },
    initialData: normalizedInitialDeviceAccounts,
    enabled: true,
    placeholderData: (prev) => prev || normalizedInitialDeviceAccounts,
    staleTime: 30_000,
    refetchOnMount: "always",
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
