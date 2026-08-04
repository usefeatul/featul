import { serializeJsonLd } from "@/lib/security";
import { buildFaqPageSchema } from "@/lib/schema";

export type FaqItem = { q: string; a: string };

export default function FaqJsonLd({ faqs }: { faqs: FaqItem[] }) {
  const data = buildFaqPageSchema(faqs);

  return (
    <script
      id="schema-faq"
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
