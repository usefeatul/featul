"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PopoverList, PopoverSeparator } from "@featul/ui/components/popover";
import { TrashIcon } from "@featul/ui/icons/trash";
import { LayersIcon } from "@featul/ui/icons/layers";
import { TagIcon } from "@featul/ui/icons/tag";
import { FlagIcon } from "@featul/ui/icons/flag";
import { EditIcon } from "@featul/ui/icons/edit";
import { SelectBoxIcon } from "@featul/ui/icons/select-box";
import { useRequestItemActions } from "@/hooks/useRequestItemActions";
import { useRequestTags } from "@/hooks/useRequestTags";
import { useRequestFlags } from "@/hooks/useRequestFlags";
import { useContextMenuPosition } from "@/hooks/useContextMenuPosition";
import { DestructiveConfirmDialog } from "@/components/global/DestructiveConfirmDialog";
import { ContextMenuShell } from "@/components/global/ContextMenuShell";
import {
  CONTEXT_MENU_DESTRUCTIVE_CLASS,
  ContextMenuItem,
  ContextMenuSubmenuItem,
} from "@/components/global/ContextMenuItem";
import { BULK_DELETE_CONFIRM_CLASS } from "@/components/selection/constants";
import { FlagsSubmenu, StatusSubmenu, TagsSubmenu, SnoozeSubmenu } from "./RequestItemSubmenus";
import { setSelecting, toggleSelectionId } from "@/lib/selection/store";
import type { SelectionToggleMeta } from "@/components/selection/Row";
import type { RequestItemData } from "@/types/request";
import { useRequestSnooze } from "@/hooks/useRequestSnooze";
import { isActivelySnoozed } from "@featul/api/shared/snooze";
import { Clock } from "lucide-react";

type RequestSubmenu = "main" | "status" | "tags" | "flags" | "snooze";

const SUBMENU_ITEMS = [
  { id: "status" as const, label: "Status", icon: LayersIcon },
  { id: "tags" as const, label: "Tags", icon: TagIcon },
  { id: "flags" as const, label: "Flags", icon: FlagIcon },
  { id: "snooze" as const, label: "Snooze", icon: Clock },
];

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
  const menu = useContextMenuPosition();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [currentSubmenu, setCurrentSubmenu] =
    React.useState<RequestSubmenu>("main");
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(
    null,
  );

  const isSelectingMode = Boolean(isSelecting);
  const isSelectedMode = Boolean(isSelected);
  const currentStatus = item.roadmapStatus || "pending";

  const resetSubmenu = React.useCallback(() => {
    setCurrentSubmenu("main");
    setUpdatingStatus(null);
  }, []);

  const closeMenu = React.useCallback(() => {
    menu.close();
    resetSubmenu();
  }, [menu, resetSubmenu]);

  const { availableTags, optimisticTags, toggleTag, triggerPendingRefresh } =
    useRequestTags({
      item,
      workspaceSlug,
      enabled: menu.open && currentSubmenu === "tags",
    });

  const { optimisticFlags, toggleFlag } = useRequestFlags({ item });

  const { isUpdating: isSnoozing, snoozeForPreset, clearSnooze } =
    useRequestSnooze({
      postId: item.id,
      workspaceSlug,
      snoozedUntil: item.snoozedUntil,
      onSuccess: closeMenu,
    });

  const { updateStatus, deleteRequest, isPending } = useRequestItemActions({
    requestId: item.id,
    workspaceSlug,
    roadmapStatus: item.roadmapStatus,
    onSuccess: () => {
      closeMenu();
      setShowDeleteDialog(false);
    },
  });

  const handleContextMenu = (event: React.MouseEvent) => {
    if (isSelectingMode) {
      event.preventDefault();
      event.stopPropagation();
      onToggle?.(!isSelectedMode, { shiftKey: event.shiftKey });
      return;
    }

    resetSubmenu();
    menu.openAt(event);
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

  const renderSubmenu = () => {
    switch (currentSubmenu) {
      case "status":
        return (
          <StatusSubmenu
            currentStatus={currentStatus}
            isPending={isPending}
            updatingStatus={updatingStatus}
            onBack={() => setCurrentSubmenu("main")}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      case "tags":
        return (
          <TagsSubmenu
            availableTags={availableTags}
            optimisticTags={optimisticTags}
            onBack={() => setCurrentSubmenu("main")}
            onToggleTag={toggleTag}
          />
        );
      case "flags":
        return (
          <FlagsSubmenu
            flags={optimisticFlags}
            onBack={() => setCurrentSubmenu("main")}
            onToggleFlag={toggleFlag}
          />
        );
      case "snooze":
        return (
          <SnoozeSubmenu
            isSnoozed={isActivelySnoozed(item.snoozedUntil)}
            isPending={isSnoozing}
            onBack={() => setCurrentSubmenu("main")}
            onSnooze={snoozeForPreset}
            onClear={clearSnooze}
          />
        );
      default:
        return (
          <PopoverList>
            <ContextMenuItem
              icon={<EditIcon className="size-4" />}
              label="Open"
              onClick={handleOpenRequest}
            />
            {listKey ? (
              <ContextMenuItem
                icon={<SelectBoxIcon className="size-4" />}
                label="Select"
                onClick={handleStartSelection}
              />
            ) : null}

            <PopoverSeparator />

            {SUBMENU_ITEMS.map(({ id, label, icon: Icon }) => (
              <ContextMenuSubmenuItem
                key={id}
                icon={<Icon className="size-4" />}
                label={label}
                onClick={() => setCurrentSubmenu(id)}
              />
            ))}

            <PopoverSeparator />

            <ContextMenuItem
              icon={<TrashIcon className="size-4" />}
              label="Delete"
              onClick={() => setShowDeleteDialog(true)}
              className={CONTEXT_MENU_DESTRUCTIVE_CLASS}
            />
          </PopoverList>
        );
    }
  };

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

      <ContextMenuShell
        open={menu.open}
        onOpenChange={(nextOpen) => {
          menu.handleOpenChange(nextOpen);
          if (!nextOpen) {
            resetSubmenu();
            triggerPendingRefresh();
          }
        }}
        position={menu.position}
        className={className}
        onContextMenu={handleContextMenu}
        onClick={onClick}
        menu={renderSubmenu()}
      >
        {children}
      </ContextMenuShell>
    </>
  );
}
