import React from "react"

interface CopyLinkIconProps {
  className?: string
  size?: number
}

export const CopyLinkIcon: React.FC<CopyLinkIconProps> = ({
  className = "",
  size = 18,
}) => {
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
        d="M6.25,7.25h-1.5c-1.933,0-3.5-1.567-3.5-3.5s1.567-3.5,3.5-3.5h3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M11.75,10.75h1.5c1.933,0,3.5,1.567,3.5,3.5s-1.567,3.5-3.5,3.5h-3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <line
        x1="6.75"
        y1="11.25"
        x2="11.25"
        y2="6.75"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export default CopyLinkIcon
