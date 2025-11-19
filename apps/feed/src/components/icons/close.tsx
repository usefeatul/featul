import React from 'react'

interface CloseIconProps {
  className?: string
  size?: number
}

export const CloseIcon: React.FC<CloseIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="-0.5 -0.5 16 16" fill="none" stroke="currentColor" strokeWidth="1" strokeMiterlimit="10" className={className}>
      <path d="M0.9375 7.5a6.5625 6.5625 0 1 0 13.125 0 6.5625 6.5625 0 1 0 -13.125 0" />
      <path d="m10.48125 4.518750000000001 -5.9624999999999995 5.9624999999999995" />
      <path d="m4.518750000000001 4.518750000000001 5.9624999999999995 5.9624999999999995" />
    </svg>
  )
}

export default CloseIcon