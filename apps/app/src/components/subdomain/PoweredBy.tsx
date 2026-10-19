"use client"

import * as React from "react"
import { FeatulLogoIcon } from "@/components/global/icons";
import { cn } from "@featul/ui/lib/utils"
import { useDomainBranding } from "./DomainBrandingProvider"

/** "Powered by featul" attribution; always shown under the portal content. */
export function PoweredBy({ className }: { className?: string }) {
  const { subdomain } = useDomainBranding()

  const utmUrl = subdomain
    ? `https://featul.com?company=${encodeURIComponent(subdomain)}&utm_source=powered_by&utm_medium=referral&utm_campaign=${encodeURIComponent(subdomain)}`
    : "https://featul.com?utm_source=powered_by&utm_medium=referral&utm_campaign=subdomain_badge"

  return (
    <div className={cn("flex justify-center pt-5", className)}>
      <a
        href={utmUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground dark:border-white/[0.08] dark:bg-white/[0.03]"
      >
        <span>Powered by</span>
        <FeatulLogoIcon className="size-3.5 shrink-0" size={14} />
        <span className="font-medium text-foreground/80">featul</span>
      </a>
    </div>
  )
}
