"use client"

import { 
  IconClock, 
  IconEye, 
  IconCalendar, 
  IconPlayerPlay, 
  IconCheck, 
  IconX,
  type Icon 
} from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@feedgot/ui/components/sidebar"

const requestStatuses = [
  {
    title: "Pending",
    url: "/requests/pending",
    icon: IconClock,
  },
  {
    title: "Reviewing",
    url: "/requests/reviewing", 
    icon: IconEye,
  },
  {
    title: "Planned",
    url: "/requests/planned",
    icon: IconCalendar,
  },
  {
    title: "In Progress",
    url: "/requests/in-progress",
    icon: IconPlayerPlay,
  },
  {
    title: "Completed",
    url: "/requests/completed",
    icon: IconCheck,
  },
  {
    title: "Closed",
    url: "/requests/closed",
    icon: IconX,
  },
]

export function NavRequest() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>REQUEST</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {requestStatuses.map((status) => (
            <SidebarMenuItem key={status.title}>
              <SidebarMenuButton tooltip={status.title}>
                {status.icon && <status.icon />}
                <span>{status.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}