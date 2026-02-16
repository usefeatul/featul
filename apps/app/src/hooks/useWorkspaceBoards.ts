"use client"

import { useEffect, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import { client } from "@featul/api/client"
import type { BoardSummary } from "@/types/post"

interface UseWorkspaceBoardsProps {
  open: boolean
  workspaceSlug: string
  initialBoardSlug?: string
}

interface UseWorkspaceBoardsResult {
  boards: BoardSummary[]
  selectedBoard: BoardSummary | null
  setSelectedBoard: Dispatch<SetStateAction<BoardSummary | null>>
}

export function useWorkspaceBoards({
  open,
  workspaceSlug,
  initialBoardSlug,
}: UseWorkspaceBoardsProps): UseWorkspaceBoardsResult {
  const [boards, setBoards] = useState<BoardSummary[]>([])
  const [selectedBoard, setSelectedBoard] = useState<BoardSummary | null>(null)

  useEffect(() => {
    if (!open) return

    let canceled = false

    const fetchBoards = async () => {
      const res = await client.board.byWorkspaceSlug.$get({ slug: workspaceSlug })
      if (!res.ok || canceled) return

      const data = (await res.json()) as { boards?: BoardSummary[] } | null
      const rawBoards = Array.isArray(data?.boards) ? data.boards : []
      const nextBoards = rawBoards
        .filter((board) => !["roadmap", "changelog"].includes(board.slug))
        .map((board) => ({
          id: board.id,
          name: board.name,
          slug: board.slug,
          allowAnonymous: board.allowAnonymous,
        }))

      if (canceled) return

      setBoards(nextBoards)
      setSelectedBoard((prev) => {
        if (initialBoardSlug) {
          const match = nextBoards.find((board) => board.slug === initialBoardSlug)
          if (match) return match
        }

        if (prev && nextBoards.some((board) => board.slug === prev.slug)) {
          return prev
        }

        return nextBoards[0] ?? null
      })
    }

    fetchBoards()

    return () => {
      canceled = true
    }
  }, [open, workspaceSlug, initialBoardSlug])

  return { boards, selectedBoard, setSelectedBoard }
}
