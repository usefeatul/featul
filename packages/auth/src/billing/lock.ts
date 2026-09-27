import { randomUUID } from "node:crypto"
import { and, eq, sql } from "drizzle-orm"
import { billingState, db } from "@featul/db"

export class BillingBusyError extends Error {
  constructor() {
    super("Billing is being updated. Please try again shortly.")
  }
}

export type BillingLease = { workspaceId: string; token: string }

export function ownsBillingLease(lease: BillingLease) {
  return sql`exists (
    select 1 from ${billingState}
    where ${billingState.workspaceId} = ${lease.workspaceId}
      and ${billingState.lockToken} = ${lease.token}
      and ${billingState.lockedUntil} > now()
  )`
}

export async function withBillingLock<T>(workspaceId: string, work: (lease: BillingLease) => Promise<T>) {
  const token = randomUUID()
  const [claimed] = await db.insert(billingState).values({
    workspaceId, lockToken: token, lockedUntil: sql`now() + interval '2 minutes'`, attemptedAt: sql`now()`,
  }).onConflictDoUpdate({
    target: billingState.workspaceId,
    set: { lockToken: token, lockedUntil: sql`now() + interval '2 minutes'`, attemptedAt: sql`now()` },
    setWhere: sql`${billingState.lockedUntil} is null or ${billingState.lockedUntil} < now()`,
  }).returning({ id: billingState.workspaceId })
  if (!claimed) throw new BillingBusyError()

  try {
    return await work({ workspaceId, token })
  } finally {
    await db.update(billingState).set({ lockToken: null, lockedUntil: null })
      .where(and(eq(billingState.workspaceId, workspaceId), eq(billingState.lockToken, token)))
  }
}
