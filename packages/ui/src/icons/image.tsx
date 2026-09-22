import React from "react"

interface ImageIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  opacity?: number
}

export const ImageIcon: React.FC<ImageIconProps> = ({
  className = "",
  size = 18,
  opacity = 1,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      opacity={opacity}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M13.194,8.384c-1.072-1.072-2.816-1.072-3.889,0L3.196,14.494c.367,.457,.923,.756,1.554,.756H13.25c1.105,0,2-.896,2-2v-2.811l-2.056-2.056Z"
        fill="currentColor"
        stroke="none"
      />
      <circle
        cx="6.25"
        cy="7.25"
        r="1.25"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M13.25,16H4.75c-1.517,0-2.75-1.233-2.75-2.75V4.75c0-1.517,1.233-2.75,2.75-2.75H13.25c1.517,0,2.75,1.233,2.75,2.75V13.25c0,1.517-1.233,2.75-2.75,2.75ZM4.75,3.5c-.689,0-1.25,.561-1.25,1.25V13.25c0,.689,.561,1.25,1.25,1.25H13.25c.689,0,1.25-.561,1.25-1.25V4.75c0-.689-.561-1.25-1.25-1.25H4.75Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
}

export default ImageIcon
