import type {
  CurrentSessionState,
  DeviceAccount,
  UserDropdownAccount,
} from "../types";

/** Normalize device-account list payloads. Drop rows without a userId. */
export function normalizeDeviceAccountsPayload(
  payload: unknown,
): DeviceAccount[] {
  const accounts = Array.isArray(
    (payload as { accounts?: unknown[] } | null)?.accounts,
  )
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

/** Deduped account list. Inject current session if missing. Current first. */
export function buildAccountsList({
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
    const isCurrent =
      account.isCurrent ||
      (Boolean(currentUserId) && account.userId === currentUserId);
    const useLiveIdentity = Boolean(isCurrent && currentSession?.user);
    accounts.push({
      userId: account.userId,
      name: useLiveIdentity ? fallbackName || account.name : account.name,
      image: useLiveIdentity ? fallbackImage : account.image,
      isCurrent,
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

  return accounts.sort(
    (left, right) => Number(right.isCurrent) - Number(left.isCurrent),
  );
}
