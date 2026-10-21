import type { ReactNode } from "react";
import Link from "next/link";
import {
  modalCardInnerClass,
  modalCardShellClass,
} from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
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
    <article
      className={cn(modalCardShellClass, "group flex min-w-0 flex-col")}
    >
      <header className="flex items-center justify-between gap-3 px-2.5 py-1.5">
        <h3 className="text-sm font-medium leading-6 text-foreground">
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
      </header>
      <div className={cn(modalCardInnerClass, "flex flex-1 flex-col")}>
        <div className="relative h-[380px] sm:h-[400px]">
          <BentoTexture tone={tone} />
          <div className="absolute inset-0 flex items-center justify-center px-4 py-5 sm:px-5">
            {children}
          </div>
        </div>
        <p className="flex-1 border-t border-border/40 px-5 py-4 text-sm leading-6 text-accent">
          {body}
        </p>
      </div>
    </article>
  );
}
