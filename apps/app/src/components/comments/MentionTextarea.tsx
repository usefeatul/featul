"use client"

import React from "react"
import { Textarea } from "@featul/ui/components/textarea"
import { cn } from "@featul/ui/lib/utils"
import { renderCommentMentions } from "./mentionText"

type MentionTextareaProps = {
  value: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  mentionNames?: string[]
  placeholder?: string
  autoFocus?: boolean
  disabled?: boolean
  compact?: boolean
  className?: string
  "aria-label"?: string
  "aria-describedby"?: string
}

const sharedTextClass =
  "whitespace-pre-wrap wrap-break-word py-2 text-sm leading-6"

export const MentionTextarea = React.forwardRef<
  HTMLTextAreaElement,
  MentionTextareaProps
>(function MentionTextarea(
  {
    value,
    onChange,
    onKeyDown,
    onBlur,
    mentionNames,
    placeholder,
    autoFocus,
    disabled,
    compact,
    className,
    ...aria
  },
  ref,
) {
  const hasValue = Boolean(value)

  return (
    <div className="relative">
      {hasValue ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 overflow-hidden text-foreground",
            sharedTextClass,
            compact && "py-1.5",
          )}
        >
          {renderCommentMentions(value, mentionNames)}
          {value.endsWith("\n") ? "\n" : null}
        </div>
      ) : null}
      <Textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        variant="plain"
        autoFocus={autoFocus}
        disabled={disabled}
        className={cn(
          "relative min-h-[60px] resize-none bg-transparent",
          sharedTextClass,
          compact && "min-h-[44px] py-1.5",
          hasValue && "caret-foreground text-transparent selection:bg-primary/20",
          className,
        )}
        {...aria}
      />
    </div>
  )
})
