import React from "react"
import { DropdownMenuItem } from "@oreilla/ui/components/dropdown-menu"
import { CommentsIcon } from "@oreilla/ui/icons/comments"
import { SettingIcon } from "@oreilla/ui/icons/setting"
import { PlusIcon } from "@oreilla/ui/icons/plus"
import { LogoutIcon } from "@oreilla/ui/icons/logout"

type SubdomainUserMenuProps = {
  themeLabel: string
  loading: boolean
  showSignOut: boolean
  onSubmitPost: () => void
  onDashboard: () => void
  onCreateProject: () => void
  onTheme: () => void
  onSignOut: () => void
}

export function SubdomainUserMenu({
  themeLabel,
  loading,
  showSignOut,
  onSubmitPost,
  onDashboard,
  onCreateProject,
  onTheme,
  onSignOut,
}: SubdomainUserMenuProps) {
  return (
    <div className="space-y-1 text-xs">
      <div className="border-b border-border/70 pb-1">
        <DropdownMenuItem
          onClick={onSubmitPost}
          className="flex items-center justify-between px-2 py-1.5 text-xs group"
        >
          <span className="transition-colors group-hover:text-foreground">
            Submit post
          </span>
          <CommentsIcon className="size-4 text-foreground/70 opacity-100 transition-colors group-hover:text-primary" />
        </DropdownMenuItem>
      </div>

      <div className="border-b border-border/70 pb-1">
        <DropdownMenuItem
          onClick={onDashboard}
          className="mt-1 flex items-center justify-between px-2 py-1.5 text-xs group"
        >
          <span className="transition-colors group-hover:text-foreground">
            Dashboard
          </span>
          <SettingIcon className="size-4 text-foreground/70 opacity-100 transition-colors group-hover:text-primary" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onCreateProject}
          className="mt-0.5 flex items-center justify-between px-2 py-1.5 text-xs group"
        >
          <span className="transition-colors group-hover:text-foreground">
            Create project
          </span>
          <PlusIcon className="size-4 text-foreground/70 opacity-100 transition-colors group-hover:text-primary" />
        </DropdownMenuItem>
      </div>

      <div className="pt-1">
        <DropdownMenuItem
          onClick={onTheme}
          className="flex items-center justify-between px-2 py-1.5 text-xs group"
        >
          <span className="transition-colors group-hover:text-foreground">
            Theme: {themeLabel}
          </span>
          <SettingIcon className="size-4 text-foreground/70 opacity-100 transition-colors group-hover:text-primary" />
        </DropdownMenuItem>
        {showSignOut ? (
          <DropdownMenuItem
            onClick={onSignOut}
            className="mt-0.5 flex items-center justify-between px-2 py-1.5 text-xs group"
            aria-disabled={loading}
            variant="destructive"
          >
            <span>Sign out</span>
            <LogoutIcon className="size-4 text-foreground/80 opacity-100 transition-colors group-hover:text-red-500" />
          </DropdownMenuItem>
        ) : null}
      </div>
    </div>
  )
}


