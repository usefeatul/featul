"use client";

import React from "react";
import { useQuery, type QueryKey } from "@tanstack/react-query";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverListItem,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@featul/ui/components/table";
import { LoadingButton } from "@/components/global/loading-button";
import { TagNameDialog } from "@/components/settings/global/TagNameDialog";
import { getPlanLimits, normalizePlan } from "@/lib/plan";
import { cn } from "@featul/ui/lib/utils";

type ManagedTag = {
  id: string;
  name: string;
};

type MutationResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

type TagManagerSectionProps<T extends ManagedTag> = {
  queryKey: QueryKey;
  initialTags?: T[];
  loadTags: () => Promise<T[]>;
  createTag: (name: string) => Promise<MutationResponse>;
  deleteTag: (tag: T) => Promise<MutationResponse>;
  plan?: string;
  limitKey: "maxTags" | "maxChangelogTags";
  limitReachedMessage: (limit: number) => string;
  title: string;
  description: string;
  emptyLabel?: string;
  createButtonLabel: string;
  createDialogTitle: string;
  createDialogDescription: string;
  createActionLabel: string;
  createLoadingLabel: string;
  renderPlanNotice: (tagCount: number) => React.ReactNode;
};

type ErrorResponse = {
  message?: string;
};

async function assertOk(response: MutationResponse, fallbackMessage: string) {
  if (response.ok) {
    return;
  }

  const error = (await response
    .json()
    .catch(() => null)) as ErrorResponse | null;
  throw new Error(error?.message || fallbackMessage);
}

export function TagManagerSection<T extends ManagedTag>({
  queryKey,
  initialTags,
  loadTags,
  createTag,
  deleteTag,
  plan,
  limitKey,
  limitReachedMessage,
  title,
  description,
  emptyLabel = "No tags",
  createButtonLabel,
  createDialogTitle,
  createDialogDescription,
  createActionLabel,
  createLoadingLabel,
  renderPlanNotice,
}: TagManagerSectionProps<T>) {
  const {
    data: tags = [],
    isLoading,
    refetch,
  } = useQuery<T[]>({
    queryKey,
    queryFn: loadTags,
    initialData: Array.isArray(initialTags) ? initialTags : undefined,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const [actionOpenId, setActionOpenId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const limits = React.useMemo(
    () => getPlanLimits(normalizePlan(plan || "free")),
    [plan],
  );
  const limit = limits[limitKey];
  const hasReachedLimit = typeof limit === "number" && tags.length >= limit;

  const showLimitReached = () => {
    toast.error(
      typeof limit === "number" ? limitReachedMessage(limit) : "Limit reached",
    );
  };

  const handleDelete = async (tag: T) => {
    setActionOpenId(null);

    try {
      await assertOk(await deleteTag(tag), "Delete failed");
      toast.success("Tag deleted");
      await refetch();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete tag";
      toast.error(message);
    }
  };

  const handleCreate = async (name: string) => {
    const trimmedName = String(name || "").trim();
    if (!trimmedName) return;
    if (hasReachedLimit) {
      showLimitReached();
      setCreateOpen(false);
      return;
    }

    try {
      setCreating(true);
      await assertOk(await createTag(trimmedName), "Create failed");
      toast.success("Tag created");
      setCreateOpen(false);
      await refetch();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create tag";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">{title}</div>
      <div className="max-w-[500px] text-sm text-accent">{description}</div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Tag</TableHead>
              <TableHead className="w-14 pl-2 pr-3 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="px-4 py-6 text-accent">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="px-4 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block size-3 rounded-full bg-primary" />
                      <span>{tag.name}</span>
                    </span>
                  </TableCell>
                  <TableCell className="pl-2 pr-3 text-right">
                    <Popover
                      open={actionOpenId === tag.id}
                      onOpenChange={(open) =>
                        setActionOpenId(open ? String(tag.id) : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <LoadingButton
                          type="button"
                          variant="nav"
                          size="icon-sm"
                          aria-label="More"
                          className="ml-auto"
                        >
                          <MoreVertical className="size-4" />
                        </LoadingButton>
                      </PopoverTrigger>
                      <PopoverContent list className="min-w-0 w-fit">
                        <PopoverList>
                          <PopoverListItem
                            role="menuitem"
                            onClick={() => void handleDelete(tag)}
                          >
                            <span className="text-sm text-red-500">Delete</span>
                          </PopoverListItem>
                        </PopoverList>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {renderPlanNotice(tags.length)}

      <div className="mt-2 flex items-center justify-start">
        <LoadingButton
          type="button"
          variant={hasReachedLimit ? "destructive" : "default"}
          className={cn(
            hasReachedLimit && "ring-destructive/50 hover:ring-destructive/60",
          )}
          onClick={() => {
            if (hasReachedLimit) {
              showLimitReached();
              return;
            }
            setCreateOpen(true);
          }}
        >
          {createButtonLabel}
        </LoadingButton>
      </div>

      <TagNameDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={handleCreate}
        saving={creating}
        title={createDialogTitle}
        description={createDialogDescription}
        actionLabel={createActionLabel}
        loadingLabel={createLoadingLabel}
        disableWhenEmpty
      />
    </div>
  );
}
