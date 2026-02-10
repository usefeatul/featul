"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@featul/ui/components/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import { cn } from "@featul/ui/lib/utils"
import { authClient } from "@featul/auth/client"
import { toast } from "sonner"
import { getInitials, getDisplayUser } from "@/utils/user-utils"
import { useTheme } from "next-themes"
import CreatePostModal from "./CreatePostModal"
import { SubdomainUserMenu } from "./SubdomainUserMenu"
import type { AuthUser } from "@/types/auth"
import { hasAuthUser } from "@/utils/auth"
import { getCreateProjectUrl, getDashboardUrl } from "@/utils/app-urls"


export default function SubdomainUserDropdown({
  className = "",
  subdomain,
  initialUser,
}: {
  className?: string
  subdomain: string
  initialUser?: AuthUser | null
}) {
  const router = useRouter()
  const { theme = "system", setTheme } = useTheme()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [user, setUser] = React.useState<AuthUser | null>(initialUser ?? null)
  const [postModalOpen, setPostModalOpen] = React.useState(false)

  React.useEffect(() => {
    let active = true
    ;(async () => {
      try {
        if (initialUser?.image) return
        const s = await authClient.getSession()
        if (!active) return
        const u = s?.data?.user || null
        if (u?.image) setUser(u)
      } catch {
        if (active) setUser(null)
      }
    })()
    return () => { active = false }
  }, [initialUser?.image])

  const d = getDisplayUser(user || undefined)
  const initials = getInitials(d.name || "U")
  const themeLabel = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"

  const onSubmitPost = React.useCallback(() => {
    setOpen(false)
    setPostModalOpen(true)
  }, [setPostModalOpen])

  const onTheme = React.useCallback(() => {
    const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system"
    setTheme(next)
    setOpen(false)
  }, [theme, setTheme])

  const onDashboard = React.useCallback(() => {
    setOpen(false)
    const target = getDashboardUrl()
    window.location.href = target
  }, [])

  const onCreateProject = React.useCallback(() => {
    setOpen(false)
    const target = getCreateProjectUrl()
    window.location.href = target
  }, [])

  const onSignOut = React.useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      await authClient.signOut()
      toast.success("Signed out")
      setUser(null)
      setOpen(false)
      router.refresh()
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
          <button
            suppressHydrationWarning
            type="button"
            className="group flex items-center gap-2 rounded-mdbg-background/60 px-1.5 py-1 text-xs md:text-sm text-foreground shadow-xs hover:bg-muted/80"
          >
              <Avatar className="size-5.5">
                {d.image ? (
                  <AvatarImage src={d.image} alt={d.name} loading="eager" />
                ) : (
                  <AvatarFallback>{initials}</AvatarFallback>
                )}
              </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-36 max-w-[85vw] p-1.5"
          side="bottom"
          align="center"
          sideOffset={8}
        >
          <SubdomainUserMenu
            themeLabel={themeLabel}
            loading={loading}
            showSignOut={hasAuthUser(user)}
            onSubmitPost={onSubmitPost}
            onDashboard={onDashboard}
            onCreateProject={onCreateProject}
            onTheme={onTheme}
            onSignOut={onSignOut}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <CreatePostModal
        open={postModalOpen}
        onOpenChange={setPostModalOpen}
        workspaceSlug={subdomain}
        boardSlug={subdomain}
      />
    </div>
  )
}
