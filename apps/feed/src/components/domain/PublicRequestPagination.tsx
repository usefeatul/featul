"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@feedgot/ui/components/button"

export function PublicRequestPagination({
  subdomain,
  slug,
  page,
  pageSize,
  totalCount,
}: {
  subdomain: string
  slug: string
  page: number
  pageSize: number
  totalCount: number
}) {
  const search = useSearchParams()
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  if (totalCount <= pageSize) return null

  const board = search.get("board")
  const order = search.get("order")
  const base = `/${subdomain}/${slug}`
  const makeHref = (p: number) => {
    const u = new URL(base, "http://dummy")
    u.searchParams.set("page", String(p))
    if (board) u.searchParams.set("board", board)
    if (order) u.searchParams.set("order", order)
    const q = u.search ? `?${u.searchParams.toString()}` : ""
    return `${base}${q}`
  }

  const prev = page > 1 ? makeHref(page - 1) : null
  const next = page < totalPages ? makeHref(page + 1) : null

  return (
    <div className="mt-6 flex items-center justify-between">
      <Button asChild size="sm" variant="outline" disabled={!prev}>
        <Link href={prev || base}>Previous</Link>
      </Button>
      <div className="text-xs text-accent">
        Page {page} / {totalPages}
      </div>
      <Button asChild size="sm" disabled={!next}>
        <Link href={next || base}>Next</Link>
      </Button>
    </div>
  )
}
