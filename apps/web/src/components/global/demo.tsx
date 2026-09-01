"use client";

import Link from "next/link";
import { Button } from "@featul/ui/components/button";
import { LinkIcon } from "@featul/ui/icons/link";
import { cn } from "@featul/ui/lib/utils";
import { LIVE_DEMO_URL } from "@/config/auth";

type LiveDemoProps = {
  href?: string;
  className?: string;
};

export function LiveDemo({ href = LIVE_DEMO_URL, className }: LiveDemoProps) {
  return (
    <Button
      asChild
      variant="nav"
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
