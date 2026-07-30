import React from 'react'

interface MinimizeIconProps {
  className?: string
  size?: number
}

export const MinimizeIcon: React.FC<MinimizeIconProps> = ({ className = '', size = 18 }) => {
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
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      >
        <polyline points="15 7.5 10.5 7.5 10.5 3" />
        <polyline points="3 10.5 7.5 10.5 7.5 15" />
        <line x1="10.5" y1="7.5" x2="15.75" y2="2.25" data-color="color-2" />
        <line x1="2.25" y1="15.75" x2="7.5" y2="10.5" data-color="color-2" />
      </g>
    </svg>
  )
}

export default MinimizeIcon
