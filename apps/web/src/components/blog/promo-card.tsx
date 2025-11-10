"use client";
import Link from "next/link";
import { Button } from "@feedgot/ui/components/button";
import { cn } from "@feedgot/ui/lib/utils";

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
  title = "Feedgot, Simplified",
  description = "Stop guessing. Get actionable feedback understand what users need, iterate faster, and ship with confidence.",
  ctaHref = "/signup",
  ctaLabel = "Sign up for Feedgot",
  subtext = "free to start, no cc required",
}: PromoCardProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-md bg-primary/10 p-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-accent leading-5">{description}</p>
        <div className="mt-2">
          <Button asChild className="w-full">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-accent">{subtext}</p>
    </div>
  );
}
