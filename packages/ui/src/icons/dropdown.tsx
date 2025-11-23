import React from 'react'

interface DropdownIconProps {
  className?: string
  size?: number
}

export const DropdownIcon: React.FC<DropdownIconProps> = ({ className = '', size = 18 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      className={className}
    >
      <path d="M12.5 6.25L9 2.75L5.5 6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
      <path d="M12.5 11.75L9 15.25L5.5 11.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
    </svg>
  )
}

export default DropdownIcon

