"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@featul/ui/components/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
import { CheckmarkIcon } from "@/components/global/icons";

export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; icon?: ReactNode }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="plain"
          size="sm"
          aria-label={label}
          className="h-7 gap-1.5 rounded-none border-0 bg-transparent px-2 text-[11px] shadow-none hover:bg-foreground/5 dark:bg-transparent"
        >
          {options.find((option) => option.label === value)?.icon}
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        list
        unstyled
        className="overflow-hidden rounded-md border border-border bg-card p-1 shadow-md motion-reduce:animate-none"
      >
        <PopoverList>
          {options.map((option) => (
            <PopoverListItem
              type="button"
              key={option.label}
              aria-pressed={option.label === value}
              onClick={() => {
                onChange(option.label);
                setOpen(false);
              }}
              className="gap-2 rounded-sm px-2 py-1.5 text-xs"
            >
              {option.icon}
              {option.label}
              {option.label === value && (
                <CheckmarkIcon className="ml-auto size-3" />
              )}
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}
