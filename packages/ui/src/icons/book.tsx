import React from "react"

interface BookIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const BookIcon: React.FC<BookIconProps> = ({
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
      <title>book</title>
      <path
        d="M9.25 3.25v11.5c0 .828-.672 1.5-1.5 1.5H4.25c-.828 0-1.5-.672-1.5-1.5V4.75c0-.828.672-1.5 1.5-1.5h5Z"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
      />
      <path
        d="M9.25 3.25H13.75c.828 0 1.5.672 1.5 1.5v9.5c0 .828-.672 1.5-1.5 1.5H9.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9.25 3.25H4.25c-.828 0-1.5.672-1.5 1.5v9.5c0 .828.672 1.5 1.5 1.5h3.5c.828 0 1.5-.672 1.5-1.5V3.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M11.25 6.75h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="origin-left transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:scale-x-90"
      />
    </svg>
  )
}

export default BookIcon
