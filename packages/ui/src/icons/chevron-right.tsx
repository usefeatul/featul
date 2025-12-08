import React from "react"

interface ChevronRightIconProps {
  className?: string
  size?: number
}

export const ChevronRightIcon: React.FC<ChevronRightIconProps> = ({ className = '', size = 18 }) => {
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
      <path
        d="M6.5 2.75L12.75 9L6.5 15.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export default ChevronRightIcon
