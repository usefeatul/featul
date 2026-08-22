"use client"

import React from "react"
import { DomainIcon } from "@featul/ui/icons/domain"
import { faviconUrlForDomain, hostFromDomain } from "@/utils/domain"

export function WebsiteFavicon({
  domain,
  className = "size-4 rounded-[3px]",
}: {
  domain: string
  className?: string
}) {
  const host = hostFromDomain(domain)
  const src = faviconUrlForDomain(domain)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    setFailed(false)
  }, [host])

  if (!src || failed) {
    return <DomainIcon className="size-4 text-accent" />
  }

  return (
    <img
      src={src}
      alt=""
      width={16}
      height={16}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
