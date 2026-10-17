"use client";

import React from "react";
import { Input } from "@featul/ui/components/input";
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar";
import { cn } from "@featul/ui/lib/utils";
import { XMarkIcon } from "@/components/global/icons";

const fieldInputClass = cn(
  toolbarItemClass,
  "h-full min-w-0 flex-1 px-3 text-sm font-medium placeholder:text-muted-foreground hover:bg-transparent",
);

export default function DomainHostField({
  id,
  value,
  onChange,
  placeholder = "example.com",
  readOnly = false,
  invalid = false,
  autoFocus = false,
  trailing,
  onSubmit,
}: {
  id?: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  trailing?: React.ReactNode;
  onSubmit?: () => void;
}) {
  return (
    <Toolbar
      variant="plain"
      size="sm"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border-border/50 bg-background/50 shadow-none transition-[border-color,box-shadow] dark:border-white/[0.07]",
        !readOnly &&
          "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
        invalid &&
          "border-destructive focus-within:border-destructive focus-within:ring-destructive/20 dark:border-destructive",
      )}
    >
      <span className="inline-flex h-full shrink-0 items-center self-stretch rounded-l-xl border-r border-border/50 bg-muted/40 px-3 text-xs font-medium tracking-wide text-muted-foreground dark:border-white/[0.07]">
        HTTPS
      </span>
      {readOnly ? (
        <span
          className={cn(
            fieldInputClass,
            "inline-flex items-center truncate text-foreground",
          )}
        >
          {value}
        </span>
      ) : (
        <Input
          id={id}
          variant="plain"
          type="text"
          value={value}
          aria-invalid={invalid || undefined}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          className={fieldInputClass}
          autoFocus={autoFocus}
          spellCheck={false}
          autoComplete="off"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmit?.();
            }
          }}
        />
      )}
      {invalid ? (
        <span
          className={cn(
            toolbarItemClass,
            "inline-flex items-center px-2 hover:bg-transparent",
          )}
        >
          <XMarkIcon className="size-4 text-destructive" />
        </span>
      ) : null}
      {trailing}
    </Toolbar>
  );
}
