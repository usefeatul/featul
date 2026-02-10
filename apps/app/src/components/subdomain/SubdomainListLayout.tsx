"use client"

import React from "react"
import { DomainSidebar } from "./DomainSidebar"

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
  const grid =
    sidebarPosition === "left"
      ? "md:grid md:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] md:gap-6"
      : "md:grid md:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)] md:gap-6"
  return (
    <section>
      <div className={grid}>
        {sidebarPosition === "left" ? (
          <aside className="hidden md:block mt-10 md:mt-0">
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
        <div>{children}</div>
        {sidebarPosition === "right" ? (
          <aside className="hidden md:block mt-10 md:mt-0">
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
