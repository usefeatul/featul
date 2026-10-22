"use client";
import Link from "next/link";
import { Button } from "@featul/ui/components/button";
import { modalCardInnerClass, modalCardShellClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

type PromoCardProps = {
  className?: string;
  title?: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
  subtext?: string;
};

export function PromoCard({
  className,
  title = "Featul, Simplified",
  description = "Stop guessing. Get actionable feedback, understand what users need, iterate faster, and ship with confidence.",
  ctaHref = "https://app.featul.com",
  ctaLabel = "Sign up for Featul",
  subtext = "Free to start, no cc required",
}: PromoCardProps) {
  return (
    <div className={cn("w-full", className)}>
      <section className={cn(modalCardShellClass, "flex min-w-0 flex-col")}>
        <header className="flex items-center px-2.5 py-1.5">
          <h3 className="text-sm font-medium leading-6 text-foreground">
            {title}
          </h3>
        </header>
        <div className={cn(modalCardInnerClass, "flex min-w-0 flex-col gap-4 px-4 py-4")}>
          <p className="text-sm leading-relaxed text-accent wrap-break-word">
            {description}
          </p>
          <div>
            <Button
              asChild
              variant="default"
              size="sm"
              className="w-full font-heading text-xs shadow-none"
            >
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
            <p className="mt-2 text-center text-[11px] text-accent/75">
              {subtext}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
