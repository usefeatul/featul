"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@featul/ui/lib/utils"

type Order = "likes" | "newest" | "oldest"

const SORTS: Array<{ value: Order; label: string }> = [
  { value: "likes", label: "Top" },
  { value: "newest", label: "New" },
  { value: "oldest", label: "Oldest" },
]

/** Row above the list: plain sort links, board switcher first on mobile. */
export function FeedbackListHeader({
  basePath = "/",
  keepParams = ["board", "search", "status"],
  leading,
}: {
  basePath?: string
  keepParams?: string[]
  leading?: React.ReactNode
}) {
  const search = useSearchParams()
  const raw = String(search.get("order") || "likes").toLowerCase()
  const current: Order = raw === "oldest" ? "oldest" : raw === "newest" ? "newest" : "likes"

  const hrefFor = (order: Order) => {
    const params = new URLSearchParams()
    keepParams.forEach((key) => {
      const value = search.get(key)
      if (value) params.set(key, value)
    })
    if (order !== "likes") params.set("order", order)
    const q = params.toString()
    return `${basePath}${q ? `?${q}` : ""}`
  }

  return (
    <div className="mb-2 flex items-center gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {leading}
        <nav role="tablist" aria-label="Sort" className="flex items-center gap-4">
          {SORTS.map(({ value, label }) => {
            const active = value === current
            return (
              <Link
                key={value}
                href={hrefFor(value)}
                role="tab"
                aria-selected={active}
                className={cn(
                  "py-1 text-sm transition-colors",
                  active ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
