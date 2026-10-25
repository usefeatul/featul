"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverSeparator,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import { Switch } from "@featul/ui/components/switch";
import { raisedSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { AnalyticsIcon, BookIcon, EditIcon, OpenExternalIcon, PlusIcon, SparklesIcon } from "@/components/global/icons";
import { ActionTooltip } from "@/components/global/ActionTooltip";
import { ContextMenuItem } from "@/components/global/ContextMenuItem";
import { useWorkspaceNav } from "@/hooks/useWorkspaceNav";
import { expectOk } from "@/hooks/useHelpTree";
import { CollectionDialog } from "./CollectionDialog";
import { openHelpImport } from "./HelpImport";

type HelpSettings = { isVisible: boolean; publishedCount: number };

/** Help center list header: public toggle, view link, analytics, and one menu for creating things. */
export function HelpHeaderActions({
  workspaceSlug,
  buttonClassName,
}: {
  workspaceSlug: string;
  buttonClassName: string;
}) {
  const queryClient = useQueryClient();
  const queryKey = ["help-settings", workspaceSlug];
  const router = useRouter();
  const [collectionOpen, setCollectionOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
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

  const create = (fn: () => void) => () => {
    setCreateOpen(false);
    fn();
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
              <OpenExternalIcon className="size-4" />
            </Link>
          </Button>
        </ActionTooltip>
      ) : null}
      <ActionTooltip label="Analytics">
        <Button asChild variant="plain" size="icon-sm" className={buttonClassName}>
          <Link href={`/workspaces/${workspaceSlug}/help/analytics`} aria-label="Analytics">
            <AnalyticsIcon className="size-4" />
          </Link>
        </Button>
      </ActionTooltip>
      <Popover open={createOpen} onOpenChange={setCreateOpen}>
        <ActionTooltip label="Create">
          <PopoverTrigger asChild>
            <Button variant="plain" size="icon-sm" className={buttonClassName} aria-label="Create">
              <PlusIcon className="size-4" />
            </Button>
          </PopoverTrigger>
        </ActionTooltip>
        <PopoverContent align="end" list className="w-max min-w-0">
          <PopoverList>
            <ContextMenuItem
              icon={<EditIcon className="size-4" />}
              label="New article"
              onClick={create(() => router.push(`/workspaces/${workspaceSlug}/help/new`))}
            />
            <ContextMenuItem
              icon={<BookIcon className="size-4" />}
              label="New collection"
              onClick={create(() => setCollectionOpen(true))}
            />
            <PopoverSeparator />
            <ContextMenuItem
              icon={<SparklesIcon className="size-4" />}
              label="Draft from website"
              onClick={create(openHelpImport)}
            />
          </PopoverList>
        </PopoverContent>
      </Popover>
      <CollectionDialog open={collectionOpen} onOpenChange={setCollectionOpen} workspaceSlug={workspaceSlug} />
    </div>
  );
}
