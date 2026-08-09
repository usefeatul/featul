import React from 'react'

interface MaximizeIconProps {
  className?: string
  size?: number
}

export const MaximizeIcon: React.FC<MaximizeIconProps> = ({ className = '', size = 18 }) => {
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
        <polyline points="11.25 2.25 15.75 2.25 15.75 6.75" />
        <polyline points="6.75 15.75 2.25 15.75 2.25 11.25" />
        <line x1="15.75" y1="2.25" x2="10.5" y2="7.5" data-color="color-2" />
        <line x1="2.25" y1="15.75" x2="7.5" y2="10.5" data-color="color-2" />
      </g>
    </svg>
  )
}

export default MaximizeIcon
