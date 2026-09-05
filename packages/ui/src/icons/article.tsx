import React from "react"

interface ArticleIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const ArticleIcon: React.FC<ArticleIconProps> = ({
  className = "",
  size = 18,
  opacity = 1,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      opacity={opacity}
      className={className}
    >
      <title>article</title>
      <path
        d="M5.25 15.25h7.5c1.105 0 2-.895 2-2V6.664c0-.265-.105-.52-.293-.707L11.043 2.543A1 1 0 0 0 10.336 2.25H5.25c-1.105 0-2 .895-2 2v9c0 1.105.895 2 2 2Z"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
      />
      <path
        d="M5.25 15.25h7.5c1.105 0 2-.895 2-2V6.664c0-.265-.105-.52-.293-.707L11.043 2.543A1 1 0 0 0 10.336 2.25H5.25c-1.105 0-2 .895-2 2v9c0 1.105.895 2 2 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M10.25 2.75v3c0 1.105.895 2 2 2h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="origin-top-left transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:scale-90"
      />
      <path
        d="M6.25 10.25h5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="origin-left transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:scale-x-90"
      />
      <path
        d="M6.25 13h3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="origin-left transition-transform duration-300 delay-75 ease-[cubic-bezier(.2,.0,0,1)] group-hover:scale-x-75"
      />
    </svg>
  )
}

export default ArticleIcon
