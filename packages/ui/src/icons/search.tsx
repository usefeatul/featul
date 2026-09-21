import React from 'react'

interface SearchIconProps {
  className?: string
  size?: number
}

export const SearchIcon: React.FC<SearchIconProps> = ({ className = '', size = 18 }) => {
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
        d="M15.75 15.75L11.6386 11.6386"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
      <path
        d="M7.75 13.25C10.7875 13.25 13.25 10.7875 13.25 7.75C13.25 4.7125 10.7875 2.25 7.75 2.25C4.7125 2.25 2.25 4.7125 2.25 7.75C2.25 10.7875 4.7125 13.25 7.75 13.25Z"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  )
}

export default SearchIcon
