"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";
import { FeedEditor } from "@/components/editor/editor";
import type { MentionSuggestionItem } from "@featul/editor";
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverListItem,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import { cn } from "@featul/ui/lib/utils";
import {
  ChevronDown,
  ChevronLeftIcon,
  InfoIcon,
  LoaderIcon,
  TickIcon,
} from "@/components/global/icons";
import WorkspaceHeader from "@/components/global/WorkspaceHeader";
import type { EditorAction } from "@/components/changelog/EditorHeaderContext";
import { Timeline } from "@/components/changelog/timeline";
import { fetchWorkspaceMembers } from "@/lib/team/client";
import { useHelpArticle, type HelpArticleFormData } from "@/hooks/useHelpArticle";
import { useHelpTree } from "@/hooks/useHelpTree";
import { HelpCollectionIcon } from "./icons";
import type { HelpAdminCollection } from "./types";

type HelpArticleEditorProps = {
  workspaceSlug: string;
  mode: "create" | "edit";
  articleId?: string;
  initialData?: HelpArticleFormData;
  initialCollectionId?: string | null;
  collections: HelpAdminCollection[];
};

export function HelpArticleEditor({
  workspaceSlug,
  mode,
  articleId,
  initialData,
  initialCollectionId,
  collections: initialCollections,
}: HelpArticleEditorProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLElement>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestionItem[]>([]);
  const { data: tree } = useHelpTree(workspaceSlug);
  const collections = tree?.collections ?? initialCollections;
  const {
    editorRef,
    title,
    setTitle,
    summary,
    setSummary,
    collectionId,
    setCollectionId,
    isDraft,
    setIsDraft,
    isSaving,
    isDirty,
    setIsDirty,
    handleImageUpload,
    handleSave,
  } = useHelpArticle({ workspaceSlug, mode, articleId, initialData, initialCollectionId });

  useEffect(() => {
    let cancelled = false;
    fetchWorkspaceMembers(workspaceSlug)
      .then((members) => {
        if (cancelled) return;
        setMentionSuggestions(
          members
            .filter((m) => m.userId)
            .map((m) => ({
              id: m.userId,
              label: m.name || m.email?.split("@")[0] || m.userId.slice(0, 8),
              email: m.email ?? null,
              avatarUrl: m.image ?? null,
            })),
        );
      })
      .catch(() => {
        if (!cancelled) setMentionSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceSlug]);

  const headerActions: EditorAction[] = [
    {
      key: "status",
      label: "Published",
      type: "switch",
      checked: !isDraft,
      onClick: () => {
        setIsDraft(!isDraft);
        setIsDirty(true);
      },
    },
    {
      key: "save",
      label: isSaving ? "Saving changes" : isDirty || mode === "create" ? "Save" : "Saved",
      type: "button",
      variant: "plain",
      icon: isSaving ? (
        <LoaderIcon className="size-4 text-yellow-600 dark:text-yellow-400" />
      ) : isDirty || mode === "create" ? (
        <InfoIcon className="size-4 text-yellow-600 dark:text-yellow-400" />
      ) : (
        <TickIcon className="size-4 text-green-600 dark:text-green-400" />
      ),
      onClick: () => void handleSave(),
      disabled: isSaving,
    },
    {
      key: "back",
      label: "Back to help center",
      type: "button",
      variant: "plain",
      icon: <ChevronLeftIcon className="size-3" />,
      onClick: () => router.push(`/workspaces/${workspaceSlug}/help`),
    },
  ];

  const markDirty = () => setIsDirty(true);

  return (
    <div
      data-changelog-editor
      className="relative min-h-[calc(100dvh-var(--workspace-mobile-nav-height))] bg-background lg:flex lg:h-dvh lg:min-h-dvh lg:overflow-hidden"
    >
      <div className="flex min-w-0 flex-1 flex-col bg-background lg:min-h-0">
        <WorkspaceHeader
          workspaceName={workspaceSlug}
          embeddedInEditor
          editorActions={headerActions}
          editorTitle={title}
        />
        <div className="relative flex min-h-0 flex-1 flex-col">
          <Timeline scrollRef={scrollRef} title={title} />
          <article
            ref={scrollRef}
            className="scrollbar-hide flex min-h-[calc(100dvh-3rem-var(--workspace-mobile-nav-height))] w-full min-w-0 flex-col bg-background lg:min-h-0 lg:w-auto lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:pl-9"
          >
            <header className="mx-auto w-full max-w-3xl shrink-0 px-4 pt-6 sm:px-6 sm:pt-10">
              <CollectionPicker
                collections={collections}
                value={collectionId}
                onChange={(id) => {
                  setCollectionId(id);
                  markDirty();
                }}
              />
            </header>
            <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-4 sm:px-6">
              <TextareaAutosize
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  markDirty();
                }}
                placeholder="Article title"
                maxLength={200}
                className="w-full resize-none overflow-hidden border-none bg-transparent text-3xl font-semibold tracking-tight placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
                minRows={1}
                autoFocus={mode === "create"}
              />
              <TextareaAutosize
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  markDirty();
                }}
                placeholder="Short description shown in search results and collection lists"
                maxLength={300}
                className="mt-2 w-full resize-none overflow-hidden border-none bg-transparent text-base leading-relaxed text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0"
                minRows={1}
              />
              <div className="mb-8 mt-6 border-t border-border/60 dark:border-white/[0.07]" />
              <div className="min-h-[calc(100%-4rem)] [&_.ProseMirror]:border-none [&_.ProseMirror]:outline-none [&_.ProseMirror:focus]:outline-none [&_.ProseMirror:focus]:ring-0">
                <FeedEditor
                  ref={editorRef}
                  initialContent={initialData?.content}
                  placeholder="Write the answer. Type / for headings, callouts, images and more"
                  className="min-h-full"
                  mentionSuggestions={mentionSuggestions}
                  onImageUpload={handleImageUpload}
                  onUpdate={markDirty}
                />
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

function CollectionPicker({
  collections,
  value,
  onChange,
}: {
  collections: HelpAdminCollection[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = collections.find((c) => c.id === value) ?? null;
  const pick = (id: string | null) => {
    setOpen(false);
    onChange(id);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border border-border/70 px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground dark:border-white/10"
        >
          <HelpCollectionIcon icon={selected?.icon} className="size-3.5" />
          <span className="max-w-48 truncate">{selected?.name ?? "No collection"}</span>
          <ChevronDown className="size-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" list className="w-56 min-w-0">
        <div className="px-3 py-2 text-xs font-medium text-accent">Collection</div>
        <PopoverList>
          {collections.map((c) => (
            <PopoverListItem key={c.id} onClick={() => pick(c.id)}>
              <HelpCollectionIcon icon={c.icon} className="size-4 text-muted-foreground" />
              <span className={cn("truncate text-sm", c.id === value && "text-primary")}>{c.name}</span>
            </PopoverListItem>
          ))}
          <PopoverListItem onClick={() => pick(null)}>
            <span className="size-4" />
            <span className={cn("text-sm text-muted-foreground", value === null && "text-primary")}>
              No collection
            </span>
          </PopoverListItem>
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}
