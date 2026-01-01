import React from 'react'

interface PlusIconProps {
  className?: string
  size?: number
}

export const PlusIcon: React.FC<PlusIconProps> = ({ className = '', size = 18 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={size}
      height={size}
      opacity={0.6}
      viewBox="0 0 18 18"
      className={className}
    >
      <rect
        x="2.25"
        y="2.25"
        width="13.5"
        height="13.5"
        rx="2.5"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
        data-stroke="none"
        className="transition-transform duration-200 ease-out origin-center group-hover:scale-105 group-active:scale-110"
      />
      <rect
        x="2.25"
        y="2.25"
        width="13.5"
        height="13.5"
        rx="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 6V12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="transform transition-transform duration-200 ease-out origin-center group-hover:scale-110 group-active:scale-125"
      ></path>
      <path
        d="M6 9H12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="transform transition-transform duration-200 ease-out origin-center group-hover:scale-110 group-active:scale-125"
      ></path>
    </svg>
  )
}

export default PlusIcon
