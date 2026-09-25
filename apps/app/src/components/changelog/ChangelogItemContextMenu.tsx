"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PopoverList, PopoverSeparator } from "@featul/ui/components/popover";
import {
  EditIcon,
  TrashIcon,
} from "@/components/global/icons";
import { LoaderIcon } from "@featul/ui/icons/loader";

import { PenIcon } from "@featul/ui/icons/pen";
import { useChangelogEntryActions } from "@/hooks/useChangelogEntryActions";
import { useContextMenuPosition } from "@/hooks/useContextMenuPosition";
import { ChangelogDeleteDialog } from "./ChangelogDeleteDialog";
import { ContextMenuShell } from "@/components/global/ContextMenuShell";
import {
  CONTEXT_MENU_DESTRUCTIVE_CLASS,
  ContextMenuItem,
} from "@/components/global/ContextMenuItem";
import type { ChangelogEntryWithTags } from "@/app/workspaces/[slug]/changelog/data";

interface ChangelogItemContextMenuProps {
  children: React.ReactNode;
  item: ChangelogEntryWithTags;
  workspaceSlug: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export function ChangelogItemContextMenu({
  children,
  item,
  workspaceSlug,
  onClick,
}: ChangelogItemContextMenuProps) {
  const router = useRouter();
  const menu = useContextMenuPosition();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const { publish, unpublish, isPending } = useChangelogEntryActions({
    workspaceSlug,
    entryId: item.id,
  });

  const handleEdit = () => {
    router.push(`/workspaces/${workspaceSlug}/changelog/${item.id}/edit`);
    menu.close();
  };

  return (
    <>
      <ChangelogDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        workspaceSlug={workspaceSlug}
        entryId={item.id}
      />

      <ContextMenuShell
        open={menu.open}
        onOpenChange={menu.handleOpenChange}
        position={menu.position}
        onContextMenu={menu.openAt}
        onClick={onClick}
        menu={
          <PopoverList>
            <ContextMenuItem
              icon={<EditIcon className="size-4" />}
              label="Edit"
              onClick={handleEdit}
            />

            {item.status === "draft" ? (
              <ContextMenuItem
                icon={
                  isPending ? (
                    <LoaderIcon className="size-4" />
                  ) : (
                    <LoaderIcon className="size-4" />
                  )
                }
                label="Publish"
                onClick={publish}
              />
            ) : null}

            {item.status === "published" ? (
              <ContextMenuItem
                icon={
                  isPending ? (
                    <LoaderIcon className="size-4" />
                  ) : (
                    <PenIcon className="size-4" />
                  )
                }
                label="Unpublish"
                onClick={unpublish}
              />
            ) : null}

            <PopoverSeparator />

            <ContextMenuItem
              icon={<TrashIcon className="size-4" />}
              label="Delete"
              onClick={() => setShowDeleteDialog(true)}
              className={CONTEXT_MENU_DESTRUCTIVE_CLASS}
            />
          </PopoverList>
        }
      >
        {children}
      </ContextMenuShell>
    </>
  );
}
