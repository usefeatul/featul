"use client"

import { useEffect } from "react"
import type { NavItem } from "../types/nav"

export function useSidebarHotkeys(active: boolean, middleNav: NavItem[], router: any) {
  useEffect(() => {
    if (!active) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      const tag = t?.tagName || ""
      const ae = document.activeElement as HTMLElement | null
      const role = ae?.getAttribute("role") || ""
      if (role === "textbox") return
      if (tag === "INPUT" || tag === "TEXTAREA" || (t && (t as any).isContentEditable)) return
      const key = e.key.toLowerCase()
      if (key === "r" || key === "c" || key === "b" || key === "m") {
        const target =
          key === "r"
            ? middleNav.find((i) => i.label.toLowerCase() === "roadmap")
            : key === "c"
            ? middleNav.find((i) => i.label.toLowerCase() === "changelog")
            : key === "b"
            ? middleNav.find((i) => i.label.toLowerCase() === "my board")
            : middleNav.find((i) => i.label.toLowerCase() === "members")
        if (target) {
          if (target.external) {
            window.open(target.href, "_blank")
          } else {
            router.push(target.href)
          }
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [active, middleNav, router])
}

export function getShortcutForLabel(label: string) {
  const l = label.toLowerCase()
  if (l === "roadmap") return "R"
  if (l === "changelog") return "C"
  if (l === "members") return "M"
  if (l === "my board") return "B"
  return ""
}
