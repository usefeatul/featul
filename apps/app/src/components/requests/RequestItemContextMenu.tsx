"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverList,
  PopoverListItem,
  PopoverSeparator,
} from "@featul/ui/components/popover";
import { TrashIcon } from "@featul/ui/icons/trash";
import { LayersIcon } from "@featul/ui/icons/layers";
import { TagIcon } from "@featul/ui/icons/tag";
import { FlagIcon } from "@featul/ui/icons/flag";
import { EditIcon } from "@featul/ui/icons/edit";
import { SelectBoxIcon } from "@featul/ui/icons/select-box";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";
import { useRequestItemActions } from "../../hooks/useRequestItemActions";
import { DestructiveConfirmDialog } from "@/components/global/DestructiveConfirmDialog";
import { BULK_DELETE_CONFIRM_CLASS } from "@/components/selection/constants";
import type { RequestItemData } from "@/types/request";
import { useRequestTags } from "../../hooks/useRequestTags";
import { useRequestFlags } from "../../hooks/useRequestFlags";
import { FlagsSubmenu, StatusSubmenu, TagsSubmenu } from "./RequestItemSubmenus";
import { setSelecting, toggleSelectionId } from "@/lib/selection-store";
import type { SelectionToggleMeta } from "@/components/selection/selection-row";

interface RequestItemContextMenuProps {
  children: React.ReactNode;
  item: RequestItemData;
  workspaceSlug: string;
  requestHref: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  listKey?: string;
  isSelecting?: boolean;
  isSelected?: boolean;
  onToggle?: (checked: boolean, meta?: SelectionToggleMeta) => void;
}

function MenuIcon({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex size-4 shrink-0 items-center justify-center">{children}</span>;
}

function MenuItem({
  icon,
  label,
  onClick,
  className,
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <PopoverListItem onClick={onClick} className={className}>
      <MenuIcon>{icon}</MenuIcon>
      <span className="text-sm">{label}</span>
      {trailing}
    </PopoverListItem>
  );
}

export function RequestItemContextMenu({
  children,
  item,
  workspaceSlug,
  requestHref,
  className,
  onClick,
  listKey,
  isSelecting,
  isSelected,
  onToggle,
}: RequestItemContextMenuProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [currentSubmenu, setCurrentSubmenu] = React.useState<
    "main" | "status" | "tags" | "flags"
  >("main");
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(
    null,
  );
  const [position, setPosition] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  const isSelectingMode = Boolean(isSelecting);
  const isSelectedMode = Boolean(isSelected);
  const isTagsMenu = currentSubmenu === "tags";
  const currentStatus = item.roadmapStatus || "pending";

  const { availableTags, optimisticTags, toggleTag, triggerPendingRefresh } =
    useRequestTags({
      item,
      workspaceSlug,
      enabled: open && isTagsMenu,
    });

  const { optimisticFlags, toggleFlag } = useRequestFlags({ item });

  const closeMenu = React.useCallback(() => {
    setOpen(false);
    setCurrentSubmenu("main");
    setUpdatingStatus(null);
  }, []);

  const { updateStatus, deleteRequest, isPending } = useRequestItemActions({
    requestId: item.id,
    workspaceSlug,
    roadmapStatus: item.roadmapStatus,
    onSuccess: () => {
      closeMenu();
      setShowDeleteDialog(false);
    },
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSelectingMode) {
      onToggle?.(!isSelectedMode, { shiftKey: e.shiftKey });
      return;
    }

    setPosition({ x: e.clientX, y: e.clientY });
    setCurrentSubmenu("main");
    setUpdatingStatus(null);
    setOpen(true);
  };

  const handleOpenRequest = () => {
    router.push(requestHref);
    closeMenu();
  };

  const handleStartSelection = () => {
    if (!listKey) return;
    setSelecting(listKey, true);
    toggleSelectionId(listKey, item.id, true);
    closeMenu();
  };

  const handleUpdateStatus = async (status: string) => {
    setUpdatingStatus(status);
    await updateStatus(status);
    setUpdatingStatus(null);
  };

  const menuContent = (() => {
    if (currentSubmenu === "status") {
      return (
        <StatusSubmenu
          currentStatus={currentStatus}
          isPending={isPending}
          updatingStatus={updatingStatus}
          onBack={() => setCurrentSubmenu("main")}
          onUpdateStatus={handleUpdateStatus}
        />
      );
    }

    if (currentSubmenu === "tags") {
      return (
        <TagsSubmenu
          availableTags={availableTags}
          optimisticTags={optimisticTags}
          onBack={() => setCurrentSubmenu("main")}
          onToggleTag={toggleTag}
        />
      );
    }

    if (currentSubmenu === "flags") {
      return (
        <FlagsSubmenu
          flags={optimisticFlags}
          onBack={() => setCurrentSubmenu("main")}
          onToggleFlag={toggleFlag}
        />
      );
    }

    return (
      <PopoverList>
        <MenuItem
          icon={<EditIcon className="size-4" />}
          label="Open"
          onClick={handleOpenRequest}
        />
        {listKey ? (
          <MenuItem
            icon={<SelectBoxIcon className="size-4" />}
            label="Select"
            onClick={handleStartSelection}
          />
        ) : null}

        <PopoverSeparator />

        <MenuItem
          icon={<LayersIcon className="size-4" />}
          label="Status"
          onClick={() => setCurrentSubmenu("status")}
          trailing={
            <ChevronRightIcon className="size-3.5 text-muted-foreground" />
          }
        />
        <MenuItem
          icon={<TagIcon className="size-4" />}
          label="Tags"
          onClick={() => setCurrentSubmenu("tags")}
          trailing={
            <ChevronRightIcon className="size-3.5 text-muted-foreground" />
          }
        />
        <MenuItem
          icon={<FlagIcon className="size-4" />}
          label="Flags"
          onClick={() => setCurrentSubmenu("flags")}
          trailing={
            <ChevronRightIcon className="size-3.5 text-muted-foreground" />
          }
        />

        <PopoverSeparator />

        <MenuItem
          icon={<TrashIcon className="size-4" />}
          label="Delete"
          onClick={() => setShowDeleteDialog(true)}
          className="text-destructive hover:text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
        />
      </PopoverList>
    );
  })();

  return (
    <>
      <DestructiveConfirmDialog
        open={showDeleteDialog}
        isPending={isPending}
        onOpenChange={setShowDeleteDialog}
        onConfirm={deleteRequest}
        title="Delete request?"
        description="This will permanently delete this request. This action cannot be undone."
        confirmClassName={BULK_DELETE_CONFIRM_CLASS}
      />
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setCurrentSubmenu("main");
            setUpdatingStatus(null);
            triggerPendingRefresh();
          }
        }}
      >
        {position ? (
          <PopoverAnchor asChild>
            <div
              className="pointer-events-none fixed h-px w-px"
              style={{
                top: position.y,
                left: position.x,
              }}
            />
          </PopoverAnchor>
        ) : null}

        <div
          onContextMenu={handleContextMenu}
          className={className}
          onClick={onClick}
        >
          {children}
        </div>

        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={4}
          className="fit"
          list
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          {menuContent}
        </PopoverContent>
      </Popover>
    </>
  );
}
