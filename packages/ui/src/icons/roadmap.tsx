import React from 'react'

interface RoadmapIconProps {
  className?: string
  size?: number
}

export const RoadmapIcon: React.FC<RoadmapIconProps> = ({ className = '', size = 18 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      className={className}
    >
      <title>align-3-left</title>
      <g fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M2 4.25C2 3.00726 3.00792 2 4.25 2H13.75C14.9921 2 16 3.00726 16 4.25V5.75C16 6.99274 14.9921 8 13.75 8H4.25C3.00792 8 2 6.99274 2 5.75V4.25Z" fill="currentColor"></path>
        <path fillRule="evenodd" clipRule="evenodd" d="M2 12.25C2 11.0073 3.00792 10 4.25 10H7.75C8.99208 10 10 11.0073 10 12.25V13.75C10 14.9927 8.99208 16 7.75 16H4.25C3.00792 16 2 14.9927 2 13.75V12.25Z" fill="currentColor" fillOpacity="0.4"></path>
      </g>
    </svg>
  )
}

export default RoadmapIcon