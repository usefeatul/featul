"use client"

import { useState, useEffect } from "react"
import { authClient } from "@featul/auth/client"
import type { PostUser } from "@/types/post"
import { useWorkspaceBoards } from "@/hooks/useWorkspaceBoards"

interface UseCreatePostDataProps {
  open: boolean
  workspaceSlug: string
  boardSlug: string
}

export function useCreatePostData({ open, workspaceSlug, boardSlug }: UseCreatePostDataProps) {
  const [user, setUser] = useState<PostUser | null>(null)
  const { boards, selectedBoard, setSelectedBoard } = useWorkspaceBoards({
    open,
    workspaceSlug,
    initialBoardSlug: boardSlug,
  })

  // Fetch user session
  useEffect(() => {
    if (open) {
      authClient.getSession().then((res) => {
        if (res.data?.user) {
          setUser(res.data.user)
        }
      })
    }
  }, [open])

  return {
    user,
    boards,
    selectedBoard,
    setSelectedBoard
  }
}
