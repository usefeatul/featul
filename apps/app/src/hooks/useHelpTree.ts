"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import type { HelpAdminTree } from "@/components/help/types";

export function helpTreeKey(slug: string) {
  return ["help-tree", slug] as const;
}

/** Collections and articles for the dashboard; seeded from the server render. */
export function useHelpTree(slug: string, initialData?: HelpAdminTree) {
  return useQuery<HelpAdminTree>({
    queryKey: helpTreeKey(slug),
    queryFn: async () => {
      const res = await client.help.tree.$get({ slug });
      if (!res.ok) throw new Error("Couldn't load the help center");
      return (await res.json()) as HelpAdminTree;
    },
    initialData,
    staleTime: 30_000,
  });
}

export function useRefreshHelpTree(slug: string) {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: helpTreeKey(slug) }),
    [queryClient, slug],
  );
}

/** Throws the API's message so callers can toast it. */
export async function expectOk(
  res: { ok: boolean; json: () => Promise<unknown> },
  fallback: string,
) {
  if (res.ok) return;
  const body = (await res.json().catch(() => null)) as { message?: string } | null;
  throw new Error(body?.message || fallback);
}
