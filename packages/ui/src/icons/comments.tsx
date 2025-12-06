import React from "react";

interface CommentsIconProps {
  className?: string;
  size?: number;
}

export const CommentsIcon: React.FC<CommentsIconProps> = ({
  className = "",
  size = 18,
}) => {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   // width="24"
    //   // height="24"
    //   viewBox="0 0 26 26"

    //   width={size}
    //   height={size}
    //   // viewBox="0 0 18 18"
    //   // opacity={0.4}
    //   fill="none"
    //   stroke="currentColor"
    //   strokeWidth="2"
    //   strokeLinecap="round"
    //   strokeLinejoin="round"
    //   className="lucide lucide-messages-square-icon lucide-messages-square"
    // >
    //   <path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    //   <path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1" />
    // </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
    </svg>
  );
};

export default CommentsIcon;
