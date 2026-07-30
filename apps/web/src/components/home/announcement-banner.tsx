"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowIcon } from "@featul/ui/icons/arrow";
import { cn } from "@featul/ui/lib/utils";
import { Container } from "../global/container";

export default function AnnouncementBanner() {
  // On the home page the banner matches the sky-blue navbar/hero stack
  const isHome = usePathname() === "/";
  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-60 w-full border-b text-primary-foreground",
        isHome
          ? "border-white/25 bg-[#0063d2]"
          : "border-primary/25 bg-primary"
      )}
    >
      <Container
        maxWidth="6xl"
        className="relative px-3 sm:px-10 lg:px-12 xl:px-14"
      >
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-6xl bg-[linear-gradient(to_bottom,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.28)_100%),linear-gradient(to_bottom,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.28)_100%)] bg-[length:1px_100%] bg-[position:left_top,right_top] bg-no-repeat px-1 sm:px-6" />
        <div className="mx-auto flex h-10 w-full max-w-6xl items-center justify-center gap-1.5 px-1 text-xs sm:gap-2 sm:px-6 sm:text-[13px]">
          <span className="inline-flex h-6 shrink-0 items-center rounded-sm bg-primary-foreground/15 px-2 font-heading whitespace-nowrap">
            New
          </span>
          <Link
            href="/tools/categories"
            className="inline-flex min-w-0 max-w-full items-center gap-1 leading-none transition-opacity hover:opacity-85"
          >
            <span className="truncate xs:max-w-none max-w-[11.5rem] sm:hidden">
              Free product & SaaS calculators
            </span>
            <span className="hidden whitespace-nowrap sm:inline">
              Plan faster with our free product and SaaS calculators
            </span>
            <span className="hidden text-primary-foreground/70 sm:inline">|</span>
            <span className="hidden font-heading sm:inline">Try it</span>
            <ArrowIcon className="size-3.5 shrink-0 sm:size-4" aria-hidden />
          </Link>
        </div>
      </Container>
    </div>
  );
}
