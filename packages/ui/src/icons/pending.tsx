import React from 'react'

interface PendingIconProps {
  className?: string
  size?: number
  color?: string
}

export const PendingIcon: React.FC<PendingIconProps> = ({ className = '', size = 18, color = '#9ca3af' }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className} opacity={0.7} style={{ color }}>
      <title>pending</title>
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity={1} />
      <path d="M12 6 L12 12 L16 14" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default PendingIcon
