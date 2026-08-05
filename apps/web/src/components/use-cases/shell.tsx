import type { ReactNode } from "react";
import { Container } from "@/components/global/container";
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
      {/* Match SkyMarketingHero dashboard image gutter (px-3 sm:px-4) */}
      <Container
        maxWidth="6xl"
        className="relative z-10 px-3 pb-14 text-left sm:px-4 sm:pb-20"
      >
        <div className="w-full max-w-3xl">{children}</div>
      </Container>
    </main>
  );
}
