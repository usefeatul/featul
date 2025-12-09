"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { MenuIcon } from "@feedgot/ui/icons/menu"
import { AccentBar } from "@feedgot/ui/components/cardElements"
import { CommentsIcon } from "@feedgot/ui/icons/comments"
import { RoadmapIcon } from "@feedgot/ui/icons/roadmap"
import { ChangelogIcon } from "@feedgot/ui/icons/changelog"
import { cn } from "@feedgot/ui/lib/utils"
import { Button } from "@feedgot/ui/components/button"


export function MobileBoardsMenu({ slug, subdomain }: { slug: string; subdomain: string }) {
  const router = useRouter()
  const pathname = usePathname() || ""
  const [open, setOpen] = React.useState(false)

  function go(value: string) {
    const base = `/${subdomain}`
    const next =
      value === "__all__"
        ? `/`
        : value === "roadmap"
        ? `${base}/roadmap`
        : `${base}/changelog`
    setOpen(false)
    router.push(next)
  }

  const active = pathname.startsWith(`/${subdomain}/roadmap`)
    ? "roadmap"
    : pathname.startsWith(`/${subdomain}/changelog`)
    ? "changelog"
    : "__all__"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          suppressHydrationWarning
          type="button"
          variant="nav"
          aria-label="Open boards"
          className="inline-flex items-center justify-center rounded-md p-2 bg-card dark:bg-black/40 disabled:opacity-50"
          disabled={false}
        >
          <MenuIcon width={20} height={20} className="text-accent" />
        </Button>
      </PopoverTrigger>
      <PopoverContent id={`popover-${subdomain}-${slug}-mobile-menu`} align="start" list className="min-w-9rem] w-fit">
        <div className="px-3 py-2 text-xs font-medium text-accent">Boards</div>
        <PopoverList>
          <PopoverListItem onClick={() => go("__all__")}> 
            <AccentBar width={2} className={active === "__all__" ? undefined : "bg-muted ring-0"} />
            <span className={cn("text-sm", active === "__all__" ? "text-primary" : "text-muted-foreground")}>All Feedback</span>
            <CommentsIcon size={16} className="text-accent ml-auto" />
          </PopoverListItem>
          <PopoverListItem onClick={() => go("roadmap")}> 
            <AccentBar width={2} className={active === "roadmap" ? undefined : "bg-muted ring-0"} />
            <span className={cn("text-sm", active === "roadmap" ? "text-primary" : "text-muted-foreground")}>Roadmap</span>
            <RoadmapIcon size={16} className="text-accent ml-auto" />
          </PopoverListItem>
          <PopoverListItem onClick={() => go("changelog")}> 
            <AccentBar width={2} className={active === "changelog" ? undefined : "bg-muted ring-0"} />
            <span className={cn("text-sm", active === "changelog" ? "text-primary" : "text-muted-foreground")}>Changelog</span>
            <ChangelogIcon size={16} className="text-accent ml-auto" />
          </PopoverListItem>
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
