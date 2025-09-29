"use client"

import {
  IconCreditCard,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@feedgot/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { useSession } from "@/lib/auth/client"
import { getDisplayUser, getInitials } from "@/lib/utils/user-utils"

export function UserDropdown() {
  const { isMobile, state } = useSidebar()
  // Hide the user dropdown when the sidebar is collapsed
  if (state === "collapsed") {
    return null
  }
  const { data: session, isPending } = useSession()

  console.log("UserDropdown: Session data:", { session, isPending, user: session?.user })

  if (isPending) {
    console.log("UserDropdown: Session is pending, showing loading state")
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="sm">
            <Avatar className="h-8 w-8">
                <AvatarFallback></AvatarFallback>
              </Avatar>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!session?.user) {
    console.log("UserDropdown: No user session, returning null")
    return null
  }

  console.log("UserDropdown: Rendering full dropdown with user:", session.user.name)

  const displayUser = getDisplayUser(session.user)

  const handleSignOut = async () => {
    const { signOut } = await import("@/lib/auth/client")
    await signOut()
  }

  console.log("UserDropdown: About to render JSX")

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="sm"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-8 w-auto px-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={displayUser.image || ""} alt={displayUser.name} />
                <AvatarFallback>
                  {getInitials(displayUser.name)}
                </AvatarFallback>
              </Avatar>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-40"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={displayUser.image || ""} alt={displayUser.name} />
                  <AvatarFallback>
                    {getInitials(displayUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayUser.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {displayUser.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
