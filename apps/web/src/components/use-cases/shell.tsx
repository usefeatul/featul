import type { ReactNode } from "react";
import { MarketingContainer, MarketingRail } from "@/components/layout/container";
import { UseCaseHero } from "./hero";

type UseCaseDetailShellProps = {
  title: string;
  description: string;
  badge?: string;
  children: ReactNode;
};

/** Shared layout for hand-crafted use case articles. */
export function UseCaseDetailShell({
  title,
  description,
  badge = "Use case",
  children,
}: UseCaseDetailShellProps) {
  return (
    <main className="min-h-screen overflow-x-clip">
      <UseCaseHero title={title} description={description} badge={badge} />
      <MarketingContainer className="relative z-10 pb-14 text-left sm:pb-20">
        <MarketingRail>
          <div className="w-full max-w-3xl">{children}</div>
        </MarketingRail>
      </MarketingContainer>
    </main>
  );
}
