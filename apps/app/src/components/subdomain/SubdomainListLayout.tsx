"use client"

import React from "react"
import { DomainSidebar } from "./DomainSidebar"
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

export function SubdomainListLayout({
  subdomain,
  slug,
  sidebarPosition = "right",
  children,
  hideSubmitButton,
  hideBoards,
  initialBoards,
  selectedBoard,
  sortBasePath,
  sortKeepParams,
}: SubdomainListLayoutProps) {
  const grid = subdomainColumns(sidebarPosition)
  return (
    <section>
      <div className={grid}>
        {sidebarPosition === "left" ? (
          <aside className="hidden min-w-0 md:block">
            <DomainSidebar
              subdomain={subdomain}
              slug={slug}
              initialBoards={initialBoards}
              selectedBoard={selectedBoard}
              hideSubmitButton={hideSubmitButton}
              hideBoards={hideBoards}
              sortBasePath={sortBasePath}
              sortKeepParams={sortKeepParams}
            />
          </aside>
        ) : null}
        <div className="min-w-0">{children}</div>
        {sidebarPosition === "right" ? (
          <aside className="hidden min-w-0 md:block">
            <DomainSidebar
              subdomain={subdomain}
              slug={slug}
              initialBoards={initialBoards}
              selectedBoard={selectedBoard}
              hideSubmitButton={hideSubmitButton}
              hideBoards={hideBoards}
              sortBasePath={sortBasePath}
              sortKeepParams={sortKeepParams}
            />
          </aside>
        ) : null}
      </div>
    </section>
  )
}
