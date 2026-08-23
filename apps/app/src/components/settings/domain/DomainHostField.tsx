"use client";

import React from "react";
import { Input } from "@featul/ui/components/input";
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar";
import { cn } from "@featul/ui/lib/utils";
import { XMarkIcon } from "@featul/ui/icons/xmark";

const fieldInputClass = cn(
  toolbarItemClass,
  "h-8 min-w-0 flex-1 px-2.5 text-xs font-medium placeholder:text-accent hover:bg-transparent md:text-sm",
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
    <Toolbar size="sm" className="w-full">
      <span className="inline-flex h-full shrink-0 items-center self-stretch rounded-l-md border-r border-border bg-black px-3 text-xs font-medium tracking-wide text-accent dark:bg-black">
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
