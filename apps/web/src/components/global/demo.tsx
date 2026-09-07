"use client";

import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { Button, type buttonVariants } from "@featul/ui/components/button";
import { LinkIcon } from "@featul/ui/icons/link";
import { cn } from "@featul/ui/lib/utils";
import { LIVE_DEMO_URL } from "@/config/auth";

type LiveDemoProps = {
  href?: string;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
};

export function LiveDemo({
  href = LIVE_DEMO_URL,
  className,
  variant = "nav",
}: LiveDemoProps) {
  return (
    <Button
      asChild
      variant={variant}
      size="lg"
      className={cn("font-light", className ?? "text-accent")}
    >
      <Link
        href={href}
        aria-label="View live demo"
        data-sln-event="cta: view live demo clicked"
      >
        View live demo
        <LinkIcon aria-hidden className="size-4" />
      </Link>
    </Button>
  );
}
