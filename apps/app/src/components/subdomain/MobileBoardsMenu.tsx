"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import {
  MenuIcon,
  CollectIcon,
  RoadmapIcon,
  ChangelogIcon,
  HelpCenterIcon,
} from "@/components/global/icons";

import { cn } from "@featul/ui/lib/utils"
import { Button } from "@featul/ui/components/button"
import { toolbarItemClass } from "@featul/ui/components/toolbar"

export function MobileBoardsMenu({
  slug,
  subdomain,
  roadmapVisible = true,
  changelogVisible = true,
  helpVisible = false,
}: {
  slug: string;
  subdomain: string;
  roadmapVisible?: boolean;
  changelogVisible?: boolean;
  helpVisible?: boolean;
}) {
  const router = useRouter()
  const pathname = usePathname() || ""
  const [open, setOpen] = React.useState(false)

  const items: Array<{ href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; visible: boolean }> = [
    { href: "/", label: "All Feedback", icon: CollectIcon, visible: true },
    { href: "/roadmap", label: "Roadmap", icon: RoadmapIcon, visible: Boolean(roadmapVisible) },
    { href: "/changelog", label: "Changelog", icon: ChangelogIcon, visible: Boolean(changelogVisible) },
    { href: "/help", label: "Help", icon: HelpCenterIcon, visible: helpVisible },
  ]
  const activeHref = items.find((item) => item.href !== "/" && pathname.startsWith(item.href))?.href ?? "/"

  function go(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          suppressHydrationWarning
          type="button"
          variant="plain"
          aria-label="Open boards"
          className={cn(toolbarItemClass, "inline-flex items-center justify-center rounded-lg px-2")}
          disabled={false}
        >
          <MenuIcon width={20} height={20} className="text-accent" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        id={`popover-${subdomain}-${slug}-mobile-menu`}
        align="start"
        list
        // Start focus on the current page so the list marker opens there, not on the first item.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          ;(event.currentTarget as HTMLElement).querySelector<HTMLElement>('[aria-current="page"]')?.focus()
        }}
      >
        <div className="px-3 pb-1 pt-2.5 text-xs font-medium text-accent">Browse</div>
        <PopoverList className="min-w-40">
          {items.filter((item) => item.visible).map(({ href, label, icon: Icon }) => {
            const current = href === activeHref
            return (
              <PopoverListItem
                key={href}
                data-selected={current}
                aria-current={current ? "page" : undefined}
                onClick={() => go(href)}
                className="gap-3 py-2.5"
              >
                <Icon size={16} className={cn("shrink-0", current ? "text-primary" : "text-accent")} />
                <span className={cn("text-sm", current ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {label}
                </span>
              </PopoverListItem>
            )
          })}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
