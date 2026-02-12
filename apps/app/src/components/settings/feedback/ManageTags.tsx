"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@featul/ui/components/table"
import { useQuery } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import { toast } from "sonner"
import { LoadingButton } from "@/components/global/loading-button"
import PlanNotice from "../global/PlanNotice"
import ModalCreateTag from "./ModalCreateTag"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { MoreVertical } from "lucide-react"

export interface FeedbackTag {
  id: string
  name: string
  slug: string
  postCount: number
}

export default function ManageTags({
  slug,
  plan,
  initialTags,
}: {
  slug: string
  plan?: string
  initialTags?: FeedbackTag[]
}) {
  const { data: tags = [], isLoading, refetch } = useQuery<FeedbackTag[]>({
    queryKey: ["workspace-tags", slug],
    queryFn: async () => {
      const res = await client.board.tagsByWorkspaceSlug.$get({ slug })
      const d = await res.json()
      const raw =
        (d as { tags?: { id: string; name: string; slug: string; count?: number | null }[] } | null)
          ?.tags || []
      return raw.map(
        (t) =>
          ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            postCount: Number(t.count || 0),
          }) satisfies FeedbackTag,
      )
    },
    initialData: Array.isArray(initialTags) ? initialTags : undefined,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const [createOpen, setCreateOpen] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [actionOpenId, setActionOpenId] = React.useState<string | null>(null)

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">Manage Tags</div>
      <div className="text-sm text-accent">Tags are additional labels that can be added to feedback. They are useful for categorizing feedback.</div>
      <div className="rounded-md  border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Tag</TableHead>
              <TableHead className="px-2 w-10 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(tags || []).length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="px-4 py-6 text-accent">No tags</TableCell>
              </TableRow>
            ) : (
              (tags || []).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="px-4 text-sm">{t.name}</TableCell>
                  <TableCell className="px-2 text-center">
                    <Popover open={actionOpenId === t.id} onOpenChange={(v) => setActionOpenId(v ? String(t.id) : null)}>
                      <PopoverTrigger asChild>
                        <LoadingButton type="button" variant="ghost" size="sm" aria-label="More" className="px-2">
                          <MoreVertical className="size-4 opacity-70" />
                        </LoadingButton>
                      </PopoverTrigger>
                      <PopoverContent list className="min-w-0 w-fit">
                        <PopoverList>
                          <PopoverListItem role="menuitem" onClick={async () => {
                            setActionOpenId(null)
                            try {
                              const res = await client.board.tagsDelete.$post({ slug, tagSlug: String(t.slug) })
                              if (!res.ok) {
                                const err = (await res.json().catch(() => null)) as { message?: string } | null
                                throw new Error(err?.message || "Delete failed")
                              }
                              toast.success("Tag deleted")
                              await refetch()
                            } catch (e: unknown) {
                              toast.error((e as { message?: string })?.message || "Failed to delete tag")
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
      <PlanNotice slug={slug} feature="tags" plan={plan} tagsCount={(tags || []).length} />
      <div>
        <LoadingButton type="button" onClick={() => setCreateOpen(true)}>Create tag</LoadingButton>
      </div>

      <ModalCreateTag
        open={createOpen}
        onOpenChange={setCreateOpen}
        saving={creating}
        onSave={async (name) => {
          const n = String(name || "").trim()
          if (!n) return
          try {
            setCreating(true)
            const res = await client.board.tagsCreate.$post({ slug, name: n })
            if (!res.ok) {
              const err = (await res.json().catch(() => null)) as { message?: string } | null
              throw new Error(err?.message || "Create failed")
            }
            toast.success("Tag created")
            setCreateOpen(false)
            await refetch()
          } catch (e: unknown) {
            toast.error((e as { message?: string })?.message || "Failed to create tag")
          } finally {
            setCreating(false)
          }
        }}
      />
    </div>
  )
}
