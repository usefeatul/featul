"use client"

import React from "react"
import { cn } from "@featul/ui/lib/utils"
import SectionCard from "@/components/settings/global/SectionCard"
import { useTheme } from "next-themes"
import { DarkMode } from "./theme-holder/dark-theme"
import { LightMode } from "./theme-holder/light-theme"
import { SystemMode } from "./theme-holder/system-theme"

type ThemeOption = "light" | "dark" | "system"

export default function Appearance() {
  const { theme = "system", setTheme } = useTheme()
  const currentTheme = (theme as ThemeOption) || "system"

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
    <SectionCard title="Appearance" description="Choose light, dark, or system theme">
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="text-sm font-medium">Theme</div>
          <div className="text-xs text-accent">Pick how the app should look.</div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {options.map(({ key, label, description, Preview }) => {
            const isActive = currentTheme === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTheme(key)}
                className={cn(
                  "group flex flex-col gap-2 rounded-xl border bg-card/70 p-2 text-left transition",
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
