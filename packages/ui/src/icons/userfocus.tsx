import React from "react";

export function UserFocusIcon(props: React.SVGProps<SVGSVGElement>) {
    const { width = 24, height = 24, ...rest } = props;
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width={width}
            height={height}
            viewBox="0 0 24 24"
            {...rest}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5 4C4.44772 4 4 4.44772 4 5V9H2V5C2 3.34315 3.34315 2 5 2H9V4H5Z"
                fill="currentColor"
            ></path>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15 2H19C20.6569 2 22 3.34315 22 5V9H20V5C20 4.44772 19.5523 4 19 4H15V2Z"
                fill="currentColor"
            ></path>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M22 15V19C22 20.6569 20.6569 22 19 22H15V20H19C19.5523 20 20 19.5523 20 19V15H22Z"
                fill="currentColor"
            ></path>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4 15V19C4 19.5523 4.44772 20 5 20H9V22H5C3.34315 22 2 20.6569 2 19V15H4Z"
                fill="currentColor"
            ></path>
            <path
                d="M9.20506 15.2816L7.73037 15.7042C7.70308 15.712 7.67601 15.7203 7.64918 15.729C6.07351 16.2413 7.34316 18 9.00001 18H15C16.6569 18 17.9265 16.2413 16.3508 15.729C16.324 15.7203 16.2969 15.712 16.2697 15.7042L14.795 15.2816C14.0995 15.0872 13.62 15.0214 13.62 14.3138V13.4341C14.2459 13.0148 14.6971 12.3567 14.8295 11.5794L15.1586 9.64773C15.4839 7.73824 13.9787 6 12 6C10.0213 6 8.51614 7.73824 8.84144 9.64773L9.17052 11.5794C9.30294 12.3567 9.75416 13.0148 10.38 13.4341V14.3138C10.38 15.0214 9.90053 15.0872 9.20506 15.2816Z"
                fill="currentColor"
            ></path>
        </svg>
    );
}

export default UserFocusIcon;
