import React from 'react'

interface NoltIconProps {
  className?: string
  size?: number
}

export const NoltIcon: React.FC<NoltIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      width={size}
      height={size}
      fill="none"
    >
      <defs>
        <clipPath id="nolt-rounded">
          <rect width="64" height="64" rx="12" ry="12" />
        </clipPath>
      </defs>

      <g clipPath="url(#nolt-rounded)">
        {/* Main background */}
        <path
          d="M0 0h64v64H0V0Z"
          fill="#FB736F"
        />

        {/* Right edge gradient/shadow */}
        <path
          d="M64 0v64H34c1.32-1.01 2.64-2.02 4-3 .66-.66 1.32-1.32 2-2-.66-.66-1.32-1.32-2-2 .99-.66 1.98-1.32 3-2-.33-1.65-.66-3.3-1-5h8V16h-4v-6c.66-.66 1.32-1.32 2-2-.99-.66-1.98-1.32-3-2 .66-1.32 1.32-2.64 2-4C52.509 4.994 62.975 0 64 0Z"
          fill="#FA6B66"
        />

        {/* Large white square (top-left area) */}
        <path
          d="M16 16h32v32H32V32H16V16Z"
          fill="#FEE2E1"
        />

        {/* Medium square (center) */}
        <path
          d="M32 32h16v16H32V32Z"
          fill="#FEC5C3"
        />

        {/* Small white square (inner) */}
        <path
          d="M16 16h16v16H16V16Z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  )
}

export default NoltIcon
