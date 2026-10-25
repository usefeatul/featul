import Link from "next/link";
import { ChevronLeftIcon } from "@/components/global/icons";
import { cn } from "@featul/ui/lib/utils";

/** Icon-only link back to the parent section; used in place of header breadcrumbs. */
export function BackButton({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={`Back to ${label}`}
      title={`Back to ${label}`}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg text-accent transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-white/5",
        className,
      )}
    >
      <ChevronLeftIcon className="size-4" />
    </Link>
  );
}
