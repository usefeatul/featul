import React from "react"

type JsonLdProps = {
  id?: string
  data: Record<string, unknown>
}

export function JsonLd({ id, data }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // Server-rendered JSON-LD for better SEO; no client runtime dependency.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export default JsonLd