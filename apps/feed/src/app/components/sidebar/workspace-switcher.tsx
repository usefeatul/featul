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

// Minimal workspace shape
type Workspace = { id: string; name: string }

const workspaces: Workspace[] = [
  { id: "1", name: "Acme Corp" },
  { id: "2", name: "Startup Inc" },
  { id: "3", name: "Personal" },
  { id: "4", name: "Creative Studio" },
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
            <SidebarMenuButton size="lg" className="rounded-sm">
              <span className="truncate text-sm font-medium">
                {activeWorkspace.name}
              </span>
              <IconChevronDown className="ml-auto size-4 opacity-60" />
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