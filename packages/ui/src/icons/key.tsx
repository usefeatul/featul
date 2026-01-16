import React from "react";

export function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
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
                d="m18,1l-7.323,7.323c-.689-.209-1.419-.323-2.177-.323-4.142,0-7.5,3.358-7.5,7.5s3.358,7.5,7.5,7.5,7.5-3.358,7.5-7.5c0-1.033-.209-2.017-.587-2.913l2.587-2.587v-3h3l2-2V1h-5Zm-10,17c-1.103,0-2-.897-2-2s.897-2,2-2,2,.897,2,2-.897,2-2,2Z"
                strokeWidth="0"
                fill="currentColor"
            ></path>
        </svg>
    );
}

export default KeyIcon;
