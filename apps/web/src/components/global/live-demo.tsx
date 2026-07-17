"use client";

import Link from "next/link";
import { Button } from "@featul/ui/components/button";
import { LinkIcon } from "@featul/ui/icons/link";

type LiveDemoProps = {
  href?: string;
  className?: string;
};

const LIVE_DEMO_URL = process.env.NEXT_PUBLIC_LIVE_DEMO_URL;

export function LiveDemo({ href = LIVE_DEMO_URL, className }: LiveDemoProps) {
  return (
    <Button asChild variant="nav" size="lg" className={className ?? "text-accent"}>
      <Link href={href ?? "https://app.featul.com"} aria-label="View live demo" data-sln-event="cta: view live demo clicked">
        View live demo
        <LinkIcon aria-hidden className="size-4" />
      </Link>
    </Button>
  );
}