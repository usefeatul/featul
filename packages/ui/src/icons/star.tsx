import React from 'react'

export function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 24, height = 24, ...rest } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      role="img"
      {...rest}
    >
      <title>star</title>
      <polygon 
        points="12 2.245 15.039 8.403 21.836 9.39 16.918 14.185 18.079 20.954 12 17.759 5.921 20.954 7.082 14.185 2.164 9.39 8.961 8.403 12 2.245" 
        fill="currentColor"
      />
    </svg>
  )
}

export default StarIcon

