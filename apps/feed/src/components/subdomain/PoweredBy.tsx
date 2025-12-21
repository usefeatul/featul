"use client"

import * as React from "react"
import { useDomainBranding } from "./DomainBrandingProvider"

export function PoweredBy() {
  const { hidePoweredBy } = useDomainBranding()
  if (hidePoweredBy === true) return null
  return (
    <div className="pt-2 text-center">
      <a
        href="https://oreilla.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-mdbg-muted px-2 py-1 text-xs text-accent hover:bg-muted/80 transition-colors cursor-pointer"
      >
        Powered by oreilla
      </a>
    </div>
  )
}

