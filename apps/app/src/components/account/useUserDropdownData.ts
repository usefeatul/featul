"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@featul/auth/client";
import { client } from "@featul/api/client";
import { getDisplayUser, getInitials } from "@/utils/user";
import { accountQueryKeys } from "./keys";
import {
  buildAccountsList,
  normalizeDeviceAccountsPayload,
} from "./device/utils";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Narrow session `user` from better-auth payloads. Missing user → null. */
function toSessionUser(payload: unknown): SessionUser | null {
  if (!isRecord(payload)) return null;
  const userRaw = payload.user;
  if (!isRecord(userRaw)) return null;

  const id = typeof userRaw.id === "string" ? userRaw.id : undefined;
  const name = typeof userRaw.name === "string" ? userRaw.name : undefined;
  const email =
    typeof userRaw.email === "string" ? userRaw.email : undefined;
  const image =
    typeof userRaw.image === "string" || userRaw.image === null
      ? userRaw.image
      : undefined;

  return { id, name, email, image };
}

/** Session user plus device accounts for the account dropdown. */
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
        isRecord(session) && "data" in session
          ? (session as { data?: unknown }).data
          : session;
      const user = toSessionUser(payload);
      const userId = user?.id ?? null;

      return { user, userId };
    },
    initialData: () => ({
      user: initialUser ? ({ ...initialUser } as SessionUser) : null,
      userId: null,
    }),
    placeholderData: (prev) => prev,
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

  const { data: meData } = useQuery<{ user: SessionUser | null }>({
    queryKey: accountQueryKeys.me,
    queryFn: async () => {
      const session = await authClient.getSession();
      const payload =
        isRecord(session) && "data" in session
          ? (session as { data?: unknown }).data
          : session;
      return { user: toSessionUser(payload) };
    },
    initialData: () => ({
      user: initialUser ? ({ ...initialUser } as SessionUser) : null,
    }),
    placeholderData: (prev) => prev,
    staleTime: 300_000,
    gcTime: 900_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: false,
  });

  const user = React.useMemo(() => {
    const sidebarUser = currentSession?.user || null;
    const meUser = meData?.user || null;
    if (sidebarUser && meUser) {
      const sameId =
        Boolean(sidebarUser.id) &&
        Boolean(meUser.id) &&
        sidebarUser.id === meUser.id;
      const sameEmail =
        Boolean(sidebarUser.email) &&
        Boolean(meUser.email) &&
        sidebarUser.email === meUser.email;
      if (sameId || sameEmail || (!sidebarUser.id && !meUser.id)) {
        return {
          ...sidebarUser,
          ...meUser,
          id: meUser.id || sidebarUser.id,
          email: meUser.email || sidebarUser.email,
        };
      }
    }
    return sidebarUser || meUser;
  }, [currentSession?.user, meData?.user]);
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
