"use client"

import * as React from "react"
import {
  IconCheck,
  IconChevronDown,
  IconPlus,
  IconSettings,
  IconSparkles,
} from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@feedgot/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@feedgot/ui/components/sidebar"

// Mock workspace data with modern gradient colors
const workspaces = [
  {
    id: "1",
    name: "Acme Corp",
    plan: "Enterprise",
    color: "from-blue-500 to-purple-600",
    initials: "AC",
  },
  {
    id: "2", 
    name: "Startup Inc",
    plan: "Pro",
    color: "from-emerald-500 to-teal-600",
    initials: "SI",
  },
  {
    id: "3",
    name: "Personal",
    plan: "Free",
    color: "from-orange-500 to-red-500",
    initials: "PE",
  },
  {
    id: "4",
    name: "Creative Studio",
    plan: "Pro",
    color: "from-pink-500 to-rose-600",
    initials: "CS",
  },
]

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar()
  const [activeWorkspace, setActiveWorkspace] = React.useState(workspaces[0])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group relative overflow-hidden transition-all duration-300 data-[state=open]:from-sidebar-accent/60 data-[state=open]:to-sidebar-accent/30 rounded-sm"
            >
              <div className={`flex aspect-square size-8 items-center justify-center rounded-sm bg-gradient-to-br ${activeWorkspace.color} text-white font-medium text-sm`}>
                {activeWorkspace.initials}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-sidebar-foreground">
                  {activeWorkspace.name}
                </span>
                <div className="flex items-center gap-1">
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    {activeWorkspace.plan}
                  </span>
                  {activeWorkspace.plan === "Enterprise" && (
                    <IconSparkles className="size-3 text-amber-500" />
                  )}
                </div>
              </div>
              <IconChevronDown className="ml-auto size-4 text-sidebar-foreground/60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 p-1 bg-background border border-border rounded-sm"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
              Switch workspace
            </DropdownMenuLabel>
            <div className="space-y-0.5">
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => setActiveWorkspace(workspace)}
                  className="group relative gap-2 p-2 rounded-sm hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className={`flex size-7 items-center justify-center rounded-sm bg-gradient-to-br ${workspace.color} text-white font-medium text-xs`}>
                    {workspace.initials}
                  </div>
                  <div className="grid flex-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-medium text-sm">
                        {workspace.name}
                      </span>
                      {workspace.plan === "Enterprise" && (
                        <IconSparkles className="size-3 text-amber-500" />
                      )}
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                      {workspace.plan} plan
                    </span>
                  </div>
                  {workspace.id === activeWorkspace.id && (
                    <div className="flex items-center justify-center">
                      <IconCheck className="size-3 text-primary" />
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
            
            <DropdownMenuSeparator className="my-1 bg-border/50" />
            
            <div className="space-y-0.5">
              <DropdownMenuItem className="group gap-2 p-2 rounded-sm hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex size-7 items-center justify-center rounded-sm bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                  <IconPlus className="size-3" />
                </div>
                <div className="grid flex-1 text-left">
                  <span className="font-medium text-sm">Create workspace</span>
                  <span className="text-xs text-muted-foreground">
                    Start a new project
                  </span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="group gap-2 p-2 rounded-sm hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex size-7 items-center justify-center rounded-sm bg-gradient-to-br from-slate-400 to-slate-600 text-white">
                  <IconSettings className="size-3" />
                </div>
                <div className="grid flex-1 text-left">
                  <span className="font-medium text-sm">Workspace settings</span>
                  <span className="text-xs text-muted-foreground">
                    Manage your workspaces
                  </span>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}