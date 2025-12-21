"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@oreilla/ui/components/table"
import { Button } from "@oreilla/ui/components/button"
import { useQuery } from "@tanstack/react-query"
import { client } from "@oreilla/api/client"
import { toast } from "sonner"
import PlanNotice from "../global/PlanNotice"
import ModalCreateTag from "./ModalCreateTag"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@oreilla/ui/components/popover"
import { MoreVertical } from "lucide-react"

export default function ManageTags({
  slug,
  plan,
  initialTags,
}: {
  slug: string
  plan?: string
  initialTags?: any[]
}) {
  const { data: tags = [], isLoading, refetch } = useQuery({
    queryKey: ["workspace-tags", slug],
    queryFn: async () => {
      const res = await client.board.tagsByWorkspaceSlug.$get({ slug })
      const d = await res.json()
      return ((d as any)?.tags || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        postCount: Number(t.count || 0),
      }))
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
              (tags || []).map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="px-4 text-sm">{t.name}</TableCell>
                  <TableCell className="px-2 text-center">
                    <Popover open={actionOpenId === t.id} onOpenChange={(v) => setActionOpenId(v ? String(t.id) : null)}>
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
        <Button type="button" variant="quiet" onClick={() => setCreateOpen(true)}>Create tag</Button>
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
