"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { buildSettingsNav, getSlugFromPath } from "@/config/nav"
import SidebarItem from "@/components/sidebar/SidebarItem"

export default function SettingsNav({
  onLinkClick,
  collapsed = false,
}: {
  onLinkClick?: () => void
  collapsed?: boolean
}) {
  const pathname = usePathname() || ""
  const slug = getSlugFromPath(pathname)
  const items = React.useMemo(() => buildSettingsNav(slug), [slug])

  return (
    <>
      {items.map((item) => (
        <SidebarItem
          key={item.label}
          item={item}
          pathname={pathname}
          mutedIcon
          collapsed={collapsed}
          onClick={onLinkClick}
        />
      ))}
    </>
  )
}
