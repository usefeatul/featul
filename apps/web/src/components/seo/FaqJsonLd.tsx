import Script from "next/script"
import { serializeJsonLd } from "@/lib/security";

export type FaqItem = { q: string; a: string }

export default function FaqJsonLd({ faqs }: { faqs: FaqItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  }
  return (
    <Script id="schema-faq" type="application/ld+json" strategy="afterInteractive">
      {serializeJsonLd(data)}
    </Script>
  )
}