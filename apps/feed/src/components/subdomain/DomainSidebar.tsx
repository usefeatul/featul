"use client"

import { SortPopover } from "./SortPopover"
import { SearchAction } from "./SearchAction"
import { SubmitIdeaCard } from "./SubmitIdeaCard"
import { BoardsList } from "./BoardsList"
import { PoweredBy } from "./PoweredBy"
import { useDomainBranding } from "./DomainBrandingProvider"

export function DomainSidebar({ subdomain, slug, initialBoards }: { subdomain: string; slug: string; initialBoards?: Array<{ id: string; name: string; slug: string; postCount?: number }> }) {
  const { sidebarPosition } = useDomainBranding()
  const alignClass = sidebarPosition === "left" ? "justify-start" : "justify-end"
  return (
    <aside className="space-y-4">
      <div className={`flex items-center ${alignClass} gap-1`}>
        <SortPopover subdomain={subdomain} slug={slug} />
        <SearchAction />
      </div>
      <SubmitIdeaCard subdomain={subdomain} slug={slug} />
      <BoardsList subdomain={subdomain} slug={slug} initialBoards={initialBoards} />
      <PoweredBy />
    </aside>
  )
}
