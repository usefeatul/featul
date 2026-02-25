import React from "react";

interface MoveVerticalIconProps {
  className?: string;
  size?: number;
}

export const MoveVerticalIcon: React.FC<MoveVerticalIconProps> = ({
  className = "",
  size = 18,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      className={className}
    >
      <path d="M9 2.5L13.7 7.2H4.3L9 2.5Z" fill="currentColor" />
      <rect
        x="7.2"
        y="6.2"
        width="3.6"
        height="5.6"
        rx="1.8"
        fill="currentColor"
      />
      <path d="M9 15.5L4.3 10.8H13.7L9 15.5Z" fill="currentColor" />
    </svg>
  );
};

export default MoveVerticalIcon;
