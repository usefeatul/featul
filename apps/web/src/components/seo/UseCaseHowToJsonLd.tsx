import Script from "next/script"
import { getUseCaseHowToJsonLd } from "@/config/seo"

export function UseCaseHowToJsonLd() {
  const data = getUseCaseHowToJsonLd()

  return (
    <Script id="schema-howto-product-feedback" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(data)}
    </Script>
  )
}

