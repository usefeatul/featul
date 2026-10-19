"use client"

import React from "react"
import { DomainSidebar } from "./DomainSidebar"
import { PortalPageHeader } from "./PortalPageHeader"
import { PoweredBy } from "./PoweredBy"
import { ShareIdeaButton } from "./ShareIdeaButton"
import { subdomainColumns } from "./layout"

type SubdomainListLayoutProps = {
  subdomain: string
  slug: string
  sidebarPosition?: "left" | "right"
  children: React.ReactNode
  hideSubmitButton?: boolean
  hideBoards?: boolean
  initialBoards?: Array<{ id: string; name: string; slug: string; postCount?: number }>
  selectedBoard?: string
  sortBasePath?: string
  sortKeepParams?: string[]
}

/** Two-column portal list: page heading and content beside a sticky navigation rail. */
export function SubdomainListLayout({
  sidebarPosition = "right",
  children,
  hideBoards,
  selectedBoard,
}: SubdomainListLayoutProps) {
  const grid = subdomainColumns(sidebarPosition)
  const rail = (
    <aside className="hidden min-w-0 md:block md:pt-1">
      <DomainSidebar selectedBoard={selectedBoard} hideBoards={hideBoards} />
    </aside>
  )
  return (
    <section className="flex flex-1 flex-col">
      <div className={`${grid} flex-1`}>
        {sidebarPosition === "left" ? rail : null}
        <div className="flex min-w-0 flex-col self-stretch">
          <PortalPageHeader />
          <ShareIdeaButton className="mb-4 w-full md:hidden" />
          <div className="flex flex-1 flex-col has-[[data-page-empty]]:flex-1 [&>div:has([data-page-empty])]:flex [&>div:has([data-page-empty])]:flex-1 [&>div:has([data-page-empty])]:flex-col">
            {children}
          </div>
          <PoweredBy className="md:hidden" />
        </div>
        {sidebarPosition === "right" ? rail : null}
      </div>
    </section>
  )
}
