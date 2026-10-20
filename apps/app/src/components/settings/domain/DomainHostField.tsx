"use client";

import React from "react";
import { Input, InputGroup } from "@featul/ui/components/input";
import { cn } from "@featul/ui/lib/utils";
import { XMarkIcon } from "@/components/global/icons";
import { WebsiteFavicon } from "@/components/wizard/WebsiteFavicon";

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
    <InputGroup
      invalid={invalid}
      className={cn("h-10 gap-0", readOnly && "cursor-default")}
    >
      <WebsiteFavicon domain={value} className="mr-2.5 size-4 shrink-0 rounded-sm" />
      <span className="shrink-0 text-base text-muted-foreground md:text-sm">https://</span>
      {readOnly ? (
        <span className="min-w-0 flex-1 truncate text-base text-foreground md:text-sm">
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
      {invalid ? <XMarkIcon className="ml-2.5 size-4 shrink-0 text-destructive" /> : null}
      {trailing ? (
        <span className="ml-2.5 flex shrink-0 items-center gap-1">{trailing}</span>
      ) : null}
    </InputGroup>
  );
}
