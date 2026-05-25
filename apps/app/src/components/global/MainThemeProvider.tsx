"use client"

import * as React from "react"
import { ThemeProvider } from "next-themes"

const APP_THEMES = ["light", "dark", "quiet", "solarized", "github-dark"]

export default function MainThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={APP_THEMES}
      storageKey="app-theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
