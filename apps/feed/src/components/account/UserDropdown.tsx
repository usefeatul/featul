"use client"

import React from "react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@feedgot/ui/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@feedgot/ui/components/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@feedgot/ui/components/avatar"
import { authClient } from "@feedgot/auth/client"
import { toast } from "sonner"
import { getInitials, getDisplayUser } from "@/utils/user-utils"
import { getSlugFromPath } from "@/config/nav"
import { client } from "@feedgot/api/client"
import { LogoutIcon } from "@feedgot/ui/icons/logout"
import { SettingIcon } from "@feedgot/ui/icons/setting"
import { AccountIcon } from "@feedgot/ui/icons/account"

export default function UserDropdown({ className = "", initialUser }: { className?: string; initialUser?: { name?: string; email?: string; image?: string | null } }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const slug = React.useMemo(() => {
    const parts = (pathname || "/").split("/")
    if (parts[1] !== "workspaces") return getSlugFromPath(pathname)
    const maybe = parts[2] || ""
    if (!maybe || maybe === "account" || maybe === "new") return ""
    return maybe
  }, [pathname])
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [user, setUser] = React.useState<{ name?: string; email?: string; image?: string | null } | null>(initialUser ?? null)

  React.useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const s = await authClient.getSession()
        if (!active) return
        setUser((s as any)?.data?.user || null)
      } catch {}
    })()
    return () => { active = false }
  }, [])

  const d = getDisplayUser(user || undefined)
  const initials = getInitials(d.name || "U")

  const onAccount = React.useCallback(async () => {
    setOpen(false)
    if (slug) {
      router.push(`/workspaces/${slug}/account`)
      return
    }
    try {
      const res = await client.workspace.listMine.$get()
      const d = await res.json().catch(() => ({}))
      const s = ((d as { workspaces?: { slug: string }[] }).workspaces || [])[0]?.slug || ""
      if (s) router.push(`/workspaces/${s}/account`)
      else router.push("/workspaces/new")
    } catch {
      router.push("/workspaces/new")
    }
  }, [router, slug])

  const onSettings = React.useCallback(async () => {
    setOpen(false)
    if (slug) {
      router.push(`/workspaces/${slug}/settings`)
      return
    }
    try {
      const res = await client.workspace.listMine.$get()
      const d = await res.json().catch(() => ({}))
      const s = ((d as { workspaces?: { slug: string }[] }).workspaces || [])[0]?.slug || ""
      if (s) router.push(`/workspaces/${s}/settings`)
      else router.push("/workspaces/new")
    } catch {
      router.push("/workspaces/new")
    }
  }, [router, slug])

  const onSignOut = React.useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      await authClient.signOut()
      toast.success("Signed out")
      router.replace("/auth/sign-in")
    } catch {
      toast.error("Failed to sign out")
    } finally {
      setLoading(false)
    }
  }, [router, loading])

  return (
    <div className={cn(className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="w-full cursor-pointer">
          <div className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs md:text-sm text-accent hover:bg-muted">
            <div className="rounded-md border ring-1 ring-border overflow-hidden">
              <Avatar className="size-5.5">
                {d.image ? <AvatarImage src={d.image} alt={d.name} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
            <span className="transition-colors">{d.name || "Account"}</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-30 max-w-[40vw] p-2" side="bottom" align="center" sideOffset={8}>
          <DropdownMenuItem onSelect={onAccount} className="px-2 py-2 rounded-sm flex items-center gap-2 group">
            <AccountIcon className="w-[18px] h-[18px] text-foreground/80 transition-colors group-hover:text-primary" />
            <span className="transition-colors group-hover:text-foreground">Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onSettings} className="px-2 py-2 rounded-sm flex items-center gap-2 group">
            <SettingIcon className="w-[18px] h-[18px] text-foreground/80 transition-colors group-hover:text-primary" />
            <span className="transition-colors group-hover:text-foreground">Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onSignOut} className="px-2 py-2 rounded-sm flex items-center gap-2 group" aria-disabled={loading}>
            <LogoutIcon className="w-[18px] h-[18px] text-foreground/80 group-hover:text-red-500 transition-colors" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
