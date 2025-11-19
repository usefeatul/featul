import React from 'react'

interface InProgressIconProps {
  className?: string
  size?: number
}

export const InProgressIcon: React.FC<InProgressIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="-0.5 -0.5 16 16" fill="none" stroke="currentColor" strokeWidth="1" strokeMiterlimit="10" className={className}>
      <path d="M0.9375 7.5a6.5625 6.5625 0 1 0 13.125 0 6.5625 6.5625 0 1 0 -13.125 0" />
      <path d="m8.69375 7.5 -5.36875 0" />
      <path d="M8.69375 4.518750000000001 11.675 7.5l-2.9812499999999997 2.9812499999999997" />
      <path d="M5.7125 4.518750000000001 8.69375 7.5l-2.9812499999999997 2.9812499999999997" />
    </svg>
  )
}

export default InProgressIcon