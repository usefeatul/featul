"use client";

import type { KeyboardEvent, MouseEvent, RefObject } from "react";
import { ArrowUp, Paperclip, Square, Undo2 } from "@/components/global/icons";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import TextareaAutosize from "react-textarea-autosize";

export function Composer({
  inputRef,
  value,
  selectionText,
  attachmentOpen,
  isLoading,
  canUndo,
  onChange,
  onClick,
  onKeyUp,
  onKeyDown,
  onAttach,
  onUndo,
  onSend,
  onStop,
}: {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  selectionText?: string;
  attachmentOpen: boolean;
  isLoading: boolean;
  canUndo: boolean;
  onChange: (value: string, caret: number) => void;
  onClick: (event: MouseEvent<HTMLTextAreaElement>) => void;
  onKeyUp: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onAttach: () => void;
  onUndo: () => void;
  onSend: () => void;
  onStop: () => void;
}) {
  return (
    <div className="relative z-30 rounded-xl bg-card p-2 ring-1 ring-inset ring-black/[0.07] dark:ring-white/[0.08]">
      {selectionText ? (
        <div className="mb-1.5 rounded-lg bg-black/[0.04] px-2.5 py-2 dark:bg-white/[0.05]">
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
            Selected text
          </div>
          <p
            className="mt-0.5 line-clamp-2 text-xs font-light leading-relaxed text-muted-foreground"
            title={selectionText}
          >
            {selectionText}
          </p>
        </div>
      ) : null}
      <TextareaAutosize
        ref={inputRef}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
            event.target.selectionStart ?? event.target.value.length,
          )
        }
        onClick={onClick}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyDown}
        minRows={2}
        maxRows={7}
        rows={2}
        placeholder={
          selectionText
            ? "Tell AI how to change this selection…"
            : "Ask about this entry…"
        }
        className="block min-h-[calc(2lh+0.5rem)] w-full resize-none bg-transparent px-1.5 py-1 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
      />
      <div className="mt-1 flex items-center gap-1">
        <Button
          type="button"
          variant="plain"
          size="icon-sm"
          className={cn(
            "size-8 rounded-md border-0 text-muted-foreground shadow-none before:hidden hover:bg-muted hover:text-foreground dark:hover:bg-white/[0.08]",
            attachmentOpen
              ? "bg-primary/10 text-primary dark:bg-primary/15"
              : "bg-muted/70 dark:bg-white/[0.055]",
          )}
          onClick={onAttach}
          aria-label="Attach feedback"
          aria-expanded={attachmentOpen}
          aria-controls="changelog-feedback-picker"
          title="Attach feedback"
        >
          <Paperclip className="size-3.5" />
        </Button>
        {canUndo ? (
          <Button
            type="button"
            variant="plain"
            size="icon-sm"
            className="size-8 rounded-md border-0 bg-transparent text-muted-foreground shadow-none before:hidden hover:bg-black/5 hover:text-foreground dark:hover:bg-white/[0.06]"
            onClick={onUndo}
            aria-label="Undo last AI edit"
            title="Undo last AI edit"
          >
            <Undo2 className="size-3.5" />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="default"
          size="icon-sm"
          className="ml-auto size-8 rounded-md"
          aria-label={isLoading ? "Stop" : "Send"}
          disabled={!isLoading && !value.trim()}
          onClick={isLoading ? onStop : onSend}
        >
          {isLoading ? (
            <Square className="size-3 fill-current" />
          ) : (
            <ArrowUp className="size-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
