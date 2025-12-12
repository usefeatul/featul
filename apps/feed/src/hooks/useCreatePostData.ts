"use client"

import { useState, useEffect } from "react"
import { client } from "@oreilla/api/client"
import { authClient } from "@oreilla/auth/client"

interface UseCreatePostDataProps {
  open: boolean
  workspaceSlug: string
  boardSlug: string
}

export function useCreatePostData({ open, workspaceSlug, boardSlug }: UseCreatePostDataProps) {
  const [user, setUser] = useState<{ name?: string; image?: string | null } | null>(null)
  const [boards, setBoards] = useState<any[]>([])
  const [selectedBoard, setSelectedBoard] = useState<{ name: string; slug: string } | null>(null)

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

  // Fetch boards
  useEffect(() => {
    if (open) {
      client.board.byWorkspaceSlug.$get({ slug: workspaceSlug }).then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          const filteredBoards = data.boards.filter((b: any) => 
            !['roadmap', 'changelog'].includes(b.slug)
          )
          setBoards(filteredBoards)
          
          // Set initial selected board based on prop
          const current = filteredBoards.find((b: any) => b.slug === boardSlug)
          if (current) {
            setSelectedBoard(current)
          } else if (filteredBoards.length > 0) {
            setSelectedBoard(filteredBoards[0])
          }
        }
      })
    }
  }, [open, workspaceSlug, boardSlug])

  return {
    user,
    boards,
    selectedBoard,
    setSelectedBoard
  }
}
