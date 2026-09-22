import React from "react"

interface VoteIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const VoteIcon: React.FC<VoteIconProps> = ({
  className = "",
  size = 18,
  opacity = 1,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      opacity={opacity}
      className={className}
    >
      <title>vote</title>
      <rect
        x="2.75"
        y="2.75"
        width="12.5"
        height="12.5"
        rx="3.5"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
      />
      <rect
        x="2.75"
        y="2.75"
        width="12.5"
        height="12.5"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9 6.25v5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        className="origin-bottom transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:-translate-y-0.5"
      />
      <path
        d="M6.25 8.75L9 6.25l2.75 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="origin-bottom transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:-translate-y-0.5"
      />
    </svg>
  )
}

export default VoteIcon
