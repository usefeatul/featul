import React from "react"
import ReactMarkdown from "react-markdown"
import Image from "next/image"

type Props = {
  markdown: string
}

export default function LegalMarkdown({ markdown }: Props) {

  return (
    <ReactMarkdown

      components={{
        a: ({ href, children }) => {
          const url = typeof href === "string" ? href : ""
          const isExternal = /^https?:\/\//.test(url)
          return (
            <a
              href={url}
              className="text-primary"
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer nofollow" : undefined}
            >
              {children}
            </a>
          )
        },
        img: ({ src, alt }) => {
          const url = typeof src === "string" ? src : ""
          return (
            <Image
              src={url}
              alt={(typeof alt === "string" ? alt : undefined) ?? ""}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          )
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  )
}
