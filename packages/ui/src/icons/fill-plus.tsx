import React from "react";

interface FillPlusIconProps {
  className?: string;
  size?: number;
}

export const FillPlusIcon: React.FC<FillPlusIconProps> = ({
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
        d="M13.25,2H4.75c-1.517,0-2.75,1.233-2.75,2.75V13.25c0,1.517,1.233,2.75,2.75,2.75H13.25c1.517,0,2.75-1.233,2.75-2.75V4.75c0-1.517-1.233-2.75-2.75-2.75Zm-1,7.75h-2.5v2.5c0,.414-.336,.75-.75,.75s-.75-.336-.75-.75v-2.5h-2.5c-.414,0-.75-.336-.75-.75s.336-.75,.75-.75h2.5v-2.5c0-.414,.336-.75,.75-.75s.75,.336,.75,.75v2.5h2.5c.414,0,.75,.336,.75,.75s-.336,.75-.75,.75Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default FillPlusIcon;
