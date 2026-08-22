"use client"

import React from "react"
import { cn } from "@featul/ui/lib/utils"
import SectionCard, { settingsPlanCardCurrentClass } from "@/components/settings/global/SectionCard"
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay"
import { useTheme } from "next-themes"
import { DarkMode } from "./theme/DarkTheme"
import { LightMode } from "./theme/LightTheme"
import { SystemMode } from "./theme/SystemTheme"

type ThemeOption = "light" | "dark" | "system"

export default function Appearance() {
  const { theme = "system", setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const selectedTheme = mounted ? ((theme as ThemeOption) || "system") : null

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
  ]

  return (
    <SectionCard title="Appearance">
      <div className="grid gap-3 md:grid-cols-3">
        {options.map(({ key, label, description, Preview }) => {
          const isActive = selectedTheme === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTheme(key)}
              className={cn(
                overlayDialogClass,
                "flex cursor-pointer flex-col text-left transition-colors",
                "hover:border-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive && settingsPlanCardCurrentClass,
              )}
            >
              <div className={cn(overlayInnerClass)}>
                <Preview />
              </div>
              <div className="px-1 pt-2">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-accent">{description}</div>
              </div>
            </button>
          )
        })}
      </div>
    </SectionCard>
  )
}
