import { headers } from "next/headers";
import { auth } from "./auth";
import { db, session as sessionTable } from "@featul/db";
import { eq, desc } from "drizzle-orm";

export type SessionData = {
  session?: { token?: string };
  user?: {
    id?: string;
    name?: string;
    email?: string;
    image?: string | null;
    twoFactorEnabled?: boolean;
  };
} | null;

export async function getServerSession(): Promise<SessionData> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session as SessionData;
  } catch {
    return null;
  }
}

export async function listServerSessions(): Promise<
  {
    id: string;
    isCurrent: boolean;
    userAgent?: string | null;
    ipAddress?: string | null;
    createdAt?: string;
    expiresAt?: string;
  }[]
> {
  try {
    const s = await getServerSession();
    const userId = String(s?.user?.id || "").trim();
    const currentToken = String((s as any)?.session?.token || "");
    if (!userId) return [];
    const rows = await db
      .select({
        id: sessionTable.id,
        token: sessionTable.token,
        userAgent: sessionTable.userAgent,
        ipAddress: sessionTable.ipAddress,
        createdAt: sessionTable.createdAt,
        expiresAt: sessionTable.expiresAt,
      })
      .from(sessionTable)
      .where(eq(sessionTable.userId, userId))
      .orderBy(desc(sessionTable.createdAt));
    return rows.map((r) => ({
      id: String(r.id),
      isCurrent: Boolean(currentToken) && String(r.token) === currentToken,
      userAgent: r.userAgent || null,
      ipAddress: r.ipAddress || null,
      createdAt:
        r.createdAt instanceof Date ? r.createdAt.toISOString() : undefined,
      expiresAt:
        r.expiresAt instanceof Date ? r.expiresAt.toISOString() : undefined,
    }));
  } catch {
    return [];
  }
}

export async function listServerAccounts(): Promise<
  { id: string; accountId: string; providerId: string }[]
> {
  try {
    const s = await getServerSession();
    const userId = String(s?.user?.id || "").trim();
    if (!userId) return [];
    const { account } = await import("@featul/db");
    const rows = await db
      .select({
        id: account.id,
        accountId: account.accountId,
        providerId: account.providerId,
      })
      .from(account)
      .where(eq(account.userId, userId));
    return rows.map((r) => ({
      id: String(r.id),
      accountId: String(r.accountId),
      providerId: String(r.providerId),
    }));
  } catch {
    return [];
  }
}

type DeviceSessionEntry = {
  session?: {
    token?: string | null;
  } | null;
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
};

export async function listServerDeviceAccounts(): Promise<
  { userId: string; name: string; image: string; isCurrent: boolean }[]
> {
  try {
    const s = await getServerSession();
    const currentUserId = String(s?.user?.id || "").trim();
    if (!currentUserId) return [];

    const currentToken = String((s as any)?.session?.token || "").trim();
    const currentName =
      String(s?.user?.name || s?.user?.email || "Account").trim() || "Account";
    const currentImage = typeof s?.user?.image === "string" ? s.user.image : "";

    const headersList = await headers();
    const raw = await auth.api
      .listDeviceSessions({
        headers: headersList,
      })
      .catch(() => []);

    const deviceSessions = Array.isArray(raw)
      ? (raw as DeviceSessionEntry[])
      : [];
    const seenUserIds = new Set<string>();

    const accounts = deviceSessions
      .map((entry) => {
        const userId = String(entry?.user?.id || "").trim();
        const sessionToken = String(entry?.session?.token || "").trim();
        if (!userId || !sessionToken || seenUserIds.has(userId)) return null;
        seenUserIds.add(userId);

        const email = String(entry?.user?.email || "").trim();
        const fallbackName = email ? email.split("@")[0] : "Account";
        const name =
          String(entry?.user?.name || fallbackName || "Account").trim() ||
          "Account";
        const image =
          typeof entry?.user?.image === "string" ? entry.user.image : "";

        return {
          userId,
          name,
          image,
          isCurrent:
            userId === currentUserId ||
            (Boolean(currentToken) && sessionToken === currentToken),
        };
      })
      .filter(
        (
          entry,
        ): entry is {
          userId: string;
          name: string;
          image: string;
          isCurrent: boolean;
        } => Boolean(entry),
      );

    if (!accounts.some((account) => account.isCurrent)) {
      accounts.unshift({
        userId: currentUserId,
        name: currentName,
        image: currentImage,
        isCurrent: true,
      });
    }

    return accounts;
  } catch {
    return [];
  }
}

export async function listServerPasskeys(): Promise<
  {
    id: string;
    name?: string | null;
    createdAt?: string | null;
    deviceType?: string | null;
  }[]
> {
  try {
    const s = await getServerSession();
    const userId = String(s?.user?.id || "").trim();
    if (!userId) return [];
    const { passkeyTable } = await import("@featul/db");
    const rows = await db
      .select({
        id: passkeyTable.id,
        name: passkeyTable.name,
        createdAt: passkeyTable.createdAt,
        deviceType: passkeyTable.deviceType,
      })
      .from(passkeyTable)
      .where(eq(passkeyTable.userId, userId));
    return rows.map((r) => ({
      id: String(r.id),
      name: r.name || null,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : null,
      deviceType: r.deviceType || null,
    }));
  } catch {
    return [];
  }
}
