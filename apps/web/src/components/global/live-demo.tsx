"use client";

import Link from "next/link";
import { Button } from "@featul/ui/components/button";
import { LinkIcon } from "@featul/ui/icons/link";
import { cn } from "@featul/ui/lib/utils";
import {
  marketingButtonSizeClass,
  marketingOverlayButtonClass,
} from "./marketing-button-styles";

type LiveDemoProps = {
  href?: string;
  className?: string;
  overlay?: boolean;
};

const LIVE_DEMO_URL = process.env.NEXT_PUBLIC_LIVE_DEMO_URL;

export function LiveDemo({
  href = LIVE_DEMO_URL,
  className,
  overlay = false,
}: LiveDemoProps) {
  return (
    <Button
      asChild
      variant="nav"
      size="lg"
      className={cn(
        marketingButtonSizeClass,
        overlay ? marketingOverlayButtonClass : "text-accent",
        className
      )}
    >
      <Link
        href={href ?? "https://app.featul.com"}
        aria-label="View live demo"
        data-sln-event="cta: view live demo clicked"
      >
        View live demo
        <LinkIcon aria-hidden className="size-4" />
      </Link>
    </Button>
  );
}
