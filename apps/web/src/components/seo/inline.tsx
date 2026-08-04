import { serializeJsonLd } from "@/lib/security";

type Props = {
  id: string;
  data: unknown;
};

/** Server-rendered JSON-LD for reliable crawler visibility. */
export function InlineJsonLd({ id, data }: Props) {
  return (
    <script
      id={id}
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
