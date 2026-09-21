import React from "react"

interface ClockIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const ClockIcon: React.FC<ClockIconProps> = ({
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
      aria-hidden="true"
    >
      <path
        d="M9 16.25C12.4518 16.25 15.25 13.4518 15.25 10C15.25 6.54822 12.4518 3.75 9 3.75C5.54822 3.75 2.75 6.54822 2.75 10C2.75 13.4518 5.54822 16.25 9 16.25Z"
        fill="currentColor"
        fillOpacity="0.3"
        className="origin-center transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95"
      />
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6.75 1.25H11.25" />
        <path d="M9 1.25V3.75" />
        <path
          d="M9 16.25C12.4518 16.25 15.25 13.4518 15.25 10C15.25 6.54822 12.4518 3.75 9 3.75C5.54822 3.75 2.75 6.54822 2.75 10C2.75 13.4518 5.54822 16.25 9 16.25Z"
          className="origin-center transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95"
        />
        <path
          d="M6.70203 7.702L9.00003 10"
          className="origin-[9px_10px] transition-transform duration-300 ease-out group-hover:-rotate-12"
        />
        <path
          d="M14.25 2.75L16.25 4.75"
          className="transition-transform duration-200 ease-out group-hover:translate-x-px group-hover:-translate-y-px"
        />
      </g>
    </svg>
  )
}

export default ClockIcon
