import Script from "next/script";
import { serializeJsonLd } from "@/lib/security";
import { buildFaqPageSchema } from "@/lib/structured-data";

export type FaqItem = { q: string; a: string };

export default function FaqJsonLd({ faqs }: { faqs: FaqItem[] }) {
  const data = buildFaqPageSchema(faqs);

  return (
    <Script
      id="schema-faq"
      type="application/ld+json"
      strategy="afterInteractive"
    >
      {serializeJsonLd(data)}
    </Script>
  );
}
