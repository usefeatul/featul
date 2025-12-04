import React from "react";

interface CommentsIconProps {
  className?: string;
  size?: number;
}

export function LoveIcon(props: CommentsIconProps) {
  const { className, size = 18, ...rest } = props;
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   width={width}
    //   height={height}
    //   viewBox="0 0 18 18"
    //   {...rest}
    // >
    //   <path
    //     d="M8.999 16.0874C8.7187 16.0874 8.43849 16.0205 8.18259 15.8872C6.55659 15.0381 1.25101 11.8603 1.25101 6.6089C1.24121 4.0845 3.292 2.0156 5.8223 2C7.0284 2.0151 8.1592 2.4902 9 3.3057C9.8398 2.4903 10.9678 2.0152 12.1631 2C14.708 2.0156 16.7588 4.0845 16.749 6.6118C16.749 11.8618 11.4433 15.0386 9.81641 15.8872C9.56051 16.0205 9.2803 16.0874 8.999 16.0874Z"
    //     fill="currentColor"
    //     fillOpacity="0.4"
    //   ></path>
    // </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...rest}
    >
      {" "}
      <path
        d="M11.992 21L15.189 18.621C16.318 17.781 20.115 14.74 21.598 10.876C22.726 7.93696 21.354 4.60196 18.535 3.42596C16.125 2.41996 13.43 3.32096 11.997 5.44496C10.564 3.32196 7.86904 2.41996 5.45904 3.42596C2.63904 4.60196 1.26704 7.93696 2.39604 10.876C3.87904 14.74 7.67604 17.781 8.80504 18.621L11.992 21Z"
        stroke="#1c1f21"
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="square"
        fill="none"
      ></path>{" "}
    </svg>
  );
}


