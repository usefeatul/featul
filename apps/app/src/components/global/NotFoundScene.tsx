"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@featul/ui/components/button";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";

type NotFoundSceneProps = {
  defaultHref: string;
};

function useWorkspaceHref(defaultHref: string) {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/workspaces/")) {
    const slug = pathname.split("/")[2] || "";
    if (slug) return `/workspaces/${slug}`;
  }
  return defaultHref;
}

export default function NotFoundScene({ defaultHref }: NotFoundSceneProps) {
  const workspaceHref = useWorkspaceHref(defaultHref);

  return (
    <main className="fixed inset-0 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-[position:center_top]"
        style={{ backgroundImage: "url(/image/sky.PNG)" }}
      />

      <Link
        href="/"
        aria-label="Go home"
        className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 text-white sm:left-8 sm:top-8"
      >
        <FeatulLogoIcon className="size-7 sm:size-8" />
        <span className="font-heading text-base font-semibold tracking-tight sm:text-lg">
          Featul
        </span>
      </Link>

      <div className="relative z-10 flex min-h-full items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md text-center text-white">
          <p className="font-heading text-6xl font-semibold tracking-tight sm:text-7xl">
            404
          </p>
          <h1 className="mt-4 font-heading text-2xl font-semibold sm:text-3xl">
            Lost in the clouds
          </h1>
          <p className="mt-3 text-sm leading-relaxed sm:text-base">
            This page drifted away. Head back to your workspace and pick up where
            you left off.
          </p>
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Button
              asChild
              variant="nav"
              size="lg"
              className="h-10 min-h-[40px] w-full border-primary/80 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground sm:w-auto"
            >
              <Link href={workspaceHref} aria-label="Go to workspace">
                Go to workspace
              </Link>
            </Button>
            <Button
              asChild
              variant="nav"
              size="lg"
              className="h-10 min-h-[40px] w-full border-white/70 bg-white/95 text-accent shadow-sm hover:bg-white sm:w-auto"
            >
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
