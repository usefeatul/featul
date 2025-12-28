import React from 'react'

interface CheckIconProps {
  className?: string
  size?: number
}

export const CheckIcon: React.FC<CheckIconProps> = ({ className = '', size = 18 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      className={className}
    >
      <path
        d="m1.76 7.004 2.25 3L10.24 1.746"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  )
}

export default CheckIcon

