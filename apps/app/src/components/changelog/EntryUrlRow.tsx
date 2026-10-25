"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import { toUrlSlug } from "@featul/api/shared/slug";
import { cn } from "@featul/ui/lib/utils";
import { LoaderIcon } from "@/components/global/icons";
import { ShortcutKey } from "@/components/global/keys";

interface EntryUrlRowProps {
  icon: ReactNode;
  workspaceSlug: string;
  /** Unset until the entry is first saved; the field stays read-only until then. */
  entryId?: string;
  entrySlug: string;
  isPublished: boolean;
  onSaved: (entrySlug: string) => void;
}

/** Keeps typing natural (a trailing hyphen survives) while only allowing URL-safe characters. */
function sanitizeTyping(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "");
}

/** The URL row is the field: edit the slug in place, Enter saves, Escape reverts. */
export function EntryUrlRow({
  icon,
  workspaceSlug,
  entryId,
  entrySlug,
  isPublished,
  onSaved,
}: EntryUrlRowProps) {
  const [value, setValue] = useState(entrySlug);
  const [isSaving, setIsSaving] = useState(false);

  const next = toUrlSlug(value);
  const changed = Boolean(next) && next !== entrySlug;
  const editable = Boolean(entryId && entrySlug);

  const save = async () => {
    if (!entryId || !changed || isSaving) return;
    setIsSaving(true);
    try {
      await client.changelog.entriesUpdate.$post({
        slug: workspaceSlug,
        entryId,
        entrySlug: next,
      });
      setValue(next);
      onSaved(next);
      toast.success("URL updated");
    } catch (error) {
      toast.error(
        (error as { message?: string })?.message || "Couldn't update the URL",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <label
        className={cn(
          "flex h-10 w-full items-center gap-2 px-3 text-xs transition-colors",
          editable && "cursor-text hover:bg-muted/40 focus-within:bg-muted/40",
        )}
      >
        <span className="text-muted-foreground">{icon}</span>
        <span className="shrink-0 text-muted-foreground">URL</span>
        <span className="ml-auto shrink-0 text-muted-foreground">/p/</span>
        <input
          value={editable ? value : ""}
          onChange={(event) => setValue(sanitizeTyping(event.target.value))}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void save();
            } else if (event.key === "Escape" && value !== entrySlug) {
              setValue(entrySlug);
            }
          }}
          disabled={!editable || isSaving}
          placeholder="Set after first save"
          aria-label="Entry URL slug"
          // The panel reads this to let Escape revert the edit instead of closing.
          data-pending-edit={value !== entrySlug || undefined}
          spellCheck={false}
          autoComplete="off"
          maxLength={120}
          className="min-w-0 flex-1 bg-transparent font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground disabled:cursor-default"
        />
        {isSaving ? (
          <LoaderIcon className="size-3.5 shrink-0 text-muted-foreground" />
        ) : changed ? (
          <ShortcutKey className="shrink-0">↵</ShortcutKey>
        ) : null}
      </label>
      {isPublished && changed ? (
        <p className="px-3 pb-2.5 text-[11px] text-amber-600 dark:text-amber-400">
          Links already shared to the old URL will stop working.
        </p>
      ) : null}
    </div>
  );
}
