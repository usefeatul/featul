"use client";

import React from "react";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import { Input } from "@featul/ui/components/input";
import { Textarea } from "@featul/ui/components/textarea";
import { cn } from "@featul/ui/lib/utils";
import { LoadingButton } from "@/components/global/LoadingButton";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import { BookIcon } from "@/components/global/icons";
import { expectOk, useRefreshHelpTree } from "@/hooks/useHelpTree";
import {
  HELP_ICON_KEYS,
  HelpCollectionIcon,
  helpCollectionTileClass,
  type HelpCollectionIconKey,
} from "./icons";
import type { HelpAdminCollection } from "./types";

type CollectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceSlug: string;
  /** Edit this collection; omit to create one. */
  collection?: HelpAdminCollection | null;
};

export function CollectionDialog({
  open,
  onOpenChange,
  workspaceSlug,
  collection,
}: CollectionDialogProps) {
  const refresh = useRefreshHelpTree(workspaceSlug);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [icon, setIcon] = React.useState<HelpCollectionIconKey>("book");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setName(collection?.name ?? "");
    setDescription(collection?.description ?? "");
    setIcon((collection?.icon as HelpCollectionIconKey) ?? "book");
  }, [open, collection]);

  const trimmed = name.trim();

  const handleSave = async () => {
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const res = collection
        ? await client.help.collectionsUpdate.$post({
            slug: workspaceSlug,
            collectionId: collection.id,
            name: trimmed,
            description: description.trim() || null,
            icon,
          })
        : await client.help.collectionsCreate.$post({
            slug: workspaceSlug,
            name: trimmed,
            description: description.trim() || undefined,
            icon,
          });
      await expectOk(res, "Couldn't save the collection");
      await refresh();
      toast.success(collection ? "Collection updated" : "Collection created");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save the collection");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={collection ? "Edit collection" : "New collection"}
      description="Collections group related articles on your help center home page."
      icon={<BookIcon className="size-3.5" />}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        <div className="space-y-1.5">
          <label htmlFor="help-collection-name" className="text-xs font-medium text-muted-foreground">
            Name
          </label>
          <Input
            id="help-collection-name"
            autoFocus
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            placeholder="Getting started"
            className="h-10 placeholder:text-accent"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="help-collection-description" className="text-xs font-medium text-muted-foreground">
            Description
          </label>
          <Textarea
            id="help-collection-description"
            value={description}
            maxLength={240}
            rows={2}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Set up your board and invite the people who will use it."
            className="resize-none placeholder:text-accent"
          />
        </div>
        <fieldset className="space-y-1.5">
          <legend className="text-xs font-medium text-muted-foreground">Icon</legend>
          <div className="grid grid-cols-10 gap-1">
            {HELP_ICON_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                aria-label={key}
                aria-pressed={icon === key}
                onClick={() => setIcon(key)}
                className={cn(
                  helpCollectionTileClass,
                  "aspect-square w-full cursor-pointer transition-[color,box-shadow]",
                  icon === key
                    ? "text-primary ring-2 ring-primary/50"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <HelpCollectionIcon icon={key} className="size-4" />
              </button>
            ))}
          </div>
        </fieldset>
        <div className="flex justify-end gap-2 pt-1">
          <LoadingButton type="button" variant="card" onClick={() => onOpenChange(false)}>
            Cancel
          </LoadingButton>
          <LoadingButton type="submit" loading={saving} disabled={!trimmed || saving}>
            {collection ? "Save" : "Create collection"}
          </LoadingButton>
        </div>
      </form>
    </SettingsDialogShell>
  );
}
