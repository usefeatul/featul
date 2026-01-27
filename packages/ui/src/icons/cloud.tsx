import React from 'react'

type CloudIconProps = React.SVGProps<SVGSVGElement> & { opacity?: number }

export function CloudIcon({ width = 18, height = 18, opacity = 1, ...rest }: CloudIconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 18 18" {...rest}>
            <path d="M14.157 6.326C12.633 5.724 10.7083 6 9.12499 7.3958C9.37499 6.125 11.4118 4.5058 13.523 4.608C12.61 3.047 10.922 2 9.02899 2C6.14399 2 3.79799 4.355 3.79799 7.25C3.79799 7.375 3.80299 7.5 3.81399 7.627C2.16899 8.045 0.96499 9.561 1.00199 11.334C1.02299 12.334 1.43099 13.265 2.14999 13.958C2.84999 14.632 3.76299 15 4.71499 15H12.516C14.989 15 17 12.982 17 10.499C16.997 8.64 15.869 7.003 14.157 6.326Z" fill="currentColor" fillOpacity={opacity} />
        </svg>
    )
}

export default CloudIcon
