import React from "react"

interface WidgetIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const WidgetIcon: React.FC<WidgetIconProps> = ({
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
      <title>widget</title>
      <rect
        x="1.75"
        y="2.75"
        width="14.5"
        height="12.5"
        rx="2"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
      />
      <rect
        x="1.75"
        y="2.75"
        width="14.5"
        height="12.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M1.75 6.75H16.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="4.25" cy="4.75" r="0.85" fill="currentColor" />
      <circle cx="6.75" cy="4.75" r="0.85" fill="currentColor" />
    </svg>
  )
}

export default WidgetIcon
