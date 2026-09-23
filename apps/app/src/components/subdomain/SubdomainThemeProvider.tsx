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
  // Branding supplies the public-site default; a visitor's saved selection
  // can override it without inheriting the dashboard's app-theme preference.
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={theme}
      enableSystem
      storageKey="theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
