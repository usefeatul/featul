"use client";

import React from "react";
import { Button } from "@featul/ui/components/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
import { DropdownIcon } from "@featul/ui/icons/dropdown";
import { client } from "@featul/api/client";
import { cn } from "@featul/ui/lib/utils";
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar";
import {
  REQUEST_FLAG_OPTIONS,
  type RequestFlagKey,
  type RequestFlags,
} from "@/types/request";

export default function FlagsPicker({
  postId,
  value,
  onChange,
  className,
}: {
  postId: string;
  value: RequestFlags;
  onChange: (v: RequestFlags) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const toggle = async (key: RequestFlagKey) => {
    if (saving) return;
    setSaving(true);
    try {
      const patch: RequestFlags = { [key]: !value[key] };
      await client.board.updatePostMeta.$post({ postId, ...patch });
      onChange({ ...value, ...patch });
    } finally {
      setSaving(false);
    }
  };

  const activeOptions = REQUEST_FLAG_OPTIONS.filter(
    (option) => value[option.key],
  );
  const label =
    activeOptions.length === 0
      ? "Flags"
      : activeOptions.length === 1
        ? (activeOptions.at(0)?.label ?? "Flags")
        : `${activeOptions.length} flags`;

  return (
    <Toolbar size="sm" className="w-fit">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="plain"
            size="sm"
            className={cn(
              toolbarItemClass,
              "h-8 gap-1.5 px-2.5 text-xs font-medium",
              saving && "opacity-70 cursor-wait",
              className,
            )}
            aria-label="Manage flags"
            disabled={saving}
          >
            <span className="max-w-[140px] truncate">{label}</span>
            <DropdownIcon className="size-3" />
          </Button>
        </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        <PopoverList>
          {REQUEST_FLAG_OPTIONS.map((option) => {
            const isChecked = !!value[option.key];
            return (
              <PopoverListItem
                key={option.key}
                role="menuitemcheckbox"
                aria-checked={isChecked}
                onClick={() => toggle(option.key)}
              >
                <span className="text-sm">{option.label}</span>
                {isChecked ? <span className="ml-auto text-xs">✓</span> : null}
              </PopoverListItem>
            );
          })}
        </PopoverList>
      </PopoverContent>
      </Popover>
    </Toolbar>
  );
}
