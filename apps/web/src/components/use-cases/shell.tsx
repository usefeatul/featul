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
      <div className="relative mx-auto max-w-6xl">
        <Container
          maxWidth="6xl"
          className="relative z-10 px-4 pb-14 sm:px-10 sm:pb-20 lg:px-12 xl:px-14"
        >
          <div className="mx-auto w-full max-w-3xl px-0 sm:px-6">
            {children}
          </div>
        </Container>
      </div>
    </main>
  );
}
