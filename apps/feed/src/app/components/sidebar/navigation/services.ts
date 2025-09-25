import type React from 'react'
import { ChangelogIcon } from "@feedgot/ui/icons/changelog"
import { RoadmapIcon } from "@feedgot/ui/icons/roadmap"

export type ServiceNavItem = {
  name: string
  url: string
  icon: React.ComponentType<{ className?: string; size?: number }>
}

export const servicesItems: ServiceNavItem[] = [
  {
    name: "Changelog",
    url: "/dashboard/changelog",
    icon: ChangelogIcon,
  },
  {
    name: "Roadmap",
    url: "/dashboard/roadmap",
    icon: RoadmapIcon,
  },
]

export default servicesItems