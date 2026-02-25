"use client"

interface CommentsDisabledStateProps {
  title?: string
  description?: string
}

export default function CommentsDisabledState({
  title = "Comments are disabled",
  description = "The board owner has turned off comments for this board.",
}: CommentsDisabledStateProps) {
  return (
    <div className="rounded-md border bg-muted/30 p-4">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-accent">{description}</p>
    </div>
  )
}
