import { cn } from "@featul/ui/lib/utils";
import type { HTMLAttributes } from "react";

type ProseProps = HTMLAttributes<HTMLElement> & {
  as?: "article";
  html?: string;
};

export function Prose({ children, html, className }: ProseProps) {
  return (
    <article
      className={cn(
        "prose prose-sm max-w-none text-left prose-h1:font-bold prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-a:text-blue-600 prose-p:text-left prose-p:text-sm prose-li:text-sm prose-ul:text-left prose-ol:text-left prose-li:text-left prose-blockquote:text-left prose-figcaption:text-left prose-pre:text-left prose-img:mx-0 prose-figure:mx-0 prose-img:rounded-md prose-headings:font-normal prose-h2:scroll-mt-28 prose-h3:scroll-mt-28 prose-table:my-0 prose-thead:border-0 prose-th:py-2 prose-th:px-3 prose-td:py-2 prose-td:px-3 prose-table:border-0",
        className
      )}
      data-component="BlogProse"
    >
      {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : children}
    </article>
  );
}
