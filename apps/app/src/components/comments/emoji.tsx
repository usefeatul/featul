"use client";

import { useRef, useState, type RefObject } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { EmojiIcon } from "@/components/global/icons";
import styles from "./emoji.module.css";
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard";
import { cn } from "@featul/ui/lib/utils";
import { Button } from "@featul/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@featul/ui/components/popover";

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

export default function Emoji({
  value,
  onChange,
  textareaRef,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const selection = useRef({ start: 0, end: 0 });
  const inserted = useRef(false);

  return (
    <Popover
      open={open && !disabled}
      onOpenChange={(next) => {
        if (next) {
          const textarea = textareaRef.current;
          selection.current = {
            start: textarea?.selectionStart ?? value.length,
            end: textarea?.selectionEnd ?? value.length,
          };
          inserted.current = false;
        }
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="plain"
          disabled={disabled}
          aria-label="Add emoji"
          className="border-0 bg-transparent p-0 text-foreground shadow-none hover:bg-transparent hover:text-gray-400 dark:bg-transparent dark:text-foreground dark:hover:bg-transparent dark:hover:text-gray-400"
        >
          <EmojiIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        unstyled
        align="start"
        side="top"
        className={cn(
          settingsCardShellClass,
          "w-[min(320px,calc(100vw-2rem))]",
        )}
        onCloseAutoFocus={(event) => {
          if (inserted.current) {
            event.preventDefault();
            const textarea = textareaRef.current;
            textarea?.focus();
            textarea?.setSelectionRange(
              selection.current.start,
              selection.current.start,
            );
          }
        }}
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
                const { start, end } = selection.current;
                onChange(value.slice(0, start) + emoji + value.slice(end));
                selection.current = {
                  start: start + emoji.length,
                  end: start + emoji.length,
                };
                inserted.current = true;
                setOpen(false);
              }}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
