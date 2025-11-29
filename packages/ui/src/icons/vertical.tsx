import React from 'react'

interface MoveVerticalIconProps {
  className?: string
  size?: number
}

export const MoveVerticalIcon: React.FC<MoveVerticalIconProps> = ({ className = '', size = 18 }) => {
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
        points="5 7 9 3 13 7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <line
        x1="9"
        y1="5"
        x2="9"
        y2="13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <polyline
        points="13 11 9 15 5 11"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export default MoveVerticalIcon
