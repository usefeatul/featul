"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import {
  assertBoardMutationOk,
  setFeedbackBoardsCache,
  useFeedbackBoardsSettings,
  type FeedbackBoardSettings,
} from "./feedback-board-settings";
export type { FeedbackBoardSettings } from "./feedback-board-settings";

export type ToggleKey = keyof Pick<
  FeedbackBoardSettings,
  "allowAnonymous" | "allowComments" | "hidePublicMemberIdentity"
>;
export type ToggleSuccessMessage = string | ((enabled: boolean) => string);

export function useGlobalBoardToggle(
  slug: string,
  key: ToggleKey,
  successMessage?: ToggleSuccessMessage,
  initialBoards?: FeedbackBoardSettings[],
) {
  const queryClient = useQueryClient();
  const { data: boards = [], refetch } = useFeedbackBoardsSettings(
    slug,
    initialBoards,
  );

  const otherBoards = React.useMemo(
    () =>
      (boards || []).filter(
        (b) => b.slug !== "roadmap" && b.slug !== "changelog",
      ),
    [boards],
  );
  const allTrue = React.useCallback(
    (k: ToggleKey) =>
      (otherBoards || []).length > 0 &&
      (otherBoards || []).every((b) => Boolean(b[k])),
    [otherBoards],
  );
  const [value, setValue] = React.useState<boolean>(allTrue(key));

  React.useEffect(() => {
    setValue(allTrue(key));
  }, [allTrue, key]);

  const onToggle = async (v: boolean) => {
    try {
      setValue(v);
      setFeedbackBoardsCache(queryClient, slug, (boards) =>
        boards.map((it) =>
          it.slug !== "roadmap" && it.slug !== "changelog"
            ? { ...it, [key]: v }
            : it,
        ),
      );
    } catch {
      setValue(allTrue(key));
    }
    try {
      const res = await client.board.updateGlobalSettings.$post({
        slug,
        patch: { [key]: v },
      });
      await assertBoardMutationOk(res, "Update failed");
      await refetch();
      toast.success(
        typeof successMessage === "function"
          ? successMessage(v)
          : successMessage || "Setting updated",
      );
    } catch (e: unknown) {
      await refetch();
      toast.error(
        (e as { message?: string })?.message || "Failed to update setting",
      );
    }
  };

  return { value, onToggle };
}
