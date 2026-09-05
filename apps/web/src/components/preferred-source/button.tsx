"use client"

import { useEffect } from "react"
import { Button } from "@featul/ui/components/button"
import { GoogleIcon } from "@featul/ui/icons/google"
import { cn } from "@featul/ui/lib/utils"

import {
  addPreferredSource,
  ensurePreferredSourceScript,
  getPreferredSourceLang,
  getPreferredSourceTheme,
  initPreferredSource,
} from "@/lib/preferred-source"

export const PREFERRED_SOURCE_BUTTON_LABEL = "Make us preferred on Google"

type PreferredSourceButtonProps = {
  className?: string
}

export function PreferredSourceButton({ className }: PreferredSourceButtonProps) {
  useEffect(() => {
    ensurePreferredSourceScript()

    let lastTheme: string | null = null
    let lastLang: string | null = null

    const sync = () => {
      const theme = getPreferredSourceTheme(document.documentElement)
      const lang = getPreferredSourceLang(document.documentElement)
      if (theme === lastTheme && lang === lastLang) return
      lastTheme = theme
      lastLang = lang
      initPreferredSource({ theme, lang })
    }

    sync()

    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "lang"],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <Button
      type="button"
      variant="card"
      size="sm"
      className={cn("font-heading text-xs", className)}
      onClick={() => addPreferredSource()}
    >
      <GoogleIcon className="size-3.5" />
      {PREFERRED_SOURCE_BUTTON_LABEL}
    </Button>
  )
}
