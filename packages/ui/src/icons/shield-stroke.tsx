import React from "react"

interface ShieldStrokeIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const ShieldStrokeIcon: React.FC<ShieldStrokeIconProps> = ({
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
      <title>shield</title>
      <path
        d="M9 1.75 15.25 4v4.35c0 3.62-2.58 6.38-6.25 7.65C5.33 14.73 2.75 11.97 2.75 8.35V4L9 1.75Z"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
      />
      <path
        d="M9 1.75 15.25 4v4.35c0 3.62-2.58 6.38-6.25 7.65C5.33 14.73 2.75 11.97 2.75 8.35V4L9 1.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M6.75 9.1 8.35 10.7 11.4 7.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="origin-center transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:scale-110"
      />
    </svg>
  )
}

export default ShieldStrokeIcon
