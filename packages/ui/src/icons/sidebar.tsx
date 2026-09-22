import React from 'react'
import { PanelIcon } from './panel'

interface SidebarIconProps {
  className?: string
  size?: number
}

export const SidebarIcon: React.FC<SidebarIconProps> = ({ className = '', size = 24 }) => {
  return (
    <PanelIcon side="right" className={className} width={size} height={size} />
  )
}

export default SidebarIcon
