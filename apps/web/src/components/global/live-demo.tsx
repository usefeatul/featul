"use client";

import Link from "next/link";
import { Button } from "@feedgot/ui/components/button";
import { LinkIcon } from "@feedgot/ui/icons/link";

type LiveDemoProps = {
  href?: string;
  className?: string;
};

const LIVE_DEMO_URL = process.env.NEXT_PUBLIC_LIVE_DEMO_URL;

export function LiveDemo({ href = LIVE_DEMO_URL, className }: LiveDemoProps) {
  return (
    <Button asChild variant="outline" size="lg" className={className ?? "text-accent"}>
      <Link href={href ?? "#"} aria-label="View live demo" data-sln-event="cta: view live demo clicked">
        View live demo
        <LinkIcon aria-hidden className="h-4 w-4" />
      </Link>
    </Button>
  );
}