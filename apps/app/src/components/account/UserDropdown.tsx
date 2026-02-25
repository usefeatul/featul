"use client"

import React from "react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@featul/ui/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@featul/ui/components/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import { authClient } from "@featul/auth/client"
import { toast } from "sonner"
import { getInitials, getDisplayUser } from "@/utils/user"
import { getSlugFromPath } from "@/config/nav"
import { client } from "@featul/api/client"
import { LogoutIcon } from "@featul/ui/icons/logout"
import { SettingIcon } from "@featul/ui/icons/setting"
import { AccountIcon } from "@featul/ui/icons/account"
import { useQuery } from "@tanstack/react-query"

export default function UserDropdown({ className = "", initialUser }: { className?: string; initialUser?: { name?: string; email?: string; image?: string | null } }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const slug = React.useMemo(() => {
    const parts = (pathname || "/").split("/")
    if (parts[1] !== "workspaces") return getSlugFromPath(pathname)
    const maybe = parts[2] || ""
    if (!maybe || maybe === "account/" || maybe === "new") return ""
    return maybe
  }, [pathname])
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const { data } = useQuery<{ user: { name?: string; email?: string; image?: string | null } | null }>({
    queryKey: ["me"],
    queryFn: async () => {
      const s = await authClient.getSession()
      const u = (s as any)?.data?.user || null
      return { user: u }
    },
    initialData: () => ({ user: (initialUser as any) || null }),
    placeholderData: (prev) => prev as any,
    staleTime: 300_000,
    gcTime: 900_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !initialUser,
  })

  const user = data?.user || null

  const d = getDisplayUser(user || undefined)
  const initials = getInitials(d.name || "U")

  const onAccount = React.useCallback(async () => {
    setOpen(false)
    if (slug) {
      router.push(`/workspaces/${slug}/account/profile`)
      return
    }
    try {
      const res = await client.workspace.listMine.$get()
      const d = await res.json().catch(() => ({}))
      const s = ((d as { workspaces?: { slug: string }[] }).workspaces || [])[0]?.slug || ""
      if (s) router.push(`/workspaces/${s}/account/profile`)
      else router.push("/workspaces/new")
    } catch {
      router.push("/workspaces/new")
    }
  }, [router, slug])

  const onSettings = React.useCallback(async () => {
    setOpen(false)
    if (slug) {
      router.push(`/workspaces/${slug}/settings/branding`)
      return
    }
    try {
      const res = await client.workspace.listMine.$get()
      const d = await res.json().catch(() => ({}))
      const s = ((d as { workspaces?: { slug: string }[] }).workspaces || [])[0]?.slug || ""
      if (s) router.push(`/workspaces/${s}/settings/branding`)
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
        <DropdownMenuTrigger asChild className="w-full cursor-pointer">
          <button suppressHydrationWarning type="button" className="group flex items-center gap-2 rounded-md  px-2 py-1.5 text-xs md:text-sm text-accent hover:bg-muted dark:hover:bg-black/40">
            <div className=" ml-1 overflow-hidden">
              <Avatar className="size-5.5">
                {d.image ? <AvatarImage src={d.image} alt={d.name} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
            <span className="transition-colors">{d.name || "Account"}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-36 max-w-[40vw] p-2" side="bottom" align="center" sideOffset={8}>
          <DropdownMenuItem onSelect={onAccount} className="px-2 py-2 rounded-md flex items-center gap-2 group">
            <AccountIcon className="size-4 text-foreground transition-colors group-hover:opacity-100 group-hover:text-primary " />
            <span className="transition-colors group-hover:text-foreground">Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onSettings} className="px-2 py-2 rounded-md flex items-center gap-2 group">
            <SettingIcon className="size-4 text-foreground transition-colors group-hover:opacity-100 group-hover:text-primary" />
            <span className="transition-colors group-hover:text-foreground">Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onSignOut} className="px-2 py-2 rounded-md flex items-center gap-2 group" aria-disabled={loading}>
            <LogoutIcon className="size-4 text-foreground group-hover:opacity-100 group-hover:text-red-500 transition-colors" />
            <span className="transition-colors group-hover:text-foreground">Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
