"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@feedgot/ui/components/sidebar"

import { workspaceItems } from "./navigation/workspace"

export function NavWorkspace() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>WORKSPACE</SidebarGroupLabel>
      <SidebarMenu>
        {workspaceItems.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
