"use client";

import { useState } from "react";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import { toUrlSlug } from "@featul/api/shared/slug";
import { Button } from "@featul/ui/components/button";
import { Input, InputGroup } from "@featul/ui/components/input";
import { LoaderIcon } from "@/components/global/icons";

interface EntryUrlFormProps {
  workspaceSlug: string;
  entryId: string;
  entrySlug: string;
  title: string;
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

/** Edits the entry's public URL segment and saves it straight away. */
export function EntryUrlForm({
  workspaceSlug,
  entryId,
  entrySlug,
  title,
  isPublished,
  onSaved,
}: EntryUrlFormProps) {
  const [value, setValue] = useState(entrySlug);
  const [isSaving, setIsSaving] = useState(false);

  const next = toUrlSlug(value);
  const changed = next !== entrySlug;
  const fromTitle = toUrlSlug(title);

  const save = async () => {
    if (!next || !changed) return;
    setIsSaving(true);
    try {
      await client.changelog.entriesUpdate.$post({
        slug: workspaceSlug,
        entryId,
        entrySlug: next,
      });
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
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className="flex gap-1.5">
        <InputGroup className="h-8.5 pr-1">
          <Input
            variant="plain"
            value={value}
            onChange={(event) => setValue(sanitizeTyping(event.target.value))}
            onBlur={() => setValue(next)}
            placeholder="your-update"
            aria-label="Entry URL slug"
            spellCheck={false}
            autoComplete="off"
            autoFocus
            maxLength={120}
          />
          {fromTitle && fromTitle !== next ? (
            <Button
              type="button"
              variant="plain"
              size="xs"
              className="h-6 shrink-0 bg-transparent px-1.5 text-xs text-muted-foreground hover:text-foreground dark:bg-transparent dark:text-muted-foreground dark:hover:text-foreground"
              onClick={() => setValue(fromTitle)}
            >
              Use title
            </Button>
          ) : null}
        </InputGroup>
        <Button
          type="submit"
          size="sm"
          className="shrink-0 text-xs"
          disabled={!next || !changed || isSaving}
        >
          {isSaving ? <LoaderIcon className="size-3.5" /> : null}
          Save
        </Button>
      </div>

      {isPublished && changed && next ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Links already shared to the old URL will stop working.
        </p>
      ) : null}
    </form>
  );
}
