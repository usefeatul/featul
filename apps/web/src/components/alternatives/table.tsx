import type { ReactNode } from "react";
import Link from "next/link";
import { AlternativeIcon } from "@featul/ui/icons/alternative";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { cn } from "@featul/ui/lib/utils";
import type { FeatureSupport } from "@/config/alternatives";
import { StatusIcon, featureSupportLabel } from "./icon";

export function ComparisonTable({
  caption,
  children,
  minWidthClassName = "min-w-[36rem]",
}: {
  caption: string;
  children: ReactNode;
  minWidthClassName?: string;
}) {
  return (
    <div className="w-full border border-border bg-card">
      <div
        className="overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        role="region"
        aria-label={caption}
        tabIndex={0}
      >
        <table
          className={cn(
            "w-full border-collapse text-sm [&_tbody_tr]:transition-colors [&_tbody_tr]:duration-150 [&_tbody_tr:hover]:bg-muted/20 motion-reduce:[&_tbody_tr]:transition-none",
            minWidthClassName,
          )}
        >
          <caption className="sr-only">{caption}</caption>
          {children}
        </table>
      </div>
    </div>
  );
}

export function ComparisonThead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-border">{children}</thead>;
}

export function ComparisonTh({
  children,
  className,
  scope = "col",
  align = "left",
  featured = false,
}: {
  children: ReactNode;
  className?: string;
  scope?: "col" | "row";
  featured?: boolean;
  align?: "left" | "center";
}) {
  return (
    <th
      scope={scope}
      data-featured={featured || undefined}
      className={cn(
        "border-l border-border/60 px-4 first:border-l-0 sm:px-6",
        scope === "col"
          ? "py-7 align-bottom text-xs font-medium text-accent sm:py-8 sm:text-sm"
          : "py-5 text-xs font-medium text-foreground sm:text-sm",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function ComparisonTd({
  children,
  className,
  align = "left",
  featured = false,
}: {
  children: ReactNode;
  className?: string;
  align?: "left" | "center";
  featured?: boolean;
}) {
  return (
    <td
      data-featured={featured || undefined}
      className={cn(
        "border-l border-border/60 px-4 py-5 text-xs leading-6 text-accent first:border-l-0 sm:px-6 sm:text-sm",
        featured && "text-foreground",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function ComparisonTr({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-border/70 last:border-b-0">{children}</tr>
  );
}

const STATUS_COLUMN_CLASS = "w-28 min-w-28 sm:w-36 sm:min-w-36";

export function ComparisonStatusHeader({
  name,
  href,
  slug,
  featured = false,
  layout = "stack",
}: {
  name: string;
  href?: string;
  slug?: string;
  featured?: boolean;
  layout?: "stack" | "inline";
}) {
  const mark = featured ? (
    <span className="flex size-8 shrink-0 items-center justify-center ">
      <FeatulLogoIcon className="size-7 text-primary" size={28} />
    </span>
  ) : slug ? (
    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
      <AlternativeIcon
        slug={slug}
        alt=""
        size={32}
        className="size-full object-cover"
      />
    </span>
  ) : null;

  const label = (
    <span
      className={cn(
        "inline-flex gap-2.5",
        layout === "stack" ? "flex-col items-center" : "flex-row items-center",
      )}
    >
      {mark}
      <span className="font-heading text-lg font-semibold leading-none tracking-tight text-foreground sm:text-xl">
        {name}
      </span>
    </span>
  );

  if (!href) return label;

  return (
    <Link
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="inline-flex hover:underline underline-offset-4"
    >
      {label}
    </Link>
  );
}

export function ComparisonStatusCell({ value }: { value: FeatureSupport }) {
  const label = featureSupportLabel(value);
  return (
    <span className="inline-flex items-center justify-center" title={label}>
      <StatusIcon value={value} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { STATUS_COLUMN_CLASS };
