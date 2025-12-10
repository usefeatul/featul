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
        d="M12.164,2c-1.195,.015-2.324,.49-3.164,1.306-.84-.815-1.972-1.291-3.178-1.306-2.53,.015-4.582,2.084-4.572,4.609,0,5.253,5.306,8.429,6.932,9.278,.256,.133,.537,.2,.818,.2s.562-.067,.817-.2c1.626-.848,6.933-4.024,6.933-9.275,.009-2.528-2.042-4.597-4.586-4.612Z"
        fill="currentColor"

      ></path>
    </svg>
  );
}
