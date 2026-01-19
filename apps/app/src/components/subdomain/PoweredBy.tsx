"use client"

import * as React from "react"
import { useDomainBranding } from "./DomainBrandingProvider"

export function PoweredBy() {
  const { hidePoweredBy, subdomain } = useDomainBranding()

  const utmUrl = subdomain
    ? `https://featul.com?company=${encodeURIComponent(subdomain)}&utm_source=powered_by&utm_medium=referral&utm_campaign=${encodeURIComponent(subdomain)}`
    : "https://featul.com?utm_source=powered_by&utm_medium=referral&utm_campaign=subdomain_badge"

  if (hidePoweredBy === true) return null
  return (
    <div className="pt-2 text-center">
      <a
        href={utmUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-md bg-muted px-2 py-1 text-xs border border-border/10 text-accent hover:bg-muted/80 transition-colors cursor-pointer"
      >
        Powered by featul
      </a>
    </div>
  )
}

