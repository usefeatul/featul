"use client"
import * as React from "react"
import { NavWorkspace } from "@/app/components/sidebar/nav-workspace"
import { NavRequest } from "@/app/components/sidebar/nav-request"
import { NavServices } from "@/app/components/sidebar/nav-services"
import { UserDropdown } from "@/app/components/sidebar/userdropdown"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@feedgot/ui/components/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavRequest />
        <NavServices />
        <NavWorkspace />
      </SidebarContent>
      <SidebarFooter>
        <UserDropdown />
      </SidebarFooter>
    </Sidebar>
  )
}
