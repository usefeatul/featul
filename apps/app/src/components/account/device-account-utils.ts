import type {
  CurrentSessionState,
  DeviceAccount,
  UserDropdownAccount,
} from "./types";

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

  return accounts.sort(
    (left, right) => Number(right.isCurrent) - Number(left.isCurrent),
  );
}
