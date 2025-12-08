"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@feedgot/ui/components/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@feedgot/ui/components/avatar"
import { cn } from "@feedgot/ui/lib/utils"
import { authClient } from "@feedgot/auth/client"
import { toast } from "sonner"
import { getInitials, getDisplayUser } from "@/utils/user-utils"
import { CommentsIcon } from "@feedgot/ui/icons/comments"
import { SettingIcon } from "@feedgot/ui/icons/setting"
import { AccountIcon } from "@feedgot/ui/icons/account"
import { PlusIcon } from "@feedgot/ui/icons/plus"
import { LogoutIcon } from "@feedgot/ui/icons/logout"
import { useTheme } from "next-themes"
//

type User = { name?: string; email?: string; image?: string | null } | null

export default function SubdomainUserDropdown({
  className = "",
  workspace,
  subdomain,
  initialUser,
}: {
  className?: string
  workspace: { slug: string; name?: string; logo?: string | null }
  subdomain: string
  initialUser?: User
}) {
  const router = useRouter()
  const { theme = "system", setTheme } = useTheme()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [user, setUser] = React.useState<User>(initialUser ?? null)

  React.useEffect(() => {
    let active = true
    ;(async () => {
      try {
        if (initialUser?.image) return
        const s = await authClient.getSession()
        if (!active) return
        const u = (s as any)?.data?.user || null
        if (u?.image) setUser(u)
      } catch {}
    })()
    return () => { active = false }
  }, [initialUser?.image])

  const d = getDisplayUser(user || undefined)
  const initials = getInitials(d.name || "U")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
  const themeLabel = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"

  const onSubmitPost = React.useCallback(() => {
    setOpen(false)
    const target = `/${subdomain}/${workspace.slug}`
    if (user) router.push(target)
    else router.push(`/auth/sign-in?redirect=${encodeURIComponent(target)}`)
  }, [router, subdomain, workspace.slug, user])

  const onProfile = React.useCallback(() => {
    setOpen(false)
    const target = `${appUrl}/workspaces/${workspace.slug}/account/profile`
    window.location.href = target
  }, [appUrl, workspace.slug])

  const onTheme = React.useCallback(() => {
    const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system"
    setTheme(next)
    setOpen(false)
  }, [theme, setTheme])

  const onDashboard = React.useCallback(() => {
    setOpen(false)
    const target = `${appUrl}/start`
    window.location.href = target
  }, [appUrl])

  const onCreateProject = React.useCallback(() => {
    setOpen(false)
    const target = `${appUrl}/workspaces/new`
    window.location.href = target
  }, [appUrl])

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
          <button suppressHydrationWarning type="button" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs md:text-sm text-accent hover:bg-muted">
            <div className="rounded-md border ring-1 ring-border overflow-hidden">
              <Avatar className="size-5.5">
                {d.image ? <AvatarImage src={d.image} alt={d.name} loading="eager" /> : <AvatarFallback>{initials}</AvatarFallback>}
              </Avatar>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40 max-w-[95vw] p-2" side="bottom" align="center" sideOffset={8}>
          <DropdownMenuItem onSelect={onSubmitPost} className="px-2 py-2 rounded-sm flex items-center gap-2 group">
            <CommentsIcon className="w-[18px] h-[18px] text-foreground/80 transition-colors group-hover:text-primary" />
            <span className="transition-colors group-hover:text-foreground">Submit post</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onProfile} className="px-2 py-2 rounded-sm flex items-center gap-2 group">
            <AccountIcon className="w-[18px] h-[18px] text-foreground/80 transition-colors group-hover:text-primary" />
            <span className="transition-colors group-hover:text-foreground">Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onTheme} className="px-2 py-2 rounded-sm flex items-center gap-2 group">
            <SettingIcon className="w-[18px] h-[18px] text-foreground/80 transition-colors group-hover:text-primary" />
            <span className="transition-colors group-hover:text-foreground">Theme: {themeLabel}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onDashboard} className="px-2 py-2 rounded-sm flex items-center gap-2 group">
            <SettingIcon className="w-[18px] h-[18px] text-foreground/80 transition-colors group-hover:text-primary" />
            <span className="transition-colors group-hover:text-foreground">Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onCreateProject} className="px-2 py-2 rounded-sm flex items-center gap-2 group">
            <PlusIcon className="w-[18px] h-[18px] text-foreground/80 transition-colors group-hover:text-primary" />
            <span className="transition-colors group-hover:text-foreground">Create project</span>
          </DropdownMenuItem>
          {user ? (
            <DropdownMenuItem onSelect={onSignOut} className="px-2 py-2 rounded-sm flex items-center gap-2 group" aria-disabled={loading}>
              <LogoutIcon className="w-[18px] h-[18px] text-foreground/80 group-hover:text-red-500 transition-colors" />
              <span>Sign out</span>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
