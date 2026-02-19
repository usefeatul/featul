"use client"

import * as React from "react"
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo"
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
        className="inline-flex items-center gap-1.5 rounded-md border border-borde bg-background px-2.5 py-1 text-xs text-accent transition-colors hover:bg-muted/70"
      >
        <span>Powered by featul</span>
        <FeatulLogoIcon className="size-3.5 shrink-0 text-accent" size={14} />
      </a>
    </div>
  )
}
