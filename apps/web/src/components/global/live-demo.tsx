"use client";

import Link from "next/link";
import { Button } from "@oreilla/ui/components/button";
import { LinkIcon } from "@oreilla/ui/icons/link";

type LiveDemoProps = {
  href?: string;
  className?: string;
};

const LIVE_DEMO_URL = process.env.NEXT_PUBLIC_LIVE_DEMO_URL;

export function LiveDemo({ href = LIVE_DEMO_URL, className }: LiveDemoProps) {
  return (
    <Button asChild variant="nav" size="lg" className={className ?? "text-accent"}>
      <Link href={href ?? "https://app.oreilla.com"} aria-label="View live demo" data-sln-event="cta: view live demo clicked">
        View live demo
        <LinkIcon aria-hidden className="size-4" />
      </Link>
    </Button>
  );
}