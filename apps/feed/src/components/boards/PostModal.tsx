"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Dialog, DialogContent } from "@feedgot/ui/components/dialog"
import { Button } from "@feedgot/ui/components/button"
import { Star, ChevronRight, MessageSquare, Bell } from "lucide-react"
import { client } from "@feedgot/api/client"

export default function PostModal({ open, onOpenChange, postId }: { open: boolean; onOpenChange: (o: boolean) => void; postId: string | null }) {
  const q = useQuery({
    enabled: open && !!postId,
    queryKey: ["post-detail", postId],
    queryFn: async () => {
      const res = await client.board.postDetail.$get({ postId: postId! })
      const data = await res.json()
      return data as {
        post: { id: string; title: string; content?: string | null; upvotes?: number | null; downvotes?: number | null; commentCount?: number | null; status?: string | null; roadmapStatus?: string | null; createdAt?: string | Date | null; publishedAt?: string | Date | null; authorName?: string | null }
        board: { name: string; type: string; slug: string } | null
        tags: { id: string; name: string; slug: string; color?: string | null }[]
        comments: { id: string; content: string; authorName?: string | null; createdAt?: string | Date | null; upvotes?: number | null }[]
      }
    },
  })

  const p = q.data?.post
  const b = q.data?.board
  const tags = q.data?.tags || []
  const comments = q.data?.comments || []
  const [tab, setTab] = useState<"comments" | "activity">("comments")

  const formattedDate =
    typeof p?.createdAt === "string" || p?.createdAt instanceof Date
      ? new Date(p!.createdAt!).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
      : ""

  function formatRelative(date: Date | string | null | undefined) {
    if (!date) return ""
    const d = typeof date === "string" ? new Date(date) : date
    const diff = Date.now() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`
    const years = Math.floor(months / 12)
    return `${years}y ago`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,980px)] max-h-[70vh] overflow-y-auto p-0">
        {!p ? (
          <div className="p-8 text-center">
            <div className="text-sm text-muted-foreground">Loading…</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px]">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{b?.name}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{formattedDate}</span>
              </div>
              <h1 className="mt-3 text-xl md:text-2xl font-semibold tracking-tight">{p.title}</h1>
              {p.authorName ? <p className="mt-1 text-xs text-muted-foreground">by {p.authorName}</p> : null}
              {tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground"
                      style={{ backgroundColor: t.color ? `${t.color}22` : undefined }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              ) : null}
              {p.content ? <div className="mt-5 text-sm leading-6 text-foreground/90 whitespace-pre-wrap">{p.content}</div> : null}
              <div className="mt-6 flex items-center justify-between rounded-lg bg-card p-3">
                <div className="flex items-center gap-2">
                  <Star className="size-4 text-primary" />
                  <span className="text-xs text-muted-foreground">View all similar posts</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  Explore
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/60 p-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Please authenticate to join the conversation.</span>
                </div>
                <a href="/auth/sign-in" className="text-xs inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-1">
                  Sign in / Sign up
                  <ChevronRight className="size-4" />
                </a>
              </div>
              <div className="mt-6 flex items-center justify-between border-b">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setTab("comments")}
                    className={`text-sm pb-3 ${tab === "comments" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"}`}
                  >
                    Comments
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("activity")}
                    className={`text-sm pb-3 ${tab === "activity" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"}`}
                  >
                    Activity feed
                  </button>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  New comments
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
              {tab === "comments" ? (
                comments.length === 0 ? (
                  <div className="py-10 text-center">
                    <MessageSquare className="inline-block size-6 text-primary" />
                    <div className="mt-2 text-sm text-muted-foreground">No one has commented yet</div>
                  </div>
                ) : (
                  <ul className="mt-6 space-y-4">
                    {comments.map((c) => (
                      <li key={c.id} className="rounded-lg border bg-card p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{c.authorName || "Anonymous"}</span>
                          <span className="text-xs text-muted-foreground">▲ {c.upvotes ?? 0}</span>
                        </div>
                        <div className="mt-2 text-sm">{c.content}</div>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <div className="py-10 text-center">
                  <div className="text-sm text-muted-foreground">No activity yet</div>
                </div>
              )}
            </div>
            <aside className="border-l bg-card p-6 md:p-7 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Upvotes</div>
                <div className="text-xs font-medium">▲ {p.upvotes ?? 0}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Status</div>
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">{p.status || "Published"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Board</div>
                <div className="text-xs">{b?.name}</div>
              </div>
              {tags.length > 0 ? (
                <div className="flex items-start justify-between">
                  <div className="text-xs text-muted-foreground">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((t) => (
                      <span key={t.id} className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground" style={{ backgroundColor: t.color ? `${t.color}22` : undefined }}>
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">ETA</div>
                <div className="text-xs text-muted-foreground">
                  {p.publishedAt ? new Date(p.publishedAt as any).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Date</div>
                <div className="text-xs text-muted-foreground">{formatRelative(p.createdAt || null)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Author</div>
                <div className="text-xs text-muted-foreground">{p.authorName || "Anonymous"}</div>
              </div>
              <div className="pt-2">
                <div className="text-xs text-muted-foreground">Subscribe to post</div>
                <Button size="sm" variant="secondary" className="mt-2 h-7 text-xs px-3">
                  <Bell className="size-3.5 mr-2" />
                  Get notified
                </Button>
              </div>
            </aside>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
