"use client";
import Link from "next/link";
import { Button } from "@featul/ui/components/button";
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
  ctaLabel = "Sign up for featul",
  subtext = "Free to start, no cc required",
}: PromoCardProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-md border border-border/60 bg-card px-3 py-3">
        <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-1.5 text-xs leading-5 text-accent">{description}</p>
        <div className="mt-3">
          <Button
            asChild
            variant="default"
            size="sm"
            className="w-full font-heading text-xs shadow-none"
          >
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-accent/75">{subtext}</p>
      </div>
    </div>
  );
}
