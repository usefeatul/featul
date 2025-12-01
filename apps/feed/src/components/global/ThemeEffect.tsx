"use client"

import * as React from "react"

export default function ThemeEffect({ value }: { value: "light" | "dark" | "system" }) {
  React.useEffect(() => {
    const root = document.documentElement
    const apply = (mode: "light" | "dark") => {
      if (mode === "dark") root.classList.add("dark")
      else root.classList.remove("dark")
    }
    if (value === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)")
      apply(mql.matches ? "dark" : "light")
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? "dark" : "light")
      mql.addEventListener("change", handler)
      return () => mql.removeEventListener("change", handler)
    } else {
      apply(value)
    }
  }, [value])
  return null
}

