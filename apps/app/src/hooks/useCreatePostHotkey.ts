"use client"

import { useEffect } from "react"

interface UseCreatePostHotkeyOptions {
  enabled?: boolean
  onOpen: () => void
}

function isEditableElement(element: HTMLElement | null) {
  if (!element) return false
  const role = element.getAttribute("role")
  const tag = element.tagName
  return (
    role === "textbox" ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    element.isContentEditable
  )
}

export function useCreatePostHotkey({ enabled = true, onOpen }: UseCreatePostHotkeyOptions) {
  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (!event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
      if (event.key.toLowerCase() !== "c") return

      const target = event.target instanceof HTMLElement ? event.target : null
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      if (isEditableElement(target) || isEditableElement(activeElement)) return

      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) return

      event.preventDefault()
      onOpen()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enabled, onOpen])
}
