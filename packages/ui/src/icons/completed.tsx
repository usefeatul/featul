import React from 'react'

interface CompleteIconProps {
  className?: string
  size?: number
  color?: string
}

export const CompletedIcon: React.FC<CompleteIconProps> = ({ className = '', size = 18, color = '#22c55e' }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className} opacity={0.8} style={{ color }}>
      <title>completed</title>
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity={1} />
      <path d="m9 12 2 2 4-4" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default CompletedIcon
