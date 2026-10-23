"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { client } from "@featul/api/client";
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverSeparator,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@featul/ui/components/avatar";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import {
  ChangelogDraftIcon,
  ChangelogPublishedIcon,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  EditIcon,
  MoreHorizontal,
  MoveVerticalIcon,
  Plus,
  TrashIcon,
} from "@/components/global/icons";
import { ActionTooltip } from "@/components/global/ActionTooltip";
import { ContextMenuShell } from "@/components/global/ContextMenuShell";
import { ContextMenuItem, CONTEXT_MENU_DESTRUCTIVE_CLASS } from "@/components/global/ContextMenuItem";
import { DestructiveConfirmDialog } from "@/components/global/DestructiveConfirmDialog";
import { useContextMenuPosition } from "@/hooks/useContextMenuPosition";
import { useSelectableList } from "@/hooks/useSelectableList";
import { useRequestDragSelection } from "@/hooks/useRequestDragSelection";
import { SelectableListShell } from "@/components/selection/SelectableListShell";
import { SelectionControl } from "@/components/selection/SelectionControl";
import { getSelectableRowClassName, type SelectionItemProps } from "@/components/selection/Row";
import { pluralizeItemLabel } from "@/components/selection/pluralize";
import { getSelectedIds, removeSelectedIds } from "@/lib/selection/store";
import type { SelectionHydrationState } from "@/types/selection";
import { expectOk, helpTreeKey, useHelpTree, useRefreshHelpTree } from "@/hooks/useHelpTree";
import { relativeTime } from "@/lib/time";
import { getInitials } from "@/utils/user";
import { randomAvatarUrl } from "@/utils/avatar";
import { CollectionDialog } from "./CollectionDialog";
import { HelpCollectionTile } from "./icons";
import { helpfulRatio, type HelpAdminArticle, type HelpAdminCollection, type HelpAdminTree } from "./types";
import { EmptyHelpCenter } from "./EmptyHelpCenter";

type Group = {
  collection: HelpAdminCollection | null;
  articles: HelpAdminArticle[];
};

function groupArticles(tree: HelpAdminTree): Group[] {
  const byCollection = new Map<string | null, HelpAdminArticle[]>();
  for (const article of tree.articles) {
    const key = article.collectionId;
    byCollection.set(key, [...(byCollection.get(key) ?? []), article]);
  }
  const groups: Group[] = tree.collections.map((collection) => ({
    collection,
    articles: byCollection.get(collection.id) ?? [],
  }));
  const loose = byCollection.get(null) ?? [];
  if (loose.length > 0) groups.push({ collection: null, articles: loose });
  return groups;
}

type Move = "top" | "up" | "down" | "bottom";

type GetSelectionProps = (id: string) => SelectionItemProps;

/** New order of ids after moving `id`; null when it is already there. */
function moved(ids: string[], id: string, move: Move) {
  const from = ids.indexOf(id);
  if (from < 0) return null;
  const to =
    move === "top" ? 0 : move === "bottom" ? ids.length - 1 : from + (move === "up" ? -1 : 1);
  if (to < 0 || to >= ids.length || to === from) return null;
  return arrayMove(ids, from, to);
}

/** Puts the items named in `ids` back into the slots they already fill, in `ids` order. */
function inOrder<T extends { id: string }>(items: T[], ids: string[]) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const queue = ids.flatMap((id) => byId.get(id) ?? []);
  const named = new Set(queue.map((item) => item.id));
  let next = 0;
  return items.map((item) => (named.has(item.id) ? queue[next++]! : item));
}

/** The lifted row eases into its new slot instead of snapping there. */
const dropAnimation: DropAnimation = {
  duration: 180,
  easing: "cubic-bezier(0.2, 0, 0, 1)",
  // The row underneath stays hidden until the card has landed on it.
  sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0" } } }),
};

/** Where an item sits in its list, for disabling the moves that would do nothing. */
type Edges = { first: boolean; last: boolean };

export function HelpCenterList({
  workspaceSlug,
  initialTree,
  initialIsSelecting,
  initialSelectedIds,
}: {
  workspaceSlug: string;
  initialTree: HelpAdminTree;
} & SelectionHydrationState) {
  const { data: tree = initialTree } = useHelpTree(workspaceSlug, initialTree);
  const refresh = useRefreshHelpTree(workspaceSlug);
  const queryClient = useQueryClient();
  const [editing, setEditing] = React.useState<HelpAdminCollection | null>(null);
  const groups = React.useMemo(() => groupArticles(tree), [tree]);
  const listKey = `help-${workspaceSlug}`;
  // Selection runs across collections in the order they are shown, so shift-click ranges span groups.
  const itemIds = React.useMemo(() => groups.flatMap((group) => group.articles.map((a) => a.id)), [groups]);
  const itemIndex = React.useMemo(() => new Map(itemIds.map((id, index) => [id, index])), [itemIds]);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [bulkAction, setBulkAction] = React.useState<"delete" | "published" | "draft" | null>(null);

  const selection = useSelectableList({
    listKey,
    itemIds,
    initialIsSelecting,
    initialSelectedIds,
    isPending: bulkAction !== null,
    confirmOpen,
    setConfirmOpen,
  });
  const { getItemSelectionProps } = selection;
  const getSelectionProps = React.useCallback<GetSelectionProps>(
    (id) => getItemSelectionProps(id, itemIndex.get(id) ?? 0),
    [getItemSelectionProps, itemIndex],
  );
  // Same click-and-drag painting as the requests list; it runs across every collection.
  const dragSelection = useRequestDragSelection({
    enabled: selection.isSelectingForRender && bulkAction === null && !confirmOpen,
    selectedIds: selection.selectedIdsSet,
    itemIds,
    setRangeSelected: selection.setRangeSelected,
  });

  const selectedArticles = tree.articles.filter((a) => selection.selectedIdsSet.has(a.id));
  const canPublish = selectedArticles.some((a) => a.status === "draft");
  const canUnpublish = selectedArticles.some((a) => a.status === "published");

  /** Selected ids that still exist; stale ones from another tab are dropped. */
  const takeSelected = () => {
    const known = new Set(itemIds);
    return getSelectedIds(listKey).filter((id) => known.has(id));
  };

  const handleBulkDelete = async () => {
    const ids = takeSelected();
    if (ids.length === 0) return;
    setBulkAction("delete");
    try {
      const res = await client.help.articlesDelete.$post({ slug: workspaceSlug, articleIds: ids });
      await expectOk(res, "Couldn't delete the articles");
      const gone = new Set(ids);
      queryClient.setQueryData<HelpAdminTree>(helpTreeKey(workspaceSlug), (current) =>
        current ? { ...current, articles: current.articles.filter((a) => !gone.has(a.id)) } : current,
      );
      removeSelectedIds(listKey, ids);
      setConfirmOpen(false);
      toast.success(`Deleted ${ids.length} ${pluralizeItemLabel("article", ids.length)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't delete the articles");
    } finally {
      setBulkAction(null);
      await refresh();
    }
  };

  const handleBulkStatus = async (status: "published" | "draft") => {
    const ids = takeSelected().filter((id) => tree.articles.find((a) => a.id === id)?.status !== status);
    if (ids.length === 0) return;
    setBulkAction(status);
    try {
      const res = await client.help.articlesSetStatus.$post({ slug: workspaceSlug, articleIds: ids, status });
      await expectOk(res, "Couldn't update the articles");
      const { updated, skipped, limit } = (await res.json()) as {
        updated: number;
        skipped: number;
        limit: number | null;
      };
      removeSelectedIds(listKey, ids);
      const verb = status === "published" ? "Published" : "Unpublished";
      toast.success(`${verb} ${updated} ${pluralizeItemLabel("article", updated)}`);
      if (skipped > 0) {
        toast.error(
          `${skipped} ${pluralizeItemLabel("article", skipped)} left as draft: published articles limit reached (${limit})`,
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't update the articles");
    } finally {
      setBulkAction(null);
      await refresh();
    }
  };
  // Saves run one at a time so quick successive drags land on the server in order.
  const saving = React.useRef<Promise<void>>(Promise.resolve());

  const reorder = React.useCallback(
    (kind: "collections" | "articles", ids: string[]) => {
      // Show the new order right away; the save happens in the background.
      const key = helpTreeKey(workspaceSlug);
      void queryClient.cancelQueries({ queryKey: key });
      queryClient.setQueryData<HelpAdminTree>(key, (current) => {
        if (!current) return current;
        return kind === "collections"
          ? { ...current, collections: inOrder(current.collections, ids) }
          : { ...current, articles: inOrder(current.articles, ids) };
      });
      saving.current = saving.current.then(async () => {
        try {
          const res =
            kind === "collections"
              ? await client.help.collectionsReorder.$post({ slug: workspaceSlug, ids })
              : await client.help.articlesReorder.$post({ slug: workspaceSlug, ids });
          await expectOk(res, "Couldn't reorder");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Couldn't reorder");
          await refresh();
        }
      });
    },
    [workspaceSlug, queryClient, refresh],
  );

  if (tree.collections.length === 0 && tree.articles.length === 0) {
    return <EmptyHelpCenter workspaceSlug={workspaceSlug} />;
  }

  const collectionIds = tree.collections.map((c) => c.id);

  return (
    <SelectableListShell
      variant="plain"
      className="w-full"
      wrapList={false}
      toolbarClassName="mb-4 px-4 sm:px-6"
      isPending={bulkAction === "delete"}
      selection={selection}
      confirmOpen={confirmOpen}
      setConfirmOpen={setConfirmOpen}
      handleBulkDelete={() => void handleBulkDelete()}
      itemLabel="article"
      emptySelectionHint="Click or drag rows to select"
      deleteDescription="This action cannot be undone. These articles will be permanently removed from your help center."
      totalCount={itemIds.length}
      extraActions={
        // Only the moves that apply to the selection are offered.
        <>
          {canPublish ? (
            <BulkStatusButton
              label="Publish"
              pendingLabel="Publishing…"
              icon={<ChangelogPublishedIcon className="size-3.5" />}
              disabled={bulkAction !== null}
              pending={bulkAction === "published"}
              onClick={() => void handleBulkStatus("published")}
            />
          ) : null}
          {canUnpublish ? (
            <BulkStatusButton
              label="Unpublish"
              pendingLabel="Unpublishing…"
              icon={<ChangelogDraftIcon className="size-3.5" />}
              disabled={bulkAction !== null}
              pending={bulkAction === "draft"}
              onClick={() => void handleBulkStatus("draft")}
            />
          ) : null}
        </>
      }
    >
      <div className="space-y-6 pb-10" {...dragSelection}>
        {groups.map((group, index) => (
          <CollectionGroup
            key={group.collection?.id ?? "uncategorized"}
            group={group}
            workspaceSlug={workspaceSlug}
            isSelecting={selection.isSelectingForRender}
            getSelectionProps={getSelectionProps}
            selectionIndex={itemIndex}
            edges={{ first: index === 0, last: index === collectionIds.length - 1 }}
            onEdit={() => setEditing(group.collection)}
            onMoveCollection={(move) => {
              const next = group.collection ? moved(collectionIds, group.collection.id, move) : null;
              if (next) reorder("collections", next);
            }}
            onReorderArticles={(ids) => reorder("articles", ids)}
          />
        ))}
        <CollectionDialog
          open={Boolean(editing)}
          onOpenChange={(open) => !open && setEditing(null)}
          workspaceSlug={workspaceSlug}
          collection={editing}
        />
      </div>
    </SelectableListShell>
  );
}

/** Publish / Unpublish in the bulk selection toolbar. */
function BulkStatusButton({
  label,
  pendingLabel,
  icon,
  disabled,
  pending,
  onClick,
}: {
  label: string;
  pendingLabel: string;
  icon: React.ReactNode;
  disabled: boolean;
  pending: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="card"
      size="sm"
      className="h-8 gap-1.5 rounded-lg px-3 py-0"
      disabled={disabled}
      onClick={onClick}
      aria-label={`${label} selected articles`}
    >
      {icon}
      <span>{pending ? pendingLabel : label}</span>
    </Button>
  );
}

function CollectionGroup({
  group,
  workspaceSlug,
  isSelecting,
  getSelectionProps,
  selectionIndex,
  edges,
  onEdit,
  onMoveCollection,
  onReorderArticles,
}: {
  group: Group;
  workspaceSlug: string;
  isSelecting: boolean;
  getSelectionProps: GetSelectionProps;
  /** Position of each article across the whole list, for drag and shift-click ranges. */
  selectionIndex: Map<string, number>;
  edges: Edges;
  onEdit: () => void;
  onMoveCollection: (move: Move) => void;
  onReorderArticles: (ids: string[]) => void;
}) {
  const { collection, articles } = group;
  const refresh = useRefreshHelpTree(workspaceSlug);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const articleIds = React.useMemo(() => articles.map((a) => a.id), [articles]);
  // A stable id keeps dnd-kit's aria-describedby the same on the server and the client.
  const dndId = React.useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const activeArticle = activeId ? articles.find((a) => a.id === activeId) : undefined;

  // Keep the grabbing cursor while the pointer crosses other rows' links and buttons.
  React.useEffect(() => {
    if (!activeId) return;
    const previous = document.body.style.cursor;
    document.body.style.cursor = "grabbing";
    return () => {
      document.body.style.cursor = previous;
    };
  }, [activeId]);

  const moveArticle = (articleId: string, move: Move) => {
    const next = moved(articleIds, articleId, move);
    if (next) onReorderArticles(next);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const from = articleIds.indexOf(String(active.id));
    const to = articleIds.indexOf(String(over.id));
    if (from >= 0 && to >= 0) onReorderArticles(arrayMove(articleIds, from, to));
  };

  const newHref = `/workspaces/${workspaceSlug}/help/new${collection ? `?collection=${collection.id}` : ""}`;

  const handleDelete = async () => {
    if (!collection) return;
    setDeleting(true);
    try {
      const res = await client.help.collectionsDelete.$post({
        slug: workspaceSlug,
        collectionId: collection.id,
      });
      await expectOk(res, "Couldn't delete the collection");
      await refresh();
      toast.success("Collection deleted");
      setConfirmDelete(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't delete the collection");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section aria-label={collection?.name ?? "Uncategorized"}>
      <header className="group/collection flex items-center gap-3 border-b border-border/60 px-4 pb-2.5 sm:px-6 dark:border-white/[0.07]">
        <HelpCollectionTile icon={collection?.icon} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h2 className="truncate text-sm font-semibold">{collection?.name ?? "Uncategorized"}</h2>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {articles.length} {articles.length === 1 ? "article" : "articles"}
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {collection
              ? collection.description || "No description"
              : "Articles without a collection appear at the bottom of the help center."}
          </p>
        </div>
        {/* Revealed on hover so the list reads as content, not a wall of buttons. */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover/collection:opacity-100 has-[[data-state=open]]:opacity-100 [@media(hover:none)]:opacity-100">
          <ActionTooltip label={collection ? `New article in ${collection.name}` : "New article"}>
            <Button asChild variant="plain" size="icon-sm" className="text-muted-foreground hover:text-foreground">
              <Link href={newHref} aria-label={`New article in ${collection?.name ?? "Uncategorized"}`}>
                <Plus className="size-4" />
              </Link>
            </Button>
          </ActionTooltip>
          {collection ? (
            <CollectionMenu
              edges={edges}
              onEdit={onEdit}
              onMove={onMoveCollection}
              onDelete={() => setConfirmDelete(true)}
            />
          ) : null}
        </div>
      </header>

      {articles.length === 0 ? (
        <Link
          href={newHref}
          className="flex min-h-10 items-center px-4 text-sm text-muted-foreground transition-colors hover:text-foreground sm:px-6"
        >
          No articles yet. Write the first one.
        </Link>
      ) : (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragStart={({ active }) => setActiveId(String(active.id))}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext items={articleIds} strategy={verticalListSortingStrategy} disabled={isSelecting}>
            <ul
              className={cn(
                "m-0 list-none p-0 [&>li+li]:border-t [&>li+li]:border-border/40 dark:[&>li+li]:border-white/6",
                // Dividers ride along with the shifting rows, so fade them out mid-drag.
                activeId && "[&>li+li]:border-transparent dark:[&>li+li]:border-transparent",
              )}
            >
              {articles.map((article, index) => (
                <ArticleRow
                  key={article.id}
                  article={article}
                  workspaceSlug={workspaceSlug}
                  edges={{ first: index === 0, last: index === articles.length - 1 }}
                  listDragging={activeId !== null}
                  onMove={(move) => moveArticle(article.id, move)}
                  selectionIndex={selectionIndex.get(article.id)}
                  {...getSelectionProps(article.id)}
                />
              ))}
            </ul>
          </SortableContext>
          <DragOverlay dropAnimation={dropAnimation}>
            {activeArticle ? <ArticleDragPreview article={activeArticle} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <DestructiveConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        isPending={deleting}
        onConfirm={handleDelete}
        title="Delete collection"
        description="The collection is removed. Its articles are kept and move to Uncategorized."
      />
    </section>
  );
}

function CollectionMenu({
  edges,
  onEdit,
  onMove,
  onDelete,
}: {
  edges: Edges;
  onEdit: () => void;
  onMove: (move: Move) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ActionTooltip label="Edit, reorder or delete">
        <PopoverTrigger asChild>
          <Button
            variant="plain"
            size="icon-sm"
            aria-label="Collection actions"
            className="text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </PopoverTrigger>
      </ActionTooltip>
      <PopoverContent align="end" list className="w-max min-w-0">
        <PopoverList>
          <ContextMenuItem icon={<EditIcon className="size-4" />} label="Edit collection" onClick={run(onEdit)} />
          <PopoverSeparator />
          <MoveItems edges={edges} onMove={(move) => run(() => onMove(move))()} />
          <PopoverSeparator />
          <ContextMenuItem
            icon={<TrashIcon className="size-4" />}
            label="Delete collection"
            onClick={run(onDelete)}
            className={CONTEXT_MENU_DESTRUCTIVE_CLASS}
          />
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}

function MoveItems({ edges, onMove }: { edges: Edges; onMove: (move: Move) => void }) {
  return (
    <>
      <ContextMenuItem
        icon={<ChevronsUp className="size-4" />}
        label="Move to top"
        onClick={() => onMove("top")}
        disabled={edges.first}
      />
      <ContextMenuItem
        icon={<ChevronDown className="size-4 rotate-180" />}
        label="Move up"
        onClick={() => onMove("up")}
        disabled={edges.first}
      />
      <ContextMenuItem
        icon={<ChevronDown className="size-4" />}
        label="Move down"
        onClick={() => onMove("down")}
        disabled={edges.last}
      />
      <ContextMenuItem
        icon={<ChevronsDown className="size-4" />}
        label="Move to bottom"
        onClick={() => onMove("bottom")}
        disabled={edges.last}
      />
    </>
  );
}

/** Status, title and stats: shared by the list row and the card that follows the pointer. */
function ArticleRowBody({ article, className }: { article: HelpAdminArticle; className?: string }) {
  const isPublished = article.status === "published";
  const ratio = helpfulRatio(article);
  const authorName = article.authorName || "Unknown";
  return (
    <>
      <span className={cn("shrink-0", className)} title={isPublished ? "Published" : "Draft"}>
        {isPublished ? <ChangelogPublishedIcon className="size-4" /> : <ChangelogDraftIcon className="size-4" />}
      </span>
      <span className={cn("min-w-0 flex-1 truncate text-sm font-medium leading-5", className)}>{article.title}</span>
      <div
        className={cn(
          "pointer-events-none flex shrink-0 items-center gap-3 text-[10px] tabular-nums text-muted-foreground",
          className,
        )}
      >
        <span className="hidden w-16 text-right md:inline" title="Views">
          {article.viewCount} {article.viewCount === 1 ? "view" : "views"}
        </span>
        <span
          className={cn(
            "hidden w-16 text-right md:inline",
            ratio !== null && ratio >= 70 && "text-green-600 dark:text-green-400",
            ratio !== null && ratio < 40 && "text-red-500",
          )}
          title={`${article.helpfulCount} helpful, ${article.notHelpfulCount} not helpful`}
        >
          {ratio === null ? "No votes" : `${ratio}% helpful`}
        </span>
        <span className="hidden w-12 text-right sm:inline">
          {relativeTime(new Date(article.updatedAt).toISOString())}
        </span>
        <Avatar className="relative size-6 overflow-visible bg-muted">
          <AvatarImage src={article.authorImage || randomAvatarUrl(article.authorId)} alt={authorName} />
          <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
        </Avatar>
      </div>
    </>
  );
}

/**
 * The row while it is dragged: the same size and layout as in the list (dnd-kit sizes the
 * overlay to the row), set apart only by a background, a hairline ring and a soft shadow.
 */
function ArticleDragPreview({ article }: { article: HelpAdminArticle }) {
  return (
    <div
      className={cn(
        "pointer-events-none relative flex size-full min-h-10 cursor-grabbing items-center gap-3 rounded-md bg-background px-4 py-1.5 sm:px-6",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_6px_16px_-6px_rgba(0,0,0,0.16)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_20px_-6px_rgba(0,0,0,0.6)]",
      )}
    >
      <span className="absolute left-0 top-1/2 flex h-6 w-4 -translate-y-1/2 items-center justify-center text-foreground sm:left-1 sm:w-5">
        <MoveVerticalIcon className="size-3.5" />
      </span>
      <ArticleRowBody article={article} />
    </div>
  );
}

function ArticleRow({
  article,
  workspaceSlug,
  edges,
  listDragging,
  onMove,
  isSelecting = false,
  isSelected = false,
  onToggle,
  selectionIndex,
}: {
  article: HelpAdminArticle;
  workspaceSlug: string;
  edges: Edges;
  /** Some row in this collection is being dragged: hover states and handles stay quiet. */
  listDragging: boolean;
  onMove: (move: Move) => void;
  selectionIndex?: number;
} & SelectionItemProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: article.id });
  const menu = useContextMenuPosition();
  const refresh = useRefreshHelpTree(workspaceSlug);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const href = `/workspaces/${workspaceSlug}/help/${article.id}/edit`;
  const isPublished = article.status === "published";

  const run = (fn: () => void) => () => {
    menu.close();
    fn();
  };

  const mutate = async (action: () => Promise<Parameters<typeof expectOk>[0]>, success: string) => {
    setPending(true);
    try {
      await expectOk(await action(), "Something went wrong");
      await refresh();
      toast.success(success);
      setConfirmDelete(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  // In select mode a click anywhere on the row toggles it; shift-click selects a range.
  const handleRowClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (!isSelecting) return;
    event.preventDefault();
    event.stopPropagation();
    onToggle?.(!isSelected, { shiftKey: event.shiftKey });
  };

  const toggleStatus = () =>
    mutate(
      () =>
        client.help.articlesUpdate.$post({
          slug: workspaceSlug,
          articleId: article.id,
          status: isPublished ? "draft" : "published",
        }),
      isPublished ? "Article unpublished" : "Article published",
    );

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className="relative list-none"
      data-request-select-index={isSelecting ? selectionIndex : undefined}
    >
      <ContextMenuShell
        open={menu.open}
        onOpenChange={menu.handleOpenChange}
        position={menu.position}
        onContextMenu={menu.openAt}
        onClick={handleRowClick}
        menu={
          <PopoverList>
            <ContextMenuItem icon={<EditIcon className="size-4" />} label="Edit" onClick={run(() => router.push(href))} />
            <ContextMenuItem
              icon={isPublished ? <ChangelogDraftIcon className="size-4" /> : <ChangelogPublishedIcon className="size-4" />}
              label={isPublished ? "Unpublish" : "Publish"}
              onClick={run(toggleStatus)}
              disabled={pending}
            />
            <PopoverSeparator />
            <MoveItems edges={edges} onMove={(move) => run(() => onMove(move))()} />
            <PopoverSeparator />
            <ContextMenuItem
              icon={<TrashIcon className="size-4" />}
              label="Delete"
              onClick={run(() => setConfirmDelete(true))}
              className={CONTEXT_MENU_DESTRUCTIVE_CLASS}
            />
          </PopoverList>
        }
      >
        <div
          className={getSelectableRowClassName(
            isSelecting,
            isSelected,
            "group/article relative flex min-h-10 items-center gap-3 px-4 py-1.5 sm:px-6",
            listDragging ? "" : "hover:bg-muted/50 dark:hover:bg-white/[0.04]",
          )}
        >
          {isDragging ? (
            // The slot the dragged article will land in.
            <div
              aria-hidden
              className="absolute inset-x-2 inset-y-1 rounded-lg border border-dashed border-black/[0.12] bg-muted/50 sm:inset-x-4 dark:border-white/[0.1] dark:bg-white/[0.03]"
            />
          ) : null}
          {isSelecting ? (
            <SelectionControl
              checked={isSelected}
              label={isSelected ? "Deselect article" : "Select article"}
              onCheckedChange={(value) => onToggle?.(value)}
              onClick={(event) => event.stopPropagation()}
            />
          ) : (
            <>
              <Link href={href} className="absolute inset-0 z-0" aria-label={article.title} tabIndex={isDragging ? -1 : undefined} />
              <button
                ref={setActivatorNodeRef}
                type="button"
                {...attributes}
                {...listeners}
                aria-label={`Drag to reorder ${article.title}`}
                className={cn(
                  "absolute left-0 top-1/2 z-10 flex h-6 w-4 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 active:cursor-grabbing sm:left-1 sm:w-5",
                  !listDragging && "group-hover/article:opacity-100 [@media(hover:none)]:opacity-100",
                )}
              >
                <MoveVerticalIcon className="size-3.5" />
              </button>
            </>
          )}
          <ArticleRowBody article={article} className={cn(isDragging && "invisible")} />
        </div>
      </ContextMenuShell>
      <DestructiveConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        isPending={pending}
        onConfirm={() =>
          mutate(
            () => client.help.articlesDelete.$post({ slug: workspaceSlug, articleIds: [article.id] }),
            "Article deleted",
          )
        }
        title="Delete article"
        description="This article will be permanently removed from your help center."
      />
    </li>
  );
}
