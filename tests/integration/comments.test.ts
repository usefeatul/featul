import { expect, test } from "bun:test";
import { neonConfig } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";

const url = process.env.TEST_DATABASE_URL;
const endpoint = process.env.TEST_NEON_HTTP_URL;

test.skipIf(!url || !endpoint)("comment creation commits counters/reactions atomically and rolls back failures", async () => {
  if (![url!, endpoint!].every(value => ["localhost", "127.0.0.1"].includes(new URL(value).hostname))) throw new Error("Integration tests require disposable local services");
  process.env.DATABASE_URL = url;
  neonConfig.fetchEndpoint = () => endpoint!;
  const { db, user, workspace, board, post, comment, commentReaction } = await import("../../packages/db");
  const { createCommentAtomically, deleteCommentAtomically } = await import("../../packages/api/src/post/comments");
  const id = crypto.randomUUID();
  await db.insert(user).values({ id, email: `${id}@example.invalid`, name: "Test", emailVerified: true, createdAt: new Date(), updatedAt: new Date() });
  try {
    await db.insert(workspace).values({ id, ownerId: id, name: "Test", slug: id, domain: `${id}.invalid`, widgetSecret: "test-only" });
    await db.insert(board).values({ id, workspaceId: id, createdBy: id, name: "Test", slug: "test" });
    await db.insert(post).values({ id, boardId: id, title: "Test", slug: "test", content: "Synthetic test" });
    const parent = await createCommentAtomically(db, { values: { postId: id, content: "Parent" }, reaction: { userId: id } });
    await Promise.all(Array.from({ length: 5 }, (_, i) => createCommentAtomically(db, {
      values: { postId: id, parentId: parent.comment.id, content: `Reply ${i}` }, reaction: { userId: id },
    })));
    expect((await db.select().from(post).where(eq(post.id, id)))[0]!.commentCount).toBe(6);
    expect((await db.select().from(comment).where(eq(comment.id, parent.comment.id)))[0]!.replyCount).toBe(5);
    const activity = { workspaceId: id, userId: id, action: "comment_deleted", actionType: "delete" as const, entity: "comment" };
    const [reply] = await db.select().from(comment).where(eq(comment.parentId, parent.comment.id));
    await expect(deleteCommentAtomically(db, {
      commentId: reply!.id, postId: id, parentId: parent.comment.id,
      activity: { ...activity, workspaceId: "missing-workspace" },
    })).rejects.toThrow();
    expect(await db.select().from(comment).where(eq(comment.id, reply!.id))).toHaveLength(1);
    expect((await db.select().from(post).where(eq(post.id, id)))[0]!.commentCount).toBe(6);
    await Promise.all([
      deleteCommentAtomically(db, { commentId: reply!.id, postId: id, parentId: parent.comment.id, activity }),
      ...Array.from({ length: 5 }, (_, i) => createCommentAtomically(db, {
        values: { postId: id, parentId: parent.comment.id, content: `Concurrent ${i}` }, reaction: { userId: id },
      })),
    ]);
    expect((await db.select().from(post).where(eq(post.id, id)))[0]!.commentCount).toBe(10);
    expect((await db.select().from(comment).where(eq(comment.id, parent.comment.id)))[0]!.replyCount).toBe(9);
    // A repeated delete cannot decrement a second time or record another deletion.
    expect(await deleteCommentAtomically(db, { commentId: reply!.id, postId: id, parentId: parent.comment.id, activity })).toBe(false);
    await Promise.all([
      deleteCommentAtomically(db, { commentId: parent.comment.id, postId: id, parentId: null, activity }),
      createCommentAtomically(db, { values: { postId: id, content: "Survives tree deletion" }, reaction: { userId: id } }),
    ]);
    expect(await db.select().from(comment).where(eq(comment.postId, id))).toHaveLength(1);
    expect((await db.select().from(post).where(eq(post.id, id)))[0]!.commentCount).toBe(1);
    await expect(createCommentAtomically(db, {
      values: { postId: id, content: "Must roll back" },
      reaction: { userId: "missing-user-" + id },
    })).rejects.toThrow();
    expect((await db.select().from(comment).where(eq(comment.postId, id))).length).toBe(1);
    expect((await db.select().from(commentReaction).where(eq(commentReaction.userId, id))).length).toBe(1);
    expect((await db.select().from(post).where(eq(post.id, id)))[0]!.commentCount).toBe(1);
  } finally {
    await db.delete(workspace).where(eq(workspace.id, id));
    await db.delete(user).where(eq(user.id, id));
  }
}, 15000);
