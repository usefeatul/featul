"use client";

import React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import { Switch } from "@featul/ui/components/switch";
import { raisedSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { AnalyticsIcon, BookIcon, ExternalLink, Plus, SparklesIcon } from "@/components/global/icons";
import { ActionTooltip } from "@/components/global/ActionTooltip";
import { useWorkspaceNav } from "@/hooks/useWorkspaceNav";
import { expectOk } from "@/hooks/useHelpTree";
import { CollectionDialog } from "./CollectionDialog";
import { openHelpImport } from "./HelpImport";

type HelpSettings = { isVisible: boolean; publishedCount: number };

/** Help center list header: public toggle, view link, new collection, new article. */
export function HelpHeaderActions({
  workspaceSlug,
  buttonClassName,
}: {
  workspaceSlug: string;
  buttonClassName: string;
}) {
  const queryClient = useQueryClient();
  const queryKey = ["help-settings", workspaceSlug];
  const [collectionOpen, setCollectionOpen] = React.useState(false);
  const { middleNav } = useWorkspaceNav(workspaceSlug);
  const boardUrl = middleNav.find((item) => item.label === "My Board")?.href;

  const { data } = useQuery<HelpSettings>({
    queryKey,
    queryFn: async () => {
      const res = await client.help.settings.$get({ slug: workspaceSlug });
      await expectOk(res, "Couldn't load help center settings");
      return (await res.json()) as HelpSettings;
    },
    staleTime: 60_000,
  });
  const isVisible = data?.isVisible ?? true;

  const toggle = async (next: boolean) => {
    queryClient.setQueryData<HelpSettings>(queryKey, (prev) => ({
      publishedCount: prev?.publishedCount ?? 0,
      isVisible: next,
    }));
    try {
      const res = await client.help.toggleVisibility.$post({ slug: workspaceSlug, isVisible: next });
      await expectOk(res, "Couldn't update visibility");
      toast.success(next ? "Help center is visible on your public site" : "Help center is hidden from your public site");
    } catch (error) {
      queryClient.setQueryData<HelpSettings>(queryKey, (prev) => ({
        publishedCount: prev?.publishedCount ?? 0,
        isVisible: !next,
      }));
      toast.error(error instanceof Error ? error.message : "Couldn't update visibility");
    }
  };

  const visibilityHint = !isVisible
    ? "Hidden from your public site. Turn on to show it."
    : data && data.publishedCount === 0
      ? "Shows on your public site once an article is published"
      : "Showing on your public site";

  return (
    <div className="ml-auto flex shrink-0 items-center gap-1">
      <ActionTooltip label={visibilityHint}>
        <label
          className={cn(
            raisedSurfaceClass,
            "flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-muted-foreground",
          )}
        >
          <span>Public</span>
          <Switch checked={isVisible} onCheckedChange={toggle} aria-label="Show help center on public site" />
        </label>
      </ActionTooltip>
      {boardUrl ? (
        <ActionTooltip label="View your live help center">
          <Button asChild variant="plain" size="icon-sm" className={buttonClassName}>
            <Link href={`${boardUrl}/help`} target="_blank" rel="noopener noreferrer" aria-label="View help center">
              <ExternalLink className="size-4" />
            </Link>
          </Button>
        </ActionTooltip>
      ) : null}
      <ActionTooltip label="Draft articles from your website">
        <Button
          variant="plain"
          size="icon-sm"
          className={buttonClassName}
          aria-label="Draft from website"
          onClick={openHelpImport}
        >
          <SparklesIcon className="size-4" />
        </Button>
      </ActionTooltip>
      <ActionTooltip label="Analytics">
        <Button asChild variant="plain" size="icon-sm" className={buttonClassName}>
          <Link href={`/workspaces/${workspaceSlug}/help/analytics`} aria-label="Analytics">
            <AnalyticsIcon className="size-4" />
          </Link>
        </Button>
      </ActionTooltip>
      <ActionTooltip label="New collection">
        <Button
          variant="plain"
          size="icon-sm"
          className={buttonClassName}
          aria-label="New collection"
          onClick={() => setCollectionOpen(true)}
        >
          <BookIcon className="size-4" />
        </Button>
      </ActionTooltip>
      <ActionTooltip label="New article">
        <Button asChild variant="plain" size="icon-sm" className={buttonClassName}>
          <Link href={`/workspaces/${workspaceSlug}/help/new`} aria-label="New article">
            <Plus className="size-4" />
          </Link>
        </Button>
      </ActionTooltip>
      <CollectionDialog open={collectionOpen} onOpenChange={setCollectionOpen} workspaceSlug={workspaceSlug} />
    </div>
  );
}
