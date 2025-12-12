import React from "react";

export function ChartIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 24, height = 24, ...rest } = props;
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   x="0px"
    //   y="0px"
    //   width={width}
    //   height={height}
    //   viewBox="0 0 18 18"
    //   {...rest}
    // >
    //   <path
    //     d="M2.60518 13.1674C3.69058 10.7157 6.14168 9 8.99999 9C11.7634 9 14.1462 10.6037 15.2822 12.9257C15.3564 13.0774 15.4289 13.2326 15.4797 13.3894C15.8649 14.5805 15.1811 15.8552 13.9874 16.2313C12.705 16.6354 11.0072 17 8.99999 17C6.99283 17 5.29503 16.6354 4.01259 16.2313C2.74425 15.8317 2.05162 14.4186 2.60518 13.1674Z"
    //     fill="currentColor"
    //   ></path>{" "}
    //   <path
    //     d="M9 7.50049C10.7952 7.50049 12.25 6.04543 12.25 4.25049C12.25 2.45554 10.7952 1.00049 9 1.00049C7.20482 1.00049 5.75 2.45554 5.75 4.25049C5.75 6.04543 7.20482 7.50049 9 7.50049Z"
    //     fill="currentColor"
    //     data-color="color-2"
    //   ></path>
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
      <rect
        x="12.5"
        y="2"
        width="4"
        height="14"
        rx="1.75"
        ry="1.75"
        fill="currentColor"
      ></rect>
      <rect
        x="7"
        y="7"
        width="4"
        height="9"
        rx="1.75"
        ry="1.75"
        fill="currentColor"
      ></rect>
      <rect
        x="1.5"
        y="11"
        width="4"
        height="5"
        rx="1.75"
        ry="1.75"
        fill="currentColor"
      ></rect>
      <path
        d="M2.75,9.5c.192,0,.384-.073,.53-.22l4.72-4.72v.689c0,.414,.336,.75,.75,.75s.75-.336,.75-.75V2.75c0-.414-.336-.75-.75-.75h-2.5c-.414,0-.75,.336-.75,.75s.336,.75,.75,.75h.689L2.22,8.22c-.293,.293-.293,.768,0,1.061,.146,.146,.338,.22,.53,.22Z"
        fill="currentColor"
        data-color="color-2"
      ></path>
    </svg>
  );
}

export default ChartIcon;
