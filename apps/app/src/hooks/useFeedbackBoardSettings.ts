"use client";

import { useQuery, type QueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import type { FeedbackBoardSettings } from "@/types/settings";
export type { FeedbackBoardSettings } from "@/types/settings";

type MutationResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

type ErrorResponse = {
  message?: string;
};

export function feedbackBoardsQueryKey(slug: string) {
  return ["feedback-boards", slug] as const;
}

export async function loadFeedbackBoards(
  slug: string,
): Promise<FeedbackBoardSettings[]> {
  const response = await client.board.settingsByWorkspaceSlug.$get({ slug });
  const data = (await response.json().catch(() => null)) as {
    boards?: FeedbackBoardSettings[];
  } | null;

  return Array.isArray(data?.boards) ? data.boards : [];
}

export function useFeedbackBoardsSettings(
  slug: string,
  initialBoards?: FeedbackBoardSettings[],
) {
  return useQuery<FeedbackBoardSettings[]>({
    queryKey: feedbackBoardsQueryKey(slug),
    queryFn: () => loadFeedbackBoards(slug),
    initialData: Array.isArray(initialBoards) ? initialBoards : undefined,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function setFeedbackBoardsCache(
  queryClient: QueryClient,
  slug: string,
  updater: (boards: FeedbackBoardSettings[]) => FeedbackBoardSettings[],
) {
  queryClient.setQueryData<FeedbackBoardSettings[]>(
    feedbackBoardsQueryKey(slug),
    (prev) => updater(Array.isArray(prev) ? prev : []),
  );
}

export async function assertBoardMutationOk(
  response: MutationResponse,
  fallbackMessage: string,
) {
  if (response.ok) {
    return;
  }

  const error = (await response
    .json()
    .catch(() => null)) as ErrorResponse | null;
  throw new Error(error?.message || fallbackMessage);
}
