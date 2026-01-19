import React from "react"
import { DomainSidebar } from "./DomainSidebar"

export default function DomainPageLayout({ subdomain, slug, sidebarPosition = "right", children, hideSubmitButton }: { subdomain: string; slug: string; sidebarPosition?: "left" | "right"; children: React.ReactNode; hideSubmitButton?: boolean }) {
  const grid = sidebarPosition === "left" ? "md:grid md:grid-cols-[0.3fr_0.7fr] md:gap-6" : "md:grid md:grid-cols-[0.7fr_0.3fr] md:gap-6"
  return (
    <section>
      <div className={grid}>
        {sidebarPosition === "left" ? (
          <aside className="hidden md:block mt-10 md:mt-0">
            <DomainSidebar subdomain={subdomain} slug={slug} hideSubmitButton={hideSubmitButton} />
          </aside>
        ) : null}
        <div>{children}</div>
        {sidebarPosition === "right" ? (
          <aside className="hidden md:block mt-10 md:mt-0">
            <DomainSidebar subdomain={subdomain} slug={slug} hideSubmitButton={hideSubmitButton} />
          </aside>
        ) : null}
      </div>
    </section>
  )
}

