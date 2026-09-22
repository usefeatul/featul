"use client"

import * as React from "react"
import { ThemeProvider } from "next-themes"

export default function SubdomainThemeProvider({
  theme,
  children,
}: {
  theme: "light" | "dark" | "system"
  children: React.ReactNode
}) {
  // Explicit workspace themes are authoritative. System mode remains
  // user-selectable and follows the visitor's OS by default.
  const forcedTheme = theme === "system" ? undefined : theme

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
      forcedTheme={forcedTheme}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
