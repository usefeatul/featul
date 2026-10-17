"use client";

import type { ReactElement } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { cn } from "@featul/ui/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard";
import styles from "./emoji.module.css";

const pickerHeight =
  "min(360px, calc(var(--radix-popover-content-available-height, 378px) - 18px))";

const Picker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <p
      role="status"
      className="flex w-full items-center justify-center text-sm text-muted-foreground"
      style={{ height: pickerHeight }}
    >
      loading
    </p>
  ),
});

export default function EmojiPicker({
  open,
  onOpenChange,
  onSelect,
  onCloseAutoFocus,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (emoji: string) => void;
  onCloseAutoFocus?: (event: Event) => void;
  children: ReactElement;
}) {
  const { resolvedTheme } = useTheme();
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        unstyled
        align="start"
        side="top"
        className={cn(
          settingsCardShellClass,
          "w-[min(320px,calc(100vw-2rem))]",
        )}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <div
          className={cn(
            settingsCardInnerClass,
            styles.surface,
            "overflow-hidden p-0",
          )}
        >
          {open && (
            <Picker
              className={styles.picker}
              searchPlaceholder="Search emojis…"
              width="100%"
              height={pickerHeight}
              colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
              previewConfig={{ showPreview: false }}
              onEmojiClick={({ emoji }) => {
                onSelect(emoji);
                onOpenChange(false);
              }}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
