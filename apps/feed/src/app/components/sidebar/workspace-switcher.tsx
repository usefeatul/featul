"use client"

import * as React from "react"
import { IconCheck, IconChevronDown } from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@feedgot/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@feedgot/ui/components/sidebar"
import { Avatar, AvatarImage, AvatarFallback } from "@feedgot/ui/components/avatar"

// Minimal workspace shape
type Workspace = { id: string; name: string; logo?: string }

const workspaces: Workspace[] = [
  { id: "1", name: "Acme Corp", logo: "https://api.dicebear.com/7.x/identicon/svg?seed=Acme%20Corp" },
  { id: "2", name: "Startup Inc", logo: "https://api.dicebear.com/7.x/identicon/svg?seed=Startup%20Inc" },
  { id: "3", name: "Personal", logo: "https://api.dicebear.com/7.x/identicon/svg?seed=Personal" },
  { id: "4", name: "Creative Studio", logo: "https://api.dicebear.com/7.x/identicon/svg?seed=Creative%20Studio" },
]

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar()
  const [activeWorkspace, setActiveWorkspace] = React.useState<Workspace>(
    workspaces[0] ?? { id: "default", name: "Workspace" }
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="rounded-sm group-data-[collapsible=icon]:gap-0">
              {/* Icon/avatar for active workspace */}
              <Avatar className="size-4">
                <AvatarImage src={activeWorkspace.logo} alt={activeWorkspace.name} />
                <AvatarFallback>{activeWorkspace.name?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                {activeWorkspace.name}
              </span>
              <IconChevronDown className="ml-auto size-4 opacity-60 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 p-1"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => setActiveWorkspace(workspace)}
                className="gap-2"
              >
                {/* Icon/avatar per workspace */}
                <Avatar className="size-4">
                  <AvatarImage src={workspace.logo} alt={workspace.name} />
                  <AvatarFallback>{workspace.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{workspace.name}</span>
                {workspace.id === activeWorkspace.id ? (
                  <IconCheck className="ml-auto size-4 text-primary" />
                ) : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}