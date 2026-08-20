import React from "react"
import { Textarea } from "@featul/ui/components/textarea"

interface CommentEditorProps {
  value: string
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onBlur: () => void
  isPending: boolean
}

export default function CommentEditor({
  value,
  onChange,
  onKeyDown,
  onBlur,
  isPending,
}: CommentEditorProps) {
  return (
    <div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        variant="plain"
        className="min-h-[80px] resize-none bg-transparent py-2 text-sm text-foreground placeholder:text-accent"
        disabled={isPending}
        autoFocus
        aria-label="Edit comment"
        aria-describedby="edit-instructions"
      />
      <div id="edit-instructions" className="text-xs text-accent mt-1">
        Press Enter/Tab to save, Press Esc to cancel
      </div>
    </div>
  )
}
