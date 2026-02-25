"use client";

import React from "react";
import { Switch } from "@featul/ui/components/switch";
import { cn } from "@featul/ui/lib/utils";

type NotraSwitchRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  withTopBorder?: boolean;
};

export function NotraSwitchRow({
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  className,
  withTopBorder = false,
}: NotraSwitchRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5",
        withTopBorder && "border-t border-border/60",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-accent">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}
