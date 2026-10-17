"use client";

import React from "react";
import { Switch } from "@featul/ui/components/switch";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import {
  assertBoardMutationOk,
  setFeedbackBoardsCache,
  type FeedbackBoardSettings,
  useFeedbackBoardsSettings,
} from "@/hooks/useFeedbackBoardSettings";
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog";
import SectionCard from "../global/SectionCard";

export default function RoadmapVisibility({
  slug,
  initialBoards,
}: {
  slug: string;
  initialBoards?: FeedbackBoardSettings[];
}) {
  const queryClient = useQueryClient();
  const { data: boards = [], refetch } = useFeedbackBoardsSettings(
    slug,
    initialBoards,
  );

  const roadmap = React.useMemo(
    () => (boards || []).find((b) => b.slug === "roadmap"),
    [boards],
  );

  const updateRoadmap = async (v: boolean) => {
    try {
      setFeedbackBoardsCache(queryClient, slug, (boards) =>
        boards.map((it) =>
          it.slug === "roadmap" ? { ...it, isVisible: v } : it,
        ),
      );
    } catch {
      /* Optimistic update - errors handled in API call below */
    }
    try {
      const res = await client.board.updateSettings.$post({
        slug,
        boardSlug: "roadmap",
        patch: { isVisible: v },
      });
      await assertBoardMutationOk(res, "Update failed");
      await refetch();
      captureAnalyticsEvent(analyticsEvents.roadmapVisibilityChanged, {
        workspace_slug: slug,
        is_visible: v,
      });
      toast.success(v ? "Roadmap is now visible" : "Roadmap is hidden");
    } catch (e: unknown) {
      await refetch();
      toast.error((e as { message?: string })?.message || "Failed to update");
    }
  };

  return (
    <SectionCard
      title="Roadmap visibility"
    >
      <div className="flex items-center justify-between gap-6">
        <div>
          <div className="text-sm font-medium">Public roadmap</div>
          <p className="mt-1 text-sm text-muted-foreground">Show or hide your roadmap on the public site and widget.</p>
        </div>
        <Switch
          checked={Boolean(roadmap?.isVisible)}
          onCheckedChange={(v) => updateRoadmap(v)}
          aria-label="Toggle Roadmap Visibility"
        />
      </div>
    </SectionCard>
  );
}
