import React from 'react'

interface SidebarIconProps {
  className?: string
  size?: number
}

export const SidebarIcon: React.FC<SidebarIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
    >
      <title>sidebar right</title>
      <path d="m27,3H5c-2.206,0-4,1.794-4,4v18c0,2.206,1.794,4,4,4h22c2.206,0,4-1.794,4-4V7c0-2.206-1.794-4-4-4Zm-10,24H5c-1.103,0-2-.897-2-2V7c0-1.103.897-2,2-2h12v22Zm10-5h-6v-2h6v2Zm0-5h-6v-2h6v2Zm0-5h-6v-2h6v2Z" strokeWidth="0" fill="currentColor" stroke="none"></path>
    </svg>
  )
}

export default SidebarIcon