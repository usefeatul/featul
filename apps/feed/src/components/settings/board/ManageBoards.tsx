"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@oreilla/ui/components/table"
import { Button } from "@oreilla/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@oreilla/ui/components/popover"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@oreilla/api/client"
import { toast } from "sonner"
import PlanNotice from "../global/PlanNotice"
import ModalCreateBoard from "../feedback/ModalCreateBoard"
import { MoreVertical } from "lucide-react"

export default function ManageBoards({
  slug,
  plan,
  initialBoards,
}: {
  slug: string
  plan?: string
  initialBoards?: any[]
}) {
  const queryClient = useQueryClient()
  const { data: boards = [], isLoading, refetch } = useQuery({
    queryKey: ["feedback-boards", slug],
    queryFn: async () => {
      const res = await client.board.settingsByWorkspaceSlug.$get({ slug })
      const d = await res.json()
      return (d as any)?.boards || []
    },
    initialData: Array.isArray(initialBoards) ? initialBoards : undefined,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const otherBoards = React.useMemo(() => (boards || []).filter((b: any) => b.slug !== "roadmap" && b.slug !== "changelog"), [boards])
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [actionOpenId, setActionOpenId] = React.useState<string | null>(null)

  const setVisibility = async (boardSlug: string, isPublic: boolean) => {
    try {
      queryClient.setQueryData(["feedback-boards", slug], (prev: any) => {
        const arr = Array.isArray(prev) ? prev : []
        return arr.map((it: any) => it.slug === boardSlug ? { ...it, isPublic } : it)
      })
    } catch {}
    try {
      const res = await client.board.updateSettings.$post({ slug, boardSlug, patch: { isPublic } })
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { message?: string } | null
        throw new Error(err?.message || "Update failed")
      }
      await refetch()
      toast.success(isPublic ? "Board set to Public" : "Board set to Private")
    } catch (e: unknown) {
      await refetch()
      toast.error((e as { message?: string })?.message || "Failed to update")
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">Manage Boards</div>
      <div className="text-sm text-accent">Boards are the main way to organize your feedback. They are buckets that contain all of the feedback for a specific product or feature.</div>
      <div className="rounded-md  border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Board</TableHead>
              <TableHead className="px-4 w-36 text-center">Type</TableHead>
              <TableHead className="px-2 w-10 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(otherBoards || []).length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="px-4 py-6 text-accent">No boards</TableCell>
              </TableRow>
            ) : (
              (otherBoards || []).map((b: any) => (
                <TableRow key={b.id}>
                  <TableCell className="px-4 text-sm">{b.name}</TableCell>
                  <TableCell className="px-4 text-center">
                    <Popover open={menuOpenId === b.id} onOpenChange={(v) => setMenuOpenId(v ? String(b.id) : null)}>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" aria-label="Board Type">
                          <span className="text-sm">{Boolean(b.isPublic) ? "Public" : "Private"}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent list className="min-w-0 w-fit">
                        <PopoverList>
                          <PopoverListItem role="menuitemradio" aria-checked={Boolean(b.isPublic)} onClick={() => { setMenuOpenId(null); setVisibility(String(b.slug), true) }}>Public</PopoverListItem>
                          <PopoverListItem role="menuitemradio" aria-checked={!Boolean(b.isPublic)} onClick={() => { setMenuOpenId(null); setVisibility(String(b.slug), false) }}>Private</PopoverListItem>
                        </PopoverList>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell className="px-2 text-center">
                    <Popover open={actionOpenId === b.id} onOpenChange={(v) => setActionOpenId(v ? String(b.id) : null)}>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" aria-label="More" className="px-2">
                          <MoreVertical className="size-4 opacity-70" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent list className="min-w-0 w-fit">
                        <PopoverList>
                          <PopoverListItem role="menuitem" onClick={async () => {
                            setActionOpenId(null)
                            try {
                              const res = await client.board.delete.$post({ slug, boardSlug: String(b.slug) })
                              if (!res.ok) {
                                const err = (await res.json().catch(() => null)) as { message?: string } | null
                                throw new Error(err?.message || "Delete failed")
                              }
                              toast.success("Board deleted")
                              await refetch()
                            } catch (e: unknown) {
                              toast.error((e as { message?: string })?.message || "Failed to delete board")
                            }
                          }}>
                            <span className="text-sm text-red-500">Delete</span>
                          </PopoverListItem>
                        </PopoverList>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <PlanNotice slug={slug} feature="boards" plan={plan} boardsCount={(otherBoards || []).length} />
      <div>
        <Button type="button" variant="quiet" onClick={() => setCreateOpen(true)}>Create board</Button>
      </div>
      <ModalCreateBoard
        open={createOpen}
        onOpenChange={setCreateOpen}
        saving={creating}
        onSave={async ({ name, slug: boardSlug }) => {
          const n = String(name || "").trim()
          const s = String(boardSlug || "").trim()
          if (!n) return
          try {
            setCreating(true)
            const res = await client.board.create.$post({ slug, name: n, boardSlug: s || undefined })
            if (!res.ok) {
              const err = (await res.json().catch(() => null)) as { message?: string } | null
              throw new Error(err?.message || "Create failed")
            }
            toast.success("Board created")
            setCreateOpen(false)
            await refetch()
          } catch (e: unknown) {
            toast.error((e as { message?: string })?.message || "Failed to create board")
          } finally {
            setCreating(false)
          }
        }}
      />
    </div>
  )
}
