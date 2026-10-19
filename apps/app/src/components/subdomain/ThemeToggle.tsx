"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@featul/ui/components/button"
import { MoonIcon, SunIcon } from "@/components/global/icons"
import { cn } from "@featul/ui/lib/utils"

/** Light / dark switch for the public portal header. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"
  const label = isDark ? "Switch to light mode" : "Switch to dark mode"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      suppressHydrationWarning
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn("text-muted-foreground hover:text-foreground dark:bg-transparent", className)}
    >
      {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </Button>
  )
}
