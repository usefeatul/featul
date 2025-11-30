import React from 'react'

interface PlannedIconProps {
  className?: string
  size?: number
  color?: string
}

export const PlannedIcon: React.FC<PlannedIconProps> = ({ className = '', size = 18, color = '#f59e0b' }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className} opacity={0.8} style={{ color }}>
      <title>planned</title>
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity={1} />
      <rect x="8" y="9" width="8" height="6" rx="1.5" fill="none" stroke="#000" strokeWidth="1.5" />
      <path d="M10 8.5 V9.5 M14 8.5 V9.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.5 11 H14.5 M9.5 13 H13" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default PlannedIcon
