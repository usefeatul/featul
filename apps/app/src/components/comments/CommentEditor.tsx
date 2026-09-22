import React from "react"
import { MentionTextarea } from "./MentionTextarea"

interface CommentEditorProps {
  value: string
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onBlur: () => void
  isPending: boolean
  mentionNames?: string[]
}

export default function CommentEditor({
  value,
  onChange,
  onKeyDown,
  onBlur,
  isPending,
  mentionNames,
}: CommentEditorProps) {
  return (
    <div>
      <MentionTextarea
        value={value}
        mentionNames={mentionNames}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        disabled={isPending}
        autoFocus
        aria-label="Edit comment"
        aria-describedby="edit-instructions"
        className="min-h-[80px]"
      />
      <div id="edit-instructions" className="text-xs text-accent mt-1">
        Press Enter/Tab to save, Press Esc to cancel
      </div>
    </div>
  )
}
