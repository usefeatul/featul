import { useState, useRef, useTransition, useEffect } from "react"
import { toast } from "sonner"
import { client } from "@oreilla/api/client"

interface UseCommentEditProps {
  commentId: string
  initialContent: string
  onUpdate?: () => void
}

export function useCommentEdit({ commentId, initialContent, onUpdate }: UseCommentEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(initialContent)
  const [isPending, startTransition] = useTransition()
  const isSavingRef = useRef(false)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isEditing) setEditContent(initialContent)
  }, [initialContent, isEditing])

  const executeSave = () => {
    if (!editContent.trim()) {
      handleCancel()
      return
    }

    startTransition(async () => {
      try {
        const res = await client.comment.update.$post({
          commentId,
          content: editContent.trim(),
        })
        if (res.ok) {
          setIsEditing(false)
          toast.success("Comment updated")
          onUpdate?.()
        } else {
          toast.error("Failed to update comment")
        }
      } catch (error) {
        console.error("Failed to update comment:", error)
        toast.error("Failed to update comment")
      } finally {
        isSavingRef.current = false
      }
    })
  }

  const handleSave = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    isSavingRef.current = true
    saveTimerRef.current = setTimeout(() => {
      executeSave()
    }, 300)
  }

  const handleCancel = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    if (isSavingRef.current) return

    setIsEditing(false)
    setEditContent(initialContent)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Tab") {
      handleSave()
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleCancel()
    }
  }

  const handleBlur = () => {
    if (isSavingRef.current) return
    handleCancel()
  }

  return {
    isEditing,
    setIsEditing,
    editContent,
    setEditContent,
    isPending,
    handleSave,
    handleCancel,
    handleKeyDown,
    handleBlur,
  }
}
