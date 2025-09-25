"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@feedgot/ui/components/sidebar"

import { servicesItems } from "./navigation/services"

export function NavServices() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>SERVICE</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {servicesItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild tooltip={item.name}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}