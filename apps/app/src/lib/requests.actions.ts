"use server";

import { z } from "zod";
import { getServerSession } from "@featul/auth/session";
import { getWorkspacePosts, getWorkspacePostsCount, listUserWorkspaces } from "@/lib/workspace";
import { toRequestItemData } from "@/lib/request/item";
import { loadRequestsPageData } from "@/app/workspaces/[slug]/requests/data";

const batchInput = z.object({
  slug: z.string().min(1),
  offset: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  variant: z.enum(["workspace", "requests"]),
  query: z.string().max(10000),
});

export async function loadMoreRequests(input: z.infer<typeof batchInput>) {
  const { slug, offset, variant, query } = batchInput.parse(input);
  const session = await getServerSession();
  if (!session?.user?.id) throw new Error("Sign in to view requests");
  const workspaces = await listUserWorkspaces(session.user.id);
  if (!workspaces.some((workspace) => workspace.slug === slug)) {
    throw new Error("Workspace access denied");
  }

  if (variant === "requests") {
    const params = new URLSearchParams(query);
    const data = await loadRequestsPageData({
      slug,
      offset,
      searchParams: {
        status: params.get("status") ?? undefined,
        board: params.get("board") ?? undefined,
        tag: params.get("tag") ?? undefined,
        order: params.get("order") ?? undefined,
        search: params.get("search") ?? undefined,
      },
    });
    if (!data) throw new Error("Workspace not found");
    const nextOffset = offset + data.rows.length;
    return { items: data.rows, nextOffset, hasMore: data.rows.length > 0 && nextOffset < data.totalCount };
  }

  const [rows, totalCount] = await Promise.all([
    getWorkspacePosts(slug, { order: "newest", limit: 20, offset }),
    getWorkspacePostsCount(slug, {}),
  ]);
  const nextOffset = offset + rows.length;
  return { items: rows.map(toRequestItemData), nextOffset, hasMore: rows.length > 0 && nextOffset < totalCount };
}
