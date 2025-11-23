"use client"

import React from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@feedgot/ui/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@feedgot/ui/components/dropdown-menu"
import { client } from "@feedgot/api/client"
import { getSlugFromPath } from "./nav"
import { DropdownIcon } from "@feedgot/ui/icons/dropdown"

type Ws = { id: string; name: string; slug: string; logo?: string | null; domain?: string | null }

export default function WorkspaceSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [workspaces, setWorkspaces] = React.useState<Ws[]>([])
  const [currentDetails, setCurrentDetails] = React.useState<Ws | null>(null)
  const [open, setOpen] = React.useState(false)
  const slug = getSlugFromPath(pathname || "")

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await client.workspace.listMine.$get()
        const data = await res.json()
        const list = data?.workspaces || []
        if (mounted) setWorkspaces(list)
      } catch {}
    })()
    return () => {
      mounted = false
    }
  }, [])

  React.useEffect(() => {
    if (!slug) {
      setCurrentDetails(null)
      return
    }
    let active = true
    ;(async () => {
      try {
        const res = await client.workspace.bySlug.$get({ slug })
        const data = await res.json()
        const ws = data?.workspace || null
        if (active) setCurrentDetails(ws)
      } catch {
        if (active) setCurrentDetails(null)
      }
    })()
    return () => {
      active = false
    }
  }, [slug])

  const current = workspaces.find((w) => w.slug === slug)
  const currentLogo: string | null = currentDetails?.logo ?? current?.logo ?? null
  const others = workspaces.filter((w) => w.slug !== slug)

  return (
    <div className={cn(className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="w-full">
          <div className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted">
            {currentLogo ? (
              <img src={currentLogo} alt="Workspace" className="h-6 w-6 rounded-sm" />
            ) : (
              <div className="h-6 w-6 rounded-sm bg-muted border" />
            )}
            <span className="text-sm font-medium truncate">{currentDetails?.name || current?.name || slug || "Current"}</span>
            <DropdownIcon className="ml-auto text-foreground/60" size={18} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" side="bottom" align="start">
          <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {others.length === 0 ? (
            <DropdownMenuItem disabled>No other workspaces</DropdownMenuItem>
          ) : (
            others.map((w) => {
              const logoUrl: string | null = w.logo ?? null
              return (
                <DropdownMenuItem key={w.slug} onSelect={() => { setOpen(false); router.push(`/workspaces/${w.slug}`) }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="" className="h-5 w-5 rounded-sm" />
                  ) : (
                    <div className="h-5 w-5 rounded-sm bg-muted border" />
                  )}
                  <span className="truncate">{w.name}</span>
                </DropdownMenuItem>
              )
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
