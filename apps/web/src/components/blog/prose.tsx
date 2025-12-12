import { cn } from "@oreilla/ui/lib/utils";
import type { HTMLAttributes } from "react";

type ProseProps = HTMLAttributes<HTMLElement> & {
  as?: "article";
  html?: string;
};

export function Prose({ children, html, className }: ProseProps) {
  return (
    <article
      className={cn(
        "prose max-w-none text-left prose-h1:font-bold prose-h1:text-xl prose-a:text-blue-600 prose-p:text-left prose-p:text-md prose-li:text-md prose-ul:text-left prose-ol:text-left prose-li:text-left prose-blockquote:text-left prose-figcaption:text-left prose-pre:text-left prose-table:text-left prose-img:mx-0 prose-figure:mx-0 prose-img:rounded-md prose-headings:font-normal prose-h2:scroll-mt-28 prose-h3:scroll-mt-28",
        className
      )}
      data-component="BlogProse"
    >
      {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : children}
    </article>
  );
}
