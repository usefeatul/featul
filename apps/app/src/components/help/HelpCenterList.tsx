"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  EditIcon,
  MoreHorizontal,
  Plus,
  TrashIcon,
} from "@/components/global/icons";
import { ContextMenuShell } from "@/components/global/ContextMenuShell";
import { ContextMenuItem, CONTEXT_MENU_DESTRUCTIVE_CLASS } from "@/components/global/ContextMenuItem";
import { DestructiveConfirmDialog } from "@/components/global/DestructiveConfirmDialog";
import { useContextMenuPosition } from "@/hooks/useContextMenuPosition";
import { expectOk, useHelpTree, useRefreshHelpTree } from "@/hooks/useHelpTree";
import { relativeTime } from "@/lib/time";
import { getInitials } from "@/utils/user";
import { randomAvatarUrl } from "@/utils/avatar";
import { CollectionDialog } from "./CollectionDialog";
import { HelpCollectionIcon } from "./icons";
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

/** New order of ids after moving `id` one step in `direction`; null at either end. */
function moved(ids: string[], id: string, direction: -1 | 1) {
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ids.length) return null;
  const next = [...ids];
  [next[from], next[to]] = [next[to]!, next[from]!];
  return next;
}

export function HelpCenterList({
  workspaceSlug,
  initialTree,
}: {
  workspaceSlug: string;
  initialTree: HelpAdminTree;
}) {
  const { data: tree = initialTree } = useHelpTree(workspaceSlug, initialTree);
  const refresh = useRefreshHelpTree(workspaceSlug);
  const [editing, setEditing] = React.useState<HelpAdminCollection | null>(null);
  const groups = React.useMemo(() => groupArticles(tree), [tree]);

  const reorder = React.useCallback(
    async (kind: "collections" | "articles", ids: string[]) => {
      try {
        const res =
          kind === "collections"
            ? await client.help.collectionsReorder.$post({ slug: workspaceSlug, ids })
            : await client.help.articlesReorder.$post({ slug: workspaceSlug, ids });
        await expectOk(res, "Couldn't reorder");
        await refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't reorder");
      }
    },
    [workspaceSlug, refresh],
  );

  if (tree.collections.length === 0 && tree.articles.length === 0) {
    return <EmptyHelpCenter workspaceSlug={workspaceSlug} />;
  }

  const collectionIds = tree.collections.map((c) => c.id);

  return (
    <div className="space-y-6 pb-10">
      {groups.map((group) => (
        <CollectionGroup
          key={group.collection?.id ?? "uncategorized"}
          group={group}
          workspaceSlug={workspaceSlug}
          onEdit={() => setEditing(group.collection)}
          onMoveCollection={(direction) => {
            const next = group.collection ? moved(collectionIds, group.collection.id, direction) : null;
            if (next) void reorder("collections", next);
          }}
          onMoveArticle={(articleId, direction) => {
            const next = moved(group.articles.map((a) => a.id), articleId, direction);
            if (next) void reorder("articles", next);
          }}
        />
      ))}
      <CollectionDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        workspaceSlug={workspaceSlug}
        collection={editing}
      />
    </div>
  );
}

function CollectionGroup({
  group,
  workspaceSlug,
  onEdit,
  onMoveCollection,
  onMoveArticle,
}: {
  group: Group;
  workspaceSlug: string;
  onEdit: () => void;
  onMoveCollection: (direction: -1 | 1) => void;
  onMoveArticle: (articleId: string, direction: -1 | 1) => void;
}) {
  const { collection, articles } = group;
  const refresh = useRefreshHelpTree(workspaceSlug);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
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
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 text-muted-foreground dark:border-white/10">
          <HelpCollectionIcon icon={collection?.icon ?? "book"} className="size-4" />
        </span>
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
        <div className="flex shrink-0 items-center gap-0.5">
          <Button asChild variant="plain" size="icon-sm" className="text-muted-foreground hover:text-foreground">
            <Link href={newHref} aria-label={`New article in ${collection?.name ?? "Uncategorized"}`} title="New article">
              <Plus className="size-4" />
            </Link>
          </Button>
          {collection ? (
            <CollectionMenu
              onEdit={onEdit}
              onMoveUp={() => onMoveCollection(-1)}
              onMoveDown={() => onMoveCollection(1)}
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
        <ul className="m-0 list-none p-0 [&>li+li]:border-t [&>li+li]:border-border/40 dark:[&>li+li]:border-white/6">
          {articles.map((article) => (
            <ArticleRow
              key={article.id}
              article={article}
              workspaceSlug={workspaceSlug}
              onMove={(direction) => onMoveArticle(article.id, direction)}
            />
          ))}
        </ul>
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
  onEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
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
      <PopoverContent align="end" list className="w-max min-w-0">
        <PopoverList>
          <ContextMenuItem icon={<EditIcon className="size-4" />} label="Edit collection" onClick={run(onEdit)} />
          <ContextMenuItem icon={<MoveUpIcon />} label="Move up" onClick={run(onMoveUp)} />
          <ContextMenuItem icon={<ChevronDown className="size-4" />} label="Move down" onClick={run(onMoveDown)} />
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

function MoveUpIcon() {
  return <ChevronDown className="size-4 rotate-180" />;
}

function ArticleRow({
  article,
  workspaceSlug,
  onMove,
}: {
  article: HelpAdminArticle;
  workspaceSlug: string;
  onMove: (direction: -1 | 1) => void;
}) {
  const router = useRouter();
  const menu = useContextMenuPosition();
  const refresh = useRefreshHelpTree(workspaceSlug);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const href = `/workspaces/${workspaceSlug}/help/${article.id}/edit`;
  const isPublished = article.status === "published";
  const ratio = helpfulRatio(article);
  const authorName = article.authorName || "Unknown";

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
    <li className="list-none">
      <ContextMenuShell
        open={menu.open}
        onOpenChange={menu.handleOpenChange}
        position={menu.position}
        onContextMenu={menu.openAt}
        menu={
          <PopoverList>
            <ContextMenuItem icon={<EditIcon className="size-4" />} label="Edit" onClick={run(() => router.push(href))} />
            <ContextMenuItem
              icon={isPublished ? <ChangelogDraftIcon className="size-4" /> : <ChangelogPublishedIcon className="size-4" />}
              label={isPublished ? "Unpublish" : "Publish"}
              onClick={run(toggleStatus)}
              disabled={pending}
            />
            <ContextMenuItem icon={<MoveUpIcon />} label="Move up" onClick={run(() => onMove(-1))} />
            <ContextMenuItem icon={<ChevronDown className="size-4" />} label="Move down" onClick={run(() => onMove(1))} />
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
        <div className="group/article relative flex min-h-10 items-center gap-3 px-4 py-1.5 hover:bg-muted/50 sm:px-6 dark:hover:bg-white/[0.04]">
          <Link href={href} className="absolute inset-0 z-0" aria-label={article.title} />
          <span className="shrink-0" title={isPublished ? "Published" : "Draft"}>
            {isPublished ? <ChangelogPublishedIcon className="size-4" /> : <ChangelogDraftIcon className="size-4" />}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium leading-5">{article.title}</span>
          <div className="pointer-events-none flex shrink-0 items-center gap-3 text-[10px] tabular-nums text-muted-foreground">
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
