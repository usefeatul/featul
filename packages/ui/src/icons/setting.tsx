import React from 'react'

interface SettingIconProps {
  className?: string
  size?: number
}

export const SettingIcon: React.FC<SettingIconProps> = ({ className = '', size = 18 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      className={className}
    >
      <title>gear-2</title>
      <g fill="#212121">
        <path d="M9 14.5C12.0376 14.5 14.5 12.0376 14.5 9C14.5 5.96243 12.0376 3.5 9 3.5C5.96243 3.5 3.5 5.96243 3.5 9C3.5 12.0376 5.96243 14.5 9 14.5Z" fill="#212121" fillOpacity="0.3" stroke="none"></path>
        <path d="M6.25 4.237L9 9" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M6.25 13.764L9 9" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M14.5 9H9" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M9 14.5C12.0376 14.5 14.5 12.0376 14.5 9C14.5 5.96243 12.0376 3.5 9 3.5C5.96243 3.5 3.5 5.96243 3.5 9C3.5 12.0376 5.96243 14.5 9 14.5Z" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M9 1.75V3.5" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M2.72101 5.375L4.23701 6.25" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M1.75 9H3.5" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M16.25 9H14.5" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M2.72101 12.625L4.23701 11.75" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M9 16.25V14.5" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M12.625 15.279L11.75 13.763" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M5.375 15.279L6.25 13.763" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M15.279 12.625L13.763 11.75" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M15.279 5.375L13.763 6.25" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M12.625 2.721L11.75 4.237" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        <path d="M5.375 2.721L6.25 4.237" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
      </g>
    </svg>
  )
}

export default SettingIcon