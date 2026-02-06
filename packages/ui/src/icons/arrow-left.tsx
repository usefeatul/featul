import React from "react"

interface ArrowLeftIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string
}

export const ArrowLeftIcon: React.FC<ArrowLeftIconProps> = ({ size = 18, className, ...props }) => {
    return (
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
            {...props}
        >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
        </svg>
    )
}

export default ArrowLeftIcon
