import type { ReactNode } from "react";
import { Container } from "@/components/global/container";
import { cn } from "@featul/ui/lib/utils";
import { edgeGutterXClass } from "@/components/layout/edge-pattern";

export const marketingRailClass = "mx-auto w-full max-w-6xl px-1 sm:px-6";
export const marketingStackClass = "relative mx-auto max-w-6xl";

type MarketingBoxProps = {
  children: ReactNode;
  className?: string;
};

/** Page-width container that stays clear of the ruled edge strips. */
export function MarketingContainer({ children, className }: MarketingBoxProps) {
  return (
    <Container maxWidth="6xl" className={cn(edgeGutterXClass, className)}>
      {children}
    </Container>
  );
}

/** Inner column used inside MarketingContainer. */
export function MarketingRail({ children, className }: MarketingBoxProps) {
  return <div className={cn(marketingRailClass, className)}>{children}</div>;
}

/** Centered max-width stack for homepage / SEO section groups. */
export function MarketingStack({ children, className }: MarketingBoxProps) {
  return <div className={cn(marketingStackClass, className)}>{children}</div>;
}
