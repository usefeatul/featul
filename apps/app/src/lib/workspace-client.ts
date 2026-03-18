import type { QueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import { safeJson } from "@/lib/api-response";

export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  domain?: string | null;
  customDomain?: string | null;
  timezone?: string | null;
  plan?: "free" | "starter" | "professional" | null;
};

export type WorkspaceDomainInfo = {
  domain: { status: string; host?: string } | null;
};

type WorkspaceBySlugResponse = {
  workspace?: WorkspaceSummary | null;
};

type WorkspaceListResponse = {
  workspaces?: WorkspaceSummary[];
};

type WorkspaceStatusCountsResponse = {
  counts?: Record<string, number>;
};

export const workspaceQueryKeys = {
  list: () => ["workspaces"] as const,
  bySlug: (slug: string) => ["workspace", slug] as const,
  domainInfo: (slug: string) => ["workspace-domain-info", slug] as const,
  statusCounts: (slug: string) => ["status-counts", slug] as const,
};

export async function fetchWorkspaceBySlug(
  slug: string
): Promise<WorkspaceSummary | null> {
  if (!slug) return null;
  const res = await client.workspace.bySlug.$get({ slug });
  const data = await safeJson<WorkspaceBySlugResponse>(res);
  return data?.workspace ?? null;
}

export async function fetchUserWorkspaces(): Promise<WorkspaceSummary[]> {
  const res = await client.workspace.listMine.$get();
  const data = await safeJson<WorkspaceListResponse>(res);
  return Array.isArray(data?.workspaces) ? data.workspaces : [];
}

export async function fetchWorkspaceDomainInfo(
  slug: string
): Promise<WorkspaceDomainInfo | null> {
  if (!slug) return null;
  const res = await client.workspace.domainInfo.$get({ slug });
  const data = await safeJson<WorkspaceDomainInfo>(res);
  return data ?? null;
}

export async function fetchWorkspaceStatusCounts(
  slug: string
): Promise<Record<string, number> | null> {
  if (!slug) return null;
  const res = await client.workspace.statusCounts.$get({ slug });
  const data = await safeJson<WorkspaceStatusCountsResponse>(res);
  return data?.counts ?? null;
}

export async function prefetchWorkspaceStatusCounts(
  queryClient: QueryClient,
  slug: string
) {
  return queryClient.prefetchQuery({
    queryKey: workspaceQueryKeys.statusCounts(slug),
    queryFn: () => fetchWorkspaceStatusCounts(slug),
    staleTime: 300_000,
    gcTime: 300_000,
  });
}
