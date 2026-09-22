import { parsePostContentLinks } from "@/lib/post/links"

export function Linkify({ content }: { content: string }) {
  return parsePostContentLinks(content).map((segment, index) =>
    segment.type === "link" ? (
      <a
        key={`${segment.href}-${index}`}
        href={segment.href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
      >
        {segment.value}
      </a>
    ) : (
      segment.value
    )
  )
}
