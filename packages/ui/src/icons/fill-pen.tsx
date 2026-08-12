import React from "react";

interface FillPenIconProps {
  className?: string;
  size?: number;
}

export const FillPenIcon: React.FC<FillPenIconProps> = ({
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
      <path
        d="M13.22 2.28a1.75 1.75 0 0 1 2.475 0l.025.025a1.75 1.75 0 0 1 0 2.475L7.06 13.44a2 2 0 0 1-.94.51l-3.12.78a.75.75 0 0 1-.91-.91l.78-3.12a2 2 0 0 1 .51-.94L13.22 2.28Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default FillPenIcon;
