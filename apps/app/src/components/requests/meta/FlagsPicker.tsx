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
  type RequestFlagKey,
  type RequestFlags,
} from "@/types/request";
import {
  REQUEST_FLAG_VISUALS,
  getActiveRequestFlags,
} from "@/components/global/flag-visuals";

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

  const activeFlags = getActiveRequestFlags(value);
  const label =
    activeFlags.length === 0
      ? "Flags"
      : activeFlags.length === 1
        ? (activeFlags.at(0)?.label ?? "Flags")
        : `${activeFlags.length} flags`;

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
          {REQUEST_FLAG_VISUALS.map((flag) => {
            const isChecked = !!value[flag.key];
            return (
              <PopoverListItem
                key={flag.key}
                role="menuitemcheckbox"
                aria-checked={isChecked}
                onClick={() => toggle(flag.key)}
              >
                <flag.Icon
                  width={14}
                  height={14}
                  className={`size-3.5 shrink-0 fill-current ${flag.iconClass}`}
                />
                <span className="text-sm">{flag.label}</span>
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
