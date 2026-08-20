import React from 'react'

interface BoardIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const BoardIcon: React.FC<BoardIconProps> = ({ className = '', size = 18, opacity = 1 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      opacity={opacity}
      className={className}
    >
      <title>window-pointer</title>
      <rect
        x="1.75"
        y="2.75"
        width="14.5"
        height="12.5"
        rx="2"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
      ></rect>
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
      ></rect>
      <path
        d="M1.75 6.75H16.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
      <circle cx="4.25" cy="4.75" r="1" fill="currentColor"></circle>
      <circle cx="6.75" cy="4.75" r="1" fill="currentColor"></circle>
      <g className="transition-transform duration-150 ease-out origin-bottom-left group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:scale-95 group-active:translate-x-1 group-active:translate-y-1 group-active:scale-90">
        <path
          d="M10.0605 11.3819C9.77093 10.5695 10.574 9.7762 11.3833 10.0656L17.3221 12.2351C18.244 12.5691 18.2194 13.8877 17.2823 14.1846L14.9326 14.9364L14.1795 17.2913C13.8828 18.2069 12.5724 18.2599 12.2324 17.3269L10.0605 11.3819Z"
          fill="var(--background, white)"
          stroke="var(--background, white)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        ></path>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.0605 11.3819C9.77093 10.5695 10.574 9.7762 11.3833 10.0656L17.3221 12.2351C18.244 12.5691 18.2194 13.8877 17.2823 14.1846L14.9326 14.9364L14.1795 17.2913C13.8828 18.2069 12.5724 18.2599 12.2324 17.3269L10.0605 11.3819Z"
          fill="currentColor"
        ></path>
      </g>
    </svg>
  )
}

export default BoardIcon
