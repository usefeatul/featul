import { eq, sql, and } from "drizzle-orm"
import { billingAccount, billingState, db, user, workspace } from "@featul/db"
import { getStripeClient } from "../stripe"
import { BillingConflictError } from "./mutations"
import { withBillingLock, ownsBillingLease, type BillingLease } from "./lock"
import { syncBillingUnderLease } from "./sync"
import { isUnfinishedSubscription } from "./policy"
import { expireAccountCheckouts, ownsAccountBillingLease, withAccountCheckoutLock } from "./trial"

/** No destructive writes happen until every owned workspace passes billing checks. */
export async function deleteAccountAfterBillingCheck(userId: string) {
  return withAccountCheckoutLock(userId, async (accountLease) => {
    const [owner] = await db.select({ customerId: user.stripeCustomerId }).from(user).where(eq(user.id, userId))
    if (!owner) throw new Error("Account not found")
    await expireAccountCheckouts(userId)
    // Include orphaned Stripe subscriptions whose workspace was deleted by an older version.
    if (owner.customerId) {
      const stripe = getStripeClient()
      if (!stripe) throw new Error("Stripe billing is not configured")
      for await (const subscription of stripe.subscriptions.list({ customer: owner.customerId, status: "all", limit: 100 })) {
        if (isUnfinishedSubscription(subscription.status)) {
          throw new BillingConflictError("End all subscriptions before deleting your account.")
        }
      }
    }
    const owned = await db.select({ id: workspace.id }).from(workspace).where(eq(workspace.ownerId, userId)).orderBy(workspace.id)
    const leases: BillingLease[] = []
    async function acquire(index: number): Promise<void> {
      const next = owned[index]
      if (next) return withBillingLock(next.id, async (lease) => {
        const billing = await syncBillingUnderLease(lease)
        if (billing.subscriptions.some(row => isUnfinishedSubscription(row.status))) {
          throw new BillingConflictError("End all subscriptions before deleting your account.")
        }
        leases.push(lease)
        await acquire(index + 1)
      })

      // Neon HTTP batches are transactions. Lock and fence each lease before any
      // content changes; an expired/replaced lease aborts the whole transaction.
      await db.batch([
        db.execute(sql`select id from "user" where id = ${userId} for update`),
        db.execute(sql`select user_id from ${billingAccount} where user_id = ${userId} for update`),
        ...leases.map(lease => db.update(billingState).set({ lockToken: lease.token })
          .where(and(eq(billingState.workspaceId, lease.workspaceId), ownsBillingLease(lease)))),
        db.execute(sql`select 1 / case when ${ownsAccountBillingLease(accountLease)}
          ${sql.join(leases.map(lease => sql`and ${ownsBillingLease(lease)}`), sql` `)} then 1 else 0 end as lease_valid`),
        // Creator/author references in surviving workspaces transfer to their
        // owner. Content, comments, and changelog entries stay intact.
        db.execute(sql`update board b set created_by = w.owner_id from workspace w
          where b.workspace_id = w.id and b.created_by = ${userId} and w.owner_id <> ${userId}`),
        db.execute(sql`update post_update u set author_id = w.owner_id from post p, board b, workspace w
          where u.post_id = p.id and p.board_id = b.id and b.workspace_id = w.id and u.author_id = ${userId} and w.owner_id <> ${userId}`),
        db.execute(sql`update changelog_entry c set author_id = w.owner_id from board b, workspace w
          where c.board_id = b.id and b.workspace_id = w.id and c.author_id = ${userId} and w.owner_id <> ${userId}`),
        db.execute(sql`update post_merge m set merged_by = w.owner_id from post p, board b, workspace w
          where m.target_post_id = p.id and p.board_id = b.id and b.workspace_id = w.id and m.merged_by = ${userId} and w.owner_id <> ${userId}`),
        db.execute(sql`update workspace_member set invited_by = null where invited_by = ${userId}`),
        db.execute(sql`delete from workspace_invite where invited_by = ${userId}`),
        db.execute(sql`update workspace_slug_reservation set claimed_by_user_id = null where claimed_by_user_id = ${userId}`),
        db.execute(sql`update post set moderated_by = null where moderated_by = ${userId}`),
        db.execute(sql`update comment set moderated_by = null where moderated_by = ${userId}`),
        db.execute(sql`update post_report set reviewed_by = null where reviewed_by = ${userId}`),
        db.execute(sql`update comment_report set reviewed_by = null where reviewed_by = ${userId}`),
        // Keep historical votes, anonymized, so removing an account does not
        // silently change the counts on other workspaces' requests.
        db.execute(sql`update vote set user_id = null where user_id = ${userId}`),
        db.execute(sql`update comment_reaction set user_id = null where user_id = ${userId}`),
        db.delete(workspace).where(eq(workspace.ownerId, userId)),
        db.delete(user).where(eq(user.id, userId)),
      ])
    }
    await acquire(0)
  })
}
