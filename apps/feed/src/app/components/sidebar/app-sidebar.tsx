"use client"
import * as React from "react"
import { NavWorkspace } from "@/app/components/sidebar/nav-workspace"
import { NavRequest } from "@/app/components/sidebar/nav-request"
import { NavServices } from "@/app/components/sidebar/nav-services"
import { UserDropdown } from "@/app/components/sidebar/userdropdown"
import { WorkspaceSwitcher } from "@/app/components/sidebar/workspace-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@feedgot/ui/components/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 w-full">
          <WorkspaceSwitcher />
          <UserDropdown />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavRequest />
        <NavServices />
        <NavWorkspace />
      </SidebarContent>
    </Sidebar>
  )
}
