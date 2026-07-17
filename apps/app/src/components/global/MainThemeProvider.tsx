"use client"

import * as React from "react"
import { ThemeProvider } from "next-themes"

export default function MainThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="app-theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}

