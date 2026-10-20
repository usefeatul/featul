"use client";

import { useRef, useState, type RefObject } from "react";
import { EmojiIcon } from "@/components/global/icons";
import { Button } from "@featul/ui/components/button";
import EmojiPicker from "./picker";
import { commentActionIconClass } from "./styles";

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
  const selection = useRef({ start: 0, end: 0 });
  const inserted = useRef(false);

  return (
    <EmojiPicker
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
      onSelect={(emoji) => {
        const { start, end } = selection.current;
        onChange(value.slice(0, start) + emoji + value.slice(end));
        selection.current = {
          start: start + emoji.length,
          end: start + emoji.length,
        };
        inserted.current = true;
      }}
    >
      <Button
        type="button"
        size="icon-sm"
        variant="plain"
        disabled={disabled}
        aria-label="Add emoji"
        className={commentActionIconClass}
      >
        <EmojiIcon className="size-4" />
      </Button>
    </EmojiPicker>
  );
}
