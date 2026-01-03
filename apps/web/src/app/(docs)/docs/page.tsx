import type { Metadata } from "next";
import { DocsLayoutShell } from "@/components/docs/docs-layout";
import { Prose } from "@/components/blog/prose";
import { cn } from "@featul/ui/lib/utils";
import { TableOfContents } from "@/components/blog/table-of-contents";
import type { TocItem } from "@/lib/toc";

export const metadata: Metadata = {
  title: "Install Visitors on Next.js",
  description:
    "Learn how to install the tracking snippet in a Next.js App Router project.",
};

const tocItems: TocItem[] = [
  {
    id: "using-the-root-layout",
    text: "Using the root Layout",
    level: 2,
  },
];

export default function DocsIndexPage() {
  return (
    <DocsLayoutShell
      rightColumn={
        <TableOfContents
          title="On this page"
          items={tocItems}
          className="text-xs"
        />
      }
    >
      <section>
        <div className="max-w-2xl lg:max-w-3xl space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-accent">
              Installation
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              Install Visitors on Next.js
            </h1>
            <p className="text-sm sm:text-base text-accent max-w-xl">
              For this guide, we will strictly be referring to Next.js App
              Router (v13+).
            </p>
          </div>

          <div className="rounded-md border border-dashed border-border bg-muted px-4 py-3 text-xs sm:text-sm text-accent">
            Replace{" "}
            <span className="font-mono text-sm sm:text-xs bg-background rounded px-1 py-0.5 border border-border/60">
              YOUR_TOKEN
            </span>{" "}
            with your project token.
          </div>

          <div className="space-y-3">
            <h2
              id="using-the-root-layout"
              className={cn(
                "scroll-mt-32 text-base sm:text-lg font-semibold text-foreground"
              )}
            >
              Using the root Layout
            </h2>
            <p className="text-sm sm:text-base text-accent">
              When it comes to Next.js, the recommended way to add scripts to a
              project is using the root Layout file.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background/80 shadow-sm overflow-hidden">
            <div className="border-b border-border/60 bg-muted px-4 py-2 text-xs font-medium text-accent">
              layout.tsx
            </div>
            <div className="p-4 sm:p-5 bg-muted/50">
              <Prose className="prose-code:text-xs">
                <pre className="overflow-x-auto rounded-md bg-[#0f172a] p-4 text-xs leading-relaxed text-slate-100">
                  <code>
                    {`import Script from "next/script"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.visitors.com/v.js"
          data-token="YOUR_TOKEN"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}`}
                  </code>
                </pre>
              </Prose>
            </div>
          </div>
        </div>
      </section>
    </DocsLayoutShell>
  );
}
