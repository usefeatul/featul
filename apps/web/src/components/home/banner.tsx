import Link from "next/link";
import { ArrowIcon } from "@featul/ui/icons/arrow";
import { APP_URL } from "@/config/auth";

export default function AnnouncementBanner() {
  return (
    <aside
      aria-label="Get started with Featul"
      data-component="AnnouncementBanner"
      className="fixed inset-x-0 top-0 z-[60] isolate h-10 overflow-hidden border-b border-primary/30 bg-[#4189e2] text-white"
    >
      <div className="relative flex h-full items-center justify-center gap-3 px-4 text-xs sm:gap-4 sm:text-[13px]">
        <p className="font-normal">
          <span className="sm:hidden">Turn ideas into features.</span>
          <span className="hidden sm:inline">
            Your next great feature starts with feedback.
          </span>
        </p>
        <Link
          href={APP_URL}
          data-sln-event="cta: announcement start for free clicked"
          className="group inline-flex h-full shrink-0 items-center gap-1.5 font-heading font-medium focus-visible:rounded-sm focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current"
        >
          Start for free
          <ArrowIcon
            aria-hidden
            className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
      </div>
    </aside>
  );
}
