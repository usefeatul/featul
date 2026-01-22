import React from 'react'
import { cn } from "@featul/ui/lib/utils"

interface ChangelogPublishedIconProps {
    className?: string
    size?: number
}

export const ChangelogPublishedIcon: React.FC<ChangelogPublishedIconProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={cn(className)}
        >
            {/* File document base filled with light gray */}
            <path
                d="M18.987 7.927l-4.914-4.914C13.742 2.682 13.303 2.5 12.836 2.5H6.25C4.733 2.5 3.5 3.733 3.5 5.25v12.5c0 1.517 1.233 2.75 2.75 2.75h10.5c1.517 0 2.75-1.233 2.75-2.75V9.164c0-.467-.182-.907-.513-1.237zM7.25 8.5h2.5c.414 0 .75.336.75.75s-.336.75-.75.75h-2.5c-.414 0-.75-.336-.75-.75s.336-.75.75-.75zm8.125 9.375h-8.125c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h8.125c.414 0 .75.336.75.75s-.336.75-.75.75zm0-3.75h-8.125c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h8.125c.414 0 .75.336.75.75s-.336.75-.75.75zm1.057-5h-3.182c-.55 0-1-.45-1-1V5.079l.013-.005 4.172 4.046-.003.005z"
                fill="#C4C8CC"
            />
            {/* Green check circle - positioned bottom-right with white mask */}

            {/* Mask/Cutout stroke */}
            <circle cx="18.5" cy="18.5" r="4.5" fill="none" stroke="var(--background, white)" strokeWidth="3" />

            {/* Actual icon */}
            <circle cx="18.5" cy="18.5" r="4.5" fill="#22c55e" />
            <path
                d="M16.25 18.5l1.25 1.25 2.5-2.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    )
}

export default ChangelogPublishedIcon
