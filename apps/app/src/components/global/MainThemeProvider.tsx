"use client"

import * as React from "react"
import { ThemeProvider } from "next-themes"
import { ThemeHotkey } from "./ThemeHotkey"

export default function MainThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="app-theme"
      disableTransitionOnChange
    >
      <ThemeHotkey />
      {children}
    </ThemeProvider>
  )
}

