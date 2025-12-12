import React from "react"
import { DomainSidebar } from "./DomainSidebar"

export default function DomainPageLayout({ subdomain, slug, sidebarPosition = "right", children, hideSubmitButton }: { subdomain: string; slug: string; sidebarPosition?: "left" | "right"; children: React.ReactNode; hideSubmitButton?: boolean }) {
  const grid = sidebarPosition === "left" ? "lg:grid lg:grid-cols-[0.3fr_0.7fr] lg:gap-6" : "lg:grid lg:grid-cols-[0.7fr_0.3fr] lg:gap-6"
  return (
    <section>
      <div className={grid}>
        {sidebarPosition === "left" ? (
          <aside className="hidden lg:block mt-10 lg:mt-0">
            <DomainSidebar subdomain={subdomain} slug={slug} hideSubmitButton={hideSubmitButton} />
          </aside>
        ) : null}
        <div>{children}</div>
        {sidebarPosition === "right" ? (
          <aside className="hidden lg:block mt-10 lg:mt-0">
            <DomainSidebar subdomain={subdomain} slug={slug} hideSubmitButton={hideSubmitButton} />
          </aside>
        ) : null}
      </div>
    </section>
  )
}

