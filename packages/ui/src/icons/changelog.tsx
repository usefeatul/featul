import React from 'react'

interface ChangelogIconProps {
  className?: string
  size?: number
}

export const ChangelogIcon: React.FC<ChangelogIconProps> = ({ className = '', size = 18 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      className={className}
    >
      <title>folder</title>
      <g fill="#212121">
        <path d="M1.5 6.5H16.5V13.25C16.5 14.7692 15.2692 16 13.75 16H4.25C2.73079 16 1.5 14.7692 1.5 13.25V6.5Z" fill="#212121" fillOpacity="0.4"></path>
        <path d="M4.25 2C2.73079 2 1.5 3.23079 1.5 4.75V6.5H16.5V6.25C16.5 4.73079 15.2692 3.5 13.75 3.5H8.72395L8.34569 3.02827C7.82347 2.37825 7.03552 2 6.201 2H4.25Z" fill="#212121"></path>
      </g>
    </svg>
  )
}

export default ChangelogIcon