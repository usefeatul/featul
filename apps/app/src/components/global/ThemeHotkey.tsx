"use client"

import * as React from "react"
import { useTheme } from "next-themes"

/** Cmd/Ctrl+M toggles light and dark anywhere the app theme is mounted. */
export function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.shiftKey) return

      const key = typeof event.key === "string" ? event.key.toLowerCase() : ""
      const usesPlatformModifier =
        (event.metaKey && !event.ctrlKey) || (event.ctrlKey && !event.metaKey)

      if (!usesPlatformModifier || key !== "m") return

      event.preventDefault()
      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [resolvedTheme, setTheme])

  return null
}
