import Script from "next/script"
import { getUseCaseHowToJsonLd } from "@/config/seo"
import { serializeJsonLd } from "@/lib/security";

export function UseCaseHowToJsonLd() {
  const data = getUseCaseHowToJsonLd()

  return (
    <Script id="schema-howto-product-feedback" type="application/ld+json" strategy="afterInteractive">
      {serializeJsonLd(data)}
    </Script>
  )
}

