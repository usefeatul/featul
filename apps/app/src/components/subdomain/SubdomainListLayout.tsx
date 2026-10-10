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
    <section className="has-[[data-page-empty]]:flex has-[[data-page-empty]]:flex-1 has-[[data-page-empty]]:flex-col">
      <div className={`${grid} has-[[data-page-empty]]:flex-1`}>
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
        <div className="min-w-0 self-stretch has-[[data-page-empty]]:flex has-[[data-page-empty]]:flex-col [&>div:has([data-page-empty])]:flex [&>div:has([data-page-empty])]:flex-1 [&>div:has([data-page-empty])]:flex-col">{children}</div>
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
