import * as React from "react";
import { PopoverList, PopoverListItem, PopoverSeparator } from "@featul/ui/components/popover";
import { CheckIcon } from "@featul/ui/icons/check";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { ArrowLeftIcon } from "@featul/ui/icons/arrow-left";
import { ContextMenuCheckSlot } from "@/components/global/ContextMenuItem";
import StatusIcon from "./StatusIcon";
import type { TagSummary } from "@/types/post";
import { REQUEST_FLAG_OPTIONS, type RequestFlagKey, type RequestFlags } from "@/types/request";

export const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Review", value: "review" },
  { label: "Planned", value: "planned" },
  { label: "Progress", value: "progress" },
  { label: "Complete", value: "completed" },
  { label: "Closed", value: "closed" },
] as const;

function SubmenuBack({ onBack }: { onBack: () => void }) {
  return (
    <>
      <PopoverListItem onClick={onBack}>
        <ArrowLeftIcon className="size-4 shrink-0" />
        <span className="text-sm">Back</span>
      </PopoverListItem>
      <PopoverSeparator />
    </>
  );
}

function ChecklistSubmenuItem({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <PopoverListItem
      onClick={(event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
    >
      <ContextMenuCheckSlot checked={checked}>
        <CheckIcon className="size-3.5" />
      </ContextMenuCheckSlot>
      <span className="text-sm">{label}</span>
    </PopoverListItem>
  );
}

interface StatusSubmenuProps {
  currentStatus: string;
  isPending: boolean;
  updatingStatus: string | null;
  onBack: () => void;
  onUpdateStatus: (status: string) => void;
}

export function StatusSubmenu({
  currentStatus,
  isPending,
  updatingStatus,
  onBack,
  onUpdateStatus,
}: StatusSubmenuProps) {
  return (
    <PopoverList className="max-h-none! overflow-visible">
      <SubmenuBack onBack={onBack} />
      {statusOptions.map((option) => {
        const isCurrent = currentStatus === option.value;
        const isUpdating = isPending && updatingStatus === option.value;

        return (
          <PopoverListItem
            key={option.value}
            onClick={() => onUpdateStatus(option.value)}
            disabled={isPending || isCurrent}
          >
            <span className="inline-flex size-4 shrink-0 items-center justify-center">
              {isUpdating ? (
                <LoaderIcon className="size-4 animate-spin" />
              ) : isCurrent ? (
                <CheckIcon className="size-3.5" />
              ) : (
                <StatusIcon status={option.value} className="size-4" />
              )}
            </span>
            <span className="text-sm">{option.label}</span>
          </PopoverListItem>
        );
      })}
    </PopoverList>
  );
}

interface TagsSubmenuProps {
  availableTags: TagSummary[];
  optimisticTags: TagSummary[];
  onBack: () => void;
  onToggleTag: (tagId: string) => void;
}

export function TagsSubmenu({
  availableTags,
  optimisticTags,
  onBack,
  onToggleTag,
}: TagsSubmenuProps) {
  return (
    <PopoverList>
      <SubmenuBack onBack={onBack} />
      {availableTags.length === 0 ? (
        <div className="px-3 py-3 text-xs text-muted-foreground">No tags</div>
      ) : (
        availableTags.map((tag) => (
          <ChecklistSubmenuItem
            key={tag.id}
            label={tag.name}
            checked={optimisticTags.some((entry) => entry.id === tag.id)}
            onToggle={() => onToggleTag(tag.id)}
          />
        ))
      )}
    </PopoverList>
  );
}

interface FlagsSubmenuProps {
  flags: RequestFlags;
  onBack: () => void;
  onToggleFlag: (key: RequestFlagKey) => void;
}

export function FlagsSubmenu({ flags, onBack, onToggleFlag }: FlagsSubmenuProps) {
  return (
    <PopoverList>
      <SubmenuBack onBack={onBack} />
      {REQUEST_FLAG_OPTIONS.map((option) => (
        <ChecklistSubmenuItem
          key={option.key}
          label={option.label}
          checked={Boolean(flags[option.key])}
          onToggle={() => onToggleFlag(option.key)}
        />
      ))}
    </PopoverList>
  );
}
