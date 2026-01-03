"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@featul/ui/lib/utils"

interface DocsNavItem {
  label: string
  href: string
}

interface DocsNavSection {
  label: string
  items: DocsNavItem[]
}

const docsSections: DocsNavSection[] = [
  {
    label: "Getting started",
    items: [
      { label: "Introduction", href: "/docs" },
      { label: "Installation", href: "/docs/installation" },
    ],
  },
  {
    label: "Installation",
    items: [
      { label: "Basic", href: "/docs/installation" },
      { label: "Next.js", href: "/docs/installation/nextjs" },
      { label: "React", href: "/docs/installation/react" },
      { label: "Vue.js", href: "/docs/installation/vue" },
      { label: "Nuxt.js", href: "/docs/installation/nuxt" },
      { label: "SvelteKit", href: "/docs/installation/sveltekit" },
      { label: "Astro", href: "/docs/installation/astro" },
      { label: "Angular", href: "/docs/installation/angular" },
    ],
  },
  {
    label: "Advanced",
    items: [
      { label: "Subdomain tracking", href: "/docs/advanced/subdomain-tracking" },
      { label: "Custom events", href: "/docs/advanced/custom-events" },
      { label: "Identify", href: "/docs/advanced/identify" },
      { label: "Persist", href: "/docs/advanced/persist" },
    ],
  },
]

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <nav className="space-y-6 text-sm">
      <div className="flex items-center gap-2 mb-8 px-2">
        <span className="inline-flex items-center justify-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-accent">
          Docs
        </span>
      </div>

      {docsSections.map((section) => (
        <div key={section.label} className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-2">
            {section.label}
          </div>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-accent hover:text-foreground hover:bg-background/50 transition-colors",
                      isActive && "bg-background text-foreground shadow-sm"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block size-1.5 rounded-full bg-border transition-colors",
                        isActive && "bg-primary"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
