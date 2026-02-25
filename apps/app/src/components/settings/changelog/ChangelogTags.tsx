"use client"

import React from "react"
import PlanNotice from "../global/PlanNotice"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@featul/ui/components/table"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { MoreVertical } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import ModalTags from "./ModalTags"
import { toast } from "sonner"
import { LoadingButton } from "@/components/global/loading-button"

export interface ChangelogTag {
  id: string
  name: string
}

export default function ChangelogTags({ slug, initialPlan, initialTags }: { slug: string; initialPlan?: string; initialTags?: ChangelogTag[] }) {
  const { data: tagsData = [], isLoading, refetch } = useQuery<ChangelogTag[]>({
    queryKey: ["changelog-tags", slug],
    queryFn: async () => {
      const res = await client.changelog.tagsList.$get({ slug })
      const d = await res.json()
      const tags = (d as { tags?: ChangelogTag[] } | null)?.tags
      return Array.isArray(tags) ? tags : []
    },
    initialData: Array.isArray(initialTags) ? initialTags : undefined,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null)
  const [tagModalOpen, setTagModalOpen] = React.useState(false)
  const [savingTag, setSavingTag] = React.useState(false)

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">Changelog Tags</div>
      <div className="text-sm text-accent max-w-[500px]">Create and manage tags to categorize your changelog updates.</div>
      <div className="rounded-md  border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Tag</TableHead>
              <TableHead className="pl-2 pr-3 w-14 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(tagsData || []).length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="px-4 py-6 text-accent">No tags</TableCell>
              </TableRow>
            ) : (
              (tagsData || []).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="px-4 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block size-3 rounded-full bg-primary" />
                      <span>{t.name}</span>
                    </span>
                  </TableCell>
                  <TableCell className="pl-2 pr-3 text-right">
                    <Popover open={menuOpenId === t.id} onOpenChange={(v) => setMenuOpenId(v ? String(t.id) : null)}>
                      <PopoverTrigger asChild>
                        <LoadingButton type="button" variant="nav" size="icon-sm" aria-label="More" className="ml-auto">
                          <MoreVertical className="size-4" />
                        </LoadingButton>
                      </PopoverTrigger>
                      <PopoverContent list className="min-w-0 w-fit">
                        <PopoverList>
                          <PopoverListItem role="menuitem" onClick={async () => {
                            try {
                              setMenuOpenId(null)
                              const res = await client.changelog.tagsDelete.$post({ slug, tagId: String(t.id) })
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
      <PlanNotice slug={slug} feature="changelog_tags" plan={initialPlan} changelogTagsCount={(tagsData || []).length} />
      <div className="mt-2 flex items-center justify-start">
        <LoadingButton type="button" onClick={() => setTagModalOpen(true)}>Add tag</LoadingButton>
      </div>
      <ModalTags
        open={tagModalOpen}
        onOpenChange={setTagModalOpen}
        saving={savingTag}
        onSave={async (name) => {
          const n = String(name || "").trim()
          if (!n) return
          try {
            setSavingTag(true)
            const res = await client.changelog.tagsCreate.$post({ slug, name: n })
            if (!res.ok) {
              const err = (await res.json().catch(() => null)) as { message?: string } | null
              throw new Error(err?.message || "Create failed")
            }
            toast.success("Tag created")
            setTagModalOpen(false)
            await refetch()
          } catch (e: unknown) {
            toast.error((e as { message?: string })?.message || "Failed to create tag")
          } finally {
            setSavingTag(false)
          }
        }}
      />
    </div>
  )
}
