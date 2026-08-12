import React from "react";

interface FillFeedbackIconProps {
  className?: string;
  size?: number;
}

/** Filled square message bubble (no face / smile). */
export const FillFeedbackIcon: React.FC<FillFeedbackIconProps> = ({
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
        d="M3.75,1.5c-1.517,0-2.75,1.233-2.75,2.75V11c0,1.517,1.233,2.75,2.75,2.75h.5v2.043c0,.297,.163,.571,.425,.711,.111,.059,.232,.089,.353,.089,.171,0,.341-.055,.482-.163l3.278-2.68h6.712c1.517,0,2.75-1.233,2.75-2.75V4.25c0-1.517-1.233-2.75-2.75-2.75H3.75Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default FillFeedbackIcon;
