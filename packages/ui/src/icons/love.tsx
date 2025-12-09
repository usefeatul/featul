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
      viewBox="0 0 18 18"
    >
      <path
        d="M8.529,15.222c.297,.155,.644,.155,.941,0,1.57-.819,6.529-3.787,6.529-8.613,.008-2.12-1.704-3.846-3.826-3.859-1.277,.016-2.464,.66-3.173,1.72-.71-1.06-1.897-1.704-3.173-1.72-2.123,.013-3.834,1.739-3.826,3.859,0,4.826,4.959,7.794,6.529,8.613Z"
        fill="none"
        stroke="#1c1f21"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      ></path>
    </svg>
  );
}
