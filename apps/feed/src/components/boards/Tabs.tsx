"use client"

import Link from "next/link"
import { useMemo } from "react"

export default function Tabs({ active, className, onChange, hrefBase = "" }: { active: "issues" | "roadmap" | "changelog"; className?: string; onChange?: (tab: "issues" | "roadmap" | "changelog") => void; hrefBase?: string }) {
  const items = useMemo(() => ["issues", "roadmap", "changelog"] as const, [])
  const base = className || "mt-6 border-b border-zinc-200 dark:border-zinc-800 flex gap-6"
  return (
    <nav className={base}>
      {items.map((k) => (
        onChange ? (
          <button key={k} type="button" onClick={() => onChange(k)} className={active===k ? "py-3 text-primary border-b-2 border-primary" : "py-3 text-accent hover:text-primary"}>
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </button>
        ) : (
          <Link key={k} href={`${hrefBase}/${k}`} className={active===k ? "py-3 text-primary border-b-2 border-primary" : "py-3 text-accent hover:text-primary"}>
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </Link>
        )
      ))}
    </nav>
  )
}
