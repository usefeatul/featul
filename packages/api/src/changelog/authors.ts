import { and, eq, inArray } from "drizzle-orm";
import { user, workspaceMember, type db } from "@featul/db";

export type EntryAuthor = {
  id: string;
  name: string | null;
  image: string | null;
  role: "admin" | "member" | "viewer" | null;
  isOwner: boolean;
};

/** Credited authors in display order; entries saved before co-authors credit only their creator. */
export function getEntryAuthorIds(entry: {
  authorId: string;
  authorIds?: string[] | null;
}): string[] {
  return entry.authorIds && entry.authorIds.length > 0
    ? entry.authorIds
    : [entry.authorId];
}

/** Names, avatars and workspace roles for the given users, keyed by user id. */
export async function loadEntryAuthors(
  database: typeof db,
  workspace: { id: string; ownerId: string },
  userIds: string[],
): Promise<Map<string, EntryAuthor>> {
  const ids = [...new Set(userIds)];
  if (ids.length === 0) return new Map();

  const [users, members] = await Promise.all([
    database
      .select({ id: user.id, name: user.name, image: user.image })
      .from(user)
      .where(inArray(user.id, ids)),
    database
      .select({ userId: workspaceMember.userId, role: workspaceMember.role })
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspace.id),
          inArray(workspaceMember.userId, ids),
        ),
      ),
  ]);

  const roles = new Map(members.map((m) => [m.userId, m.role]));
  return new Map(
    users.map((u) => [
      u.id,
      {
        id: u.id,
        name: u.name,
        image: u.image,
        role: roles.get(u.id) ?? null,
        isOwner: u.id === workspace.ownerId,
      },
    ]),
  );
}

/** Resolves ids to authors, dropping users that no longer exist. */
export function pickAuthors(
  ids: string[],
  authors: Map<string, EntryAuthor>,
): EntryAuthor[] {
  return ids
    .map((id) => authors.get(id))
    .filter((author): author is EntryAuthor => Boolean(author));
}
