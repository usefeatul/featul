import React from "react"

interface ChevronLeftIconProps {
  className?: string
  size?: number
}

export const ChevronLeftIcon: React.FC<ChevronLeftIconProps> = ({ className = '', size = 18 }) => {
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
        d="m7.75,11c-.192,0-.384-.073-.53-.22L2.97,6.53c-.293-.293-.293-.768,0-1.061L7.22,1.22c.293-.293.768-.293,1.061,0s.293.768,0,1.061l-3.72,3.72,3.72,3.72c.293.293.293.768,0,1.061-.146.146-.338.22-.53.22Z"
        strokeWidth="0"
        fill="currentColor"
      />
    </svg>
  )
}

export default ChevronLeftIcon
