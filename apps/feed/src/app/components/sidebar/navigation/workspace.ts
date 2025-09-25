import { SettingIcon } from "@feedgot/ui/icons/setting"
import { BoardIcon } from "@feedgot/ui/icons/board"

export type WorkspaceNavItem = {
  name: string
  url: string
  icon: React.ComponentType<{ className?: string; size?: number }>
}

export const workspaceItems: WorkspaceNavItem[] = [
  {
    name: "Board",
    url: "/dashboard/board",
    icon: BoardIcon,
  },
  {
    name: "Settings",
    url: "/dashboard/settings",
    icon: SettingIcon,
  },
]

export default workspaceItems