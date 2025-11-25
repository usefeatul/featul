"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function NotFoundWorkspaceLink({
  defaultHref,
  className,
  ariaLabel,
}: {
  defaultHref: string
  className?: string
  ariaLabel?: string
}) {
  const pathname = usePathname() || "/"
  let href = defaultHref
  if (pathname.startsWith("/workspaces/")) {
    const parts = pathname.split("/")
    const slug = parts[2] || ""
    if (slug) href = `/workspaces/${slug}`
  }
  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      workspace
    </Link>
  )
}