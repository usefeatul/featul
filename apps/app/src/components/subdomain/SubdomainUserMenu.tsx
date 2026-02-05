import React from "react"
import { DropdownMenuItem } from "@featul/ui/components/dropdown-menu"
import { IdeaIcon } from "@featul/ui/icons/idea"
import { SettingIcon } from "@featul/ui/icons/setting"
import { HomeIcon } from "@featul/ui/icons/home"
import { FillPlusIcon } from "@featul/ui/icons/fill-plus"
import { LogoutIcon } from "@featul/ui/icons/logout"

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
          <IdeaIcon className="size-4 text-foreground/70 opacity-100 transition-colors group-hover:text-primary" />
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
          <HomeIcon className="size-4 text-foreground/70 opacity-100 transition-colors group-hover:text-primary" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onCreateProject}
          className="mt-0.5 flex items-center justify-between px-2 py-1.5 text-xs group"
        >
          <span className="transition-colors group-hover:text-foreground">
            Create project
          </span>
          <FillPlusIcon className="size-4 text-foreground/70 opacity-100 transition-colors group-hover:text-primary" />
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
