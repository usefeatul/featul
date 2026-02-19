import React from "react"

interface CommentCollapseIconProps {
  className?: string
  size?: number
}

export const CommentCollapseIcon: React.FC<CommentCollapseIconProps> = ({ className = "", size = 14 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      className={className}
    >
      <path
        d="M4.25 2.75L7.75 6L4.25 9.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default CommentCollapseIcon
