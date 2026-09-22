import React from "react"

interface LockStrokeIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const LockStrokeIcon: React.FC<LockStrokeIconProps> = ({
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
      <title>lock</title>
      <rect
        x="3.25"
        y="8.25"
        width="11.5"
        height="7.5"
        rx="2"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
        className="origin-bottom transition-transform duration-150 ease-out group-hover:scale-105 group-active:scale-100"
      />
      <rect
        x="3.25"
        y="8.25"
        width="11.5"
        height="7.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="origin-bottom transition-transform duration-150 ease-out group-hover:scale-105 group-active:scale-100"
      />
      <path
        d="M6.25 8.25V5.5a2.75 2.75 0 0 1 5.5 0v2.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        className="origin-bottom transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:-translate-y-0.5"
      />
    </svg>
  )
}

export default LockStrokeIcon
