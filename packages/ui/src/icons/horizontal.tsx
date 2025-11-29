import React from 'react'

interface MoveHorizontalIconProps {
  className?: string
  size?: number
}

export const MoveHorizontalIcon: React.FC<MoveHorizontalIconProps> = ({ className = '', size = 18 }) => {
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
      <polyline
        points="7 5 3 9 7 13"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <line
        x1="5"
        y1="9"
        x2="13"
        y2="9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <polyline
        points="11 13 15 9 11 5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export default MoveHorizontalIcon
