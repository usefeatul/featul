import React from 'react'

export function StarPinIcon(props: React.SVGProps<SVGSVGElement>) {
    const { width = 24, height = 24, ...rest } = props

    // Pin SVG Path (Scaled down version of the 18x18 pin)
    // Simplified for small scale usage
    const MiniPin = (
        <path
            d="M5,9 C4.5,9 4,8.5 4,8 V4 C4,2.5 5,1.5 6.5,1.5 H9 C10.5,1.5 11.5,2.5 11.5,4 V8 C11.5,8.5 11,9 10.5,9 L10,9 L10,13 C10,13.5 9.5,14 9,14 C8.5,14 8,13.5 8,13 L8,9 L5,9 Z"
            transform="scale(0.35)"
            fill="currentColor"
        />
    )

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 18 18"
            fill="currentColor"
            {...rest}
        >
            <defs>
                <path id="mini-pin-path" d="M9,13.964c0-.863,.55-1.625,1.369-1.897l.55-.184,.184-.551c.267-.798,1.029-1.332,1.897-1.332,.359,0,.689,.11,.984,.273l2.789-2.718c.205-.199,.278-.498,.19-.769-.088-.271-.323-.469-.605-.51l-4.62-.671L9.672,1.418c-.252-.512-1.093-.512-1.345,0l-2.066,4.186-4.62c-.282.041-.517.239-.605.51-.088.271-.015.57.19.769l3.343,3.258-.79,4.601c-.048.282.067.566.298.734.232.167.537.19.79.057l4.132-2.173.012.006c0-.025-.012-.048-.012-.073Z" />
                <path id="simple-pin" d="M9,17c-.414,0-.75-.336-.75-.75v-4c0-.414,.336-.75,.75-.75s.75,.336,.75,.75v4c0-.414-.336,.75-.75,.75Z M13.929,8.997c-.266-.456-.578-.888-.929-1.288V3.75c0-1.517-1.233-2.75-2.75-2.75h-2.5c-1.517,0-2.75,1.233-2.75,2.75v3.959c-.352,.4-.663,.832-.929,1.288-.563,.965-.921,2.027-1.065,3.158-.027,.214,.039,.429,.181,.59,.143,.162,.348,.254,.563,.254H14.25c.215,0,.42-.093,.563-.254,.142-.162,.208-.376,.181-.59-.144-1.131-.502-2.193-1.065-3.158Z" />
            </defs>

            {/* Small Pin top-left (replacing small star) */}
            <g transform="translate(1, 1) scale(0.25)">
                <use href="#simple-pin" fill="currentColor" opacity="0.9" />
            </g>

            {/* Main Star Body (Keep existing) */}
            <path
                d="M9,13.964c0-.863,.55-1.625,1.369-1.897l.55-.184,.184-.551c.267-.798,1.029-1.332,1.897-1.332,.359,0,.689,.11,.984,.273l2.789-2.718c.205-.199,.278-.498,.19-.769-.088-.271-.323-.469-.605-.51l-4.62-.671L9.672,1.418c-.252-.512-1.093-.512-1.345,0l-2.066,4.186-4.62,.671c-.282,.041-.517,.239-.605,.51-.088,.271-.015,.57,.19,.769l3.343,3.258-.79,4.601c-.048,.282,.067,.566,.298,.734,.232,.167,.537,.19,.79,.057l4.132-2.173,.012,.006c0-.025-.012-.048-.012-.073Z"
                fill="currentColor"
            />

            {/* Small Pin bottom-right (replacing small star) */}
            <g transform="translate(13, 11) scale(0.25)">
                <use href="#simple-pin" fill="currentColor" opacity="0.9" />
            </g>

            {/* Small Circle (keep as magic dust) */}
            <circle cx="14.25" cy="3.25" r=".75" fill="currentColor" opacity="0.8" />
        </svg>
    )
}

export default StarPinIcon
