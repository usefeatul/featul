import React from "react";

interface FillCommentIconProps {
  className?: string;
  size?: number;
}

export const FillCommentIcon: React.FC<FillCommentIconProps> = ({
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
      fill="currentColor"
    >
      <path d="M9,1C4.589,1,1,4.589,1,9c0,1.396,.371,2.776,1.062,3.971,.238,.446-.095,2.002-.842,2.749-.209,.209-.276,.522-.17,.798,.106,.276,.365,.465,.66,.481,.079,.004,.16,.006,.241,.006,1.145,0,2.535-.407,3.44-.871,.675,.343,1.39,.587,2.131,.728,.484,.092,.982,.138,1.478,.138,4.411,0,8-3.589,8-8S13.411,1,9,1Zm-3.5,9c-.552,0-1-.449-1-1s.448-1,1-1,1,.449,1,1-.448,1-1,1Zm3.5,0c-.552,0-1-.449-1-1s.448-1,1-1,1,.449,1,1-.448,1-1,1Zm3.5,0c-.552,0-1-.449-1-1s.448-1,1-1,1,.449,1,1-.448,1-1,1Z" />
    </svg>
  );
};

export default FillCommentIcon;
