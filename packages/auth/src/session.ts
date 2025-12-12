import { headers } from "next/headers";
import { auth } from "./auth";
import { db, session as sessionTable } from "@oreilla/db";
import { eq, desc } from "drizzle-orm";

export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}

export async function listServerSessions(): Promise<
  { token: string; userAgent?: string | null; ipAddress?: string | null; createdAt?: string; expiresAt?: string }[]
> {
  try {
    const s = await getServerSession();
    const userId = String((s as any)?.user?.id || "").trim();
    if (!userId) return [];
    const rows = await db
      .select({
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
      token: String(r.token),
      userAgent: r.userAgent || null,
      ipAddress: r.ipAddress || null,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : undefined,
      expiresAt: r.expiresAt instanceof Date ? r.expiresAt.toISOString() : undefined,
    }));
  } catch {
    return [];
  }
}
