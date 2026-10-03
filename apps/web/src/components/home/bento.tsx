import type { ReactNode } from "react";
import Link from "next/link";
import { BentoTexture, type BentoTone } from "./texture";

export function BentoCard({
  title,
  body,
  href,
  tone,
  children,
}: {
  title: string;
  body: string;
  href?: string;
  tone: BentoTone;
  children: ReactNode;
}) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_2px_4px_rgba(0,0,0,0.03),0_8px_20px_-12px_rgba(0,0,0,0.12)]">
      <div
        aria-hidden
        inert
        className="pointer-events-none relative min-h-[280px] sm:min-h-[292px]"
      >
        <BentoTexture tone={tone} />
        <div className="relative flex min-h-[280px] items-center sm:min-h-[292px] justify-center px-4 py-5 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:-translate-y-1 sm:px-6">
          {children}
        </div>
      </div>
      <div className="flex flex-1 flex-col px-6 pb-7 pt-2 sm:px-7">
        <h3 className="font-heading text-xl font-medium tracking-tight text-foreground">
          {href ? (
            <Link
              href={href}
              className="rounded-sm underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        <p className="mt-2 text-sm leading-6 text-accent">{body}</p>
      </div>
    </article>
  );
}
