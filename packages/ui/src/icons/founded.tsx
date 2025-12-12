import React from "react";

export function FoundedIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 18, height = 18, ...rest } = props;
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   width={width}
    //   height={height}
    //   viewBox="0 0 18 18"
    //   {...rest}
    // >
    //   <title>graduation-cap</title>
    //   <g fill="none" stroke="currentColor">
    //     <path
    //       d="M9.45801 2.361L15.79 5.621C16.403 5.937 16.403 6.813 15.79 7.129L9.45801 10.389C9.17001 10.537 8.829 10.537 8.542 10.389L2.20999 7.129C1.59699 6.813 1.59699 5.937 2.20999 5.621L8.542 2.361C8.83 2.213 9.17101 2.213 9.45801 2.361Z"
    //       strokeWidth={1.5}
    //       strokeLinecap="round"
    //       strokeLinejoin="round"
    //     ></path>
    //     <path
    //       d="M16.25 6.375C16.079 7.115 15.932 8.097 15.969 9.25C15.996 10.084 16.113 10.812 16.25 11.406"
    //       strokeWidth={1.5}
    //       strokeLinecap="round"
    //       strokeLinejoin="round"
    //     ></path>
    //     <path
    //       d="M4.25 11.5535V14C4.25 15.104 6.377 16 9 16C11.623 16 13.75 15.104 13.75 14V11.5535"
    //       strokeWidth={1.5}
    //       strokeLinecap="round"
    //       strokeLinejoin="round"
    //     ></path>
    //   </g>
    // </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={width}
      height={height}
      viewBox="0 0 18 18"
      {...rest}
    >
      <path
        d="M10.488,12.39c-.459,.236-.974,.36-1.488,.36s-1.031-.125-1.489-.361l-4.011-2.064v3.676c0,1.805,2.767,2.75,5.5,2.75s5.5-.945,5.5-2.75v-3.676l-4.012,2.065Z"
        fill="currentColor"
        data-color="color-2"
      ></path>
      <path
        d="M16.719,9.226c-.026-.806,.056-1.611,.216-2.402,.018-.13,.065-.191,.065-.449,0-.601-.332-1.146-.866-1.421L9.802,1.694c-.502-.259-1.102-.258-1.604,0L1.866,4.955c-.534,.275-.866,.819-.866,1.42s.332,1.146,.866,1.421l6.332,3.259c.251,.129,.526,.194,.802,.194s.551-.065,.802-.194l5.451-2.806c-.019,.341-.045,.682-.034,1.024,.024,.772,.126,1.546,.301,2.301,.08,.347,.389,.581,.729,.581,.057,0,.113-.006,.17-.02,.403-.093,.655-.496,.562-.899-.152-.66-.241-1.336-.262-2.011Z"
        fill="currentColor"
      ></path>
    </svg>
  );
}

export default FoundedIcon;
