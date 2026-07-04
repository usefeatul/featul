import Link from "next/link";
import { ArrowIcon } from "@featul/ui/icons/arrow";
import { Container } from "../global/container";

export default function AnnouncementBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-60 w-full border-b border-white/15 bg-[var(--hero-sky-banner)] text-white">
      <Container
        maxWidth="6xl"
        className="relative px-3 sm:px-10 lg:px-12 xl:px-14"
      >
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-6xl bg-[linear-gradient(to_bottom,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.18)_100%),linear-gradient(to_bottom,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.18)_100%)] bg-[length:1px_100%] bg-[position:left_top,right_top] bg-no-repeat px-1 sm:px-6" />
        <div className="mx-auto flex h-10 w-full max-w-6xl items-center justify-center gap-1.5 px-1 text-white sm:gap-2 sm:px-6 text-xs sm:text-[13px]">
          <span className="inline-flex h-6 items-center rounded-md bg-white/15 px-2 text-xs font-heading text-white whitespace-nowrap sm:text-xs">
            New
          </span>
          <Link
            href="/tools/categories"
            className="inline-flex min-w-0 items-center gap-1 leading-none text-white transition-opacity hover:opacity-85"
          >
            <span className="truncate text-white sm:hidden max-w-[220px]">
              Free product & SaaS calculators
            </span>
            <span className="hidden whitespace-nowrap text-white sm:inline">
              Plan faster with our free product and SaaS calculators
            </span>
            <span className="hidden text-white/70 sm:inline">|</span>
            <span className="hidden font-heading text-white sm:inline">Try it</span>
            <ArrowIcon className="size-3.5 text-white sm:size-4" aria-hidden />
          </Link>
        </div>
      </Container>
    </div>
  );
}
