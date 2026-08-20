"use client"

import * as React from "react"
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo"
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar"
import { cn } from "@featul/ui/lib/utils"
import { useDomainBranding } from "./DomainBrandingProvider"

export function PoweredBy() {
  const { hidePoweredBy, subdomain } = useDomainBranding()

  const utmUrl = subdomain
    ? `https://featul.com?company=${encodeURIComponent(subdomain)}&utm_source=powered_by&utm_medium=referral&utm_campaign=${encodeURIComponent(subdomain)}`
    : "https://featul.com?utm_source=powered_by&utm_medium=referral&utm_campaign=subdomain_badge"

  if (hidePoweredBy === true) return null
  return (
    <div className="pt-2 flex justify-center">
      <Toolbar size="sm" className="w-fit">
        <a
          href={utmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            toolbarItemClass,
            "inline-flex items-center gap-1.5 px-2.5 text-xs text-accent",
          )}
        >
          <span>Powered by featul</span>
          <FeatulLogoIcon className="size-3.5 shrink-0 text-accent" size={14} />
        </a>
      </Toolbar>
    </div>
  )
}
