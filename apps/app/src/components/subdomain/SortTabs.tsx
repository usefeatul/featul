"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@featul/ui/lib/utils"

type Order = "likes" | "newest" | "oldest"

const OPTIONS: Array<{ value: Order; label: string }> = [
  { value: "likes", label: "Top" },
  { value: "newest", label: "New" },
  { value: "oldest", label: "Oldest" },
]

/** Inline segmented sort switch for the public list toolbar. */
export function SortTabs({
  basePath = "/",
  keepParams = ["board", "search", "status"],
  defaultOrder = "likes",
  className,
}: {
  basePath?: string
  keepParams?: string[]
  defaultOrder?: Order
  className?: string
}) {
  const search = useSearchParams()
  const raw = String(search.get("order") || defaultOrder).toLowerCase()
  const current: Order = raw === "oldest" ? "oldest" : raw === "newest" ? "newest" : "likes"

  const hrefFor = (order: Order) => {
    const params = new URLSearchParams()
    keepParams.forEach((key) => {
      const value = search.get(key)
      if (value) params.set(key, value)
    })
    if (order !== defaultOrder) params.set("order", order)
    const q = params.toString()
    return `${basePath}${q ? `?${q}` : ""}`
  }

  return (
    <div
      role="tablist"
      aria-label="Sort"
      className={cn("inline-flex items-center gap-1 rounded-lg bg-muted/60 p-0.5 dark:bg-white/[0.05]", className)}
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === current
        return (
          <Link
            key={opt.value}
            href={hrefFor(opt.value)}
            role="tab"
            aria-selected={active}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-white/[0.08]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </Link>
        )
      })}
    </div>
  )
}
