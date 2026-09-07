"use client";

import { usePathname } from "next/navigation";
import { MarketingEdgePattern } from "@/components/layout/edge-pattern";

function isDocsPath(pathname: string) {
  return pathname === "/docs" || pathname.startsWith("/docs/");
}

/** Ruled edge chrome for marketing pages. Docs keeps its own full-bleed layout. */
export function SiteEdgePattern() {
  const pathname = usePathname();
  if (isDocsPath(pathname)) return null;
  return <MarketingEdgePattern />;
}
