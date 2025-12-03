"use client"

import * as React from "react"
import { ThemeProvider } from "next-themes"

export default function SubdomainThemeProvider({ theme, children }: { theme: "light" | "dark" | "system"; children: React.ReactNode }) {
  const forcedTheme = theme !== "system" ? theme : undefined
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

