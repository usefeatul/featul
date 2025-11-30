"use client"
import { useEffect } from "react"

type Props = {
  onPrev: () => void
  onNext: () => void
  isFirstPage?: boolean
  isLastPage?: boolean
}

export default function PaginationHotkeys({ onPrev, onNext, isFirstPage, isLastPage }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase()
      const editable = (e.target as HTMLElement | null)?.isContentEditable
      if (editable) return
      if (tag === "input" || tag === "textarea" || tag === "select") return

      const key = e.key.toLowerCase()
      if (key === "z" && !isFirstPage) onPrev()
      if (key === "x" && !isLastPage) onNext()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onPrev, onNext, isFirstPage, isLastPage])

  return null
}

