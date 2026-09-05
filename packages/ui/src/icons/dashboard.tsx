import React from "react"

interface DashboardIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const DashboardIcon: React.FC<DashboardIconProps> = ({
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
      <title>dashboard</title>
      <rect
        x="2.25"
        y="2.25"
        width="6"
        height="6"
        rx="1.5"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
        className="origin-center transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:-translate-x-px group-hover:-translate-y-px"
      />
      <rect
        x="2.25"
        y="2.25"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <rect
        x="9.75"
        y="2.25"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        className="origin-center transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:translate-x-px group-hover:-translate-y-px"
      />
      <rect
        x="2.25"
        y="9.75"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        className="origin-center transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:-translate-x-px group-hover:translate-y-px"
      />
      <rect
        x="9.75"
        y="9.75"
        width="6"
        height="6"
        rx="1.5"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
        className="origin-center transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:translate-x-px group-hover:translate-y-px"
      />
      <rect
        x="9.75"
        y="9.75"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  )
}

export default DashboardIcon
