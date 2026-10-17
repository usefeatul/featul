"use client";

import { useState } from "react";
import { Button } from "@featul/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverListItem,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import { cn } from "@featul/ui/lib/utils";
import { LockIcon, CollectIcon } from "@/components/global/icons";
import { commentActionIconClass } from "./styles";

export default function Visibility({
  internal,
  onChange,
  disabled,
  forced = false,
}: {
  internal: boolean;
  onChange: (internal: boolean) => void;
  disabled?: boolean;
  forced?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedInternal = forced || internal;

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="plain"
          size={selectedInternal ? "xs" : "icon-sm"}
          disabled={disabled}
          aria-label={`Comment visibility: ${selectedInternal ? "Internal" : "Comment"}`}
          className={cn(
            commentActionIconClass,
            selectedInternal &&
              "h-8 gap-1.5 bg-primary px-2 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 dark:hover:text-primary-foreground",
          )}
        >
          <LockIcon className="size-4" />
          {selectedInternal && <span>Internal</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent list align="start" side="bottom" avoidCollisions={false}>
        <PopoverList role="group" aria-label="Comment visibility">
          {[
            {
              value: false,
              label: "Comment",
              description: "Everyone with access to this post",
              Icon: CollectIcon,
            },
            {
              value: true,
              label: "Internal",
              description: "Workspace members only",
              Icon: LockIcon,
            },
          ].map(({ value, label, description, Icon }) => {
            const selected = value === selectedInternal;
            return (
              <PopoverListItem
                key={label}
                type="button"
                aria-pressed={selected}
                disabled={disabled || (forced && !value)}
                title={
                  forced && !value
                    ? "Replies to internal comments stay internal"
                    : description
                }
                className={cn(
                  "text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                  selected && value
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/90"
                    : "text-foreground",
                  selected && !value && "bg-muted/40 dark:bg-muted/30",
                )}
                onClick={() => {
                  onChange(value);
                  setOpen(false);
                }}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{label}</span>
              </PopoverListItem>
            );
          })}
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}
