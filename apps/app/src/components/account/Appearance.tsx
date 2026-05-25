"use client"

import React from "react"
import { cn } from "@featul/ui/lib/utils"
import SectionCard from "@/components/settings/global/SectionCard"
import { useTheme } from "next-themes"
import { DarkMode } from "./theme-holder/dark-theme"
import { LightMode } from "./theme-holder/light-theme"
import { SystemMode } from "./theme-holder/system-theme"
import {
  githubDarkThemePreviewPalette,
  quietThemePreviewPalette,
  solarizedThemePreviewPalette,
  ThemePreviewScene,
} from "./theme-holder/theme-preview-scene"

type ThemeOption = "light" | "dark" | "system" | "quiet" | "solarized" | "github-dark"

const QuietMode = () => (
  <svg width="282" height="193" viewBox="0 0 282 193" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ThemePreviewScene palette={quietThemePreviewPalette} />
  </svg>
)

const SolarizedMode = () => (
  <svg width="282" height="193" viewBox="0 0 282 193" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ThemePreviewScene palette={solarizedThemePreviewPalette} />
  </svg>
)

const GithubDarkMode = () => (
  <svg width="282" height="193" viewBox="0 0 282 193" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ThemePreviewScene palette={githubDarkThemePreviewPalette} />
  </svg>
)

export default function Appearance() {
  const { theme = "system", setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const activeTheme = mounted ? (theme as ThemeOption) || "system" : null

  const options: Array<{
    key: ThemeOption
    label: string
    description: string
    Preview: React.ComponentType
  }> = [
    {
      key: "system",
      label: "System",
      description: "Match your device theme",
      Preview: SystemMode,
    },
    {
      key: "light",
      label: "Light",
      description: "Bright, clean interface",
      Preview: LightMode,
    },
    {
      key: "dark",
      label: "Dark",
      description: "For low-light environments",
      Preview: DarkMode,
    },
    {
      key: "quiet",
      label: "Quiet Light",
      description: "Softer contrast for long sessions",
      Preview: QuietMode,
    },
    {
      key: "solarized",
      label: "Solarized Light",
      description: "Warm, readable tones",
      Preview: SolarizedMode,
    },
    {
      key: "github-dark",
      label: "GitHub Dark",
      description: "Crisp dark workspace",
      Preview: GithubDarkMode,
    },
  ]

  return (
    <SectionCard title="Appearance" description="Choose a workspace app theme">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {options.map(({ key, label, description, Preview }) => {
            const isActive = activeTheme === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTheme(key)}
                className={cn(
                  "group flex flex-col gap-2 rounded-xl border bg-card p-2 text-left transition",
                  "hover:border-primary/70 hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive && "border-primary ring-2 ring-primary"
                )}>
                <div className="overflow-hidden rounded-lg border bg-muted/40">
                  <Preview />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-accent">{description}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </SectionCard>
  )
}
