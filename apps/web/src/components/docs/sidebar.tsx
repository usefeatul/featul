"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { docsSections } from "@/config/docsNav";

/**
 * Desktop sidebar navigation for docs pages.
 */
export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6 text-sm">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Link href="/" className="flex items-center">
          <FeatulLogoIcon className="h-6 w-6 text-foreground" />
        </Link>
        <span className="inline-flex items-center justify-center rounded-sm border border-border bg-background px-1 py-0.5 text-xs font-medium text-accent">
          Docs
        </span>
      </div>

      {docsSections.map((section) => (
        <div key={section.label} className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-accent ">
            {section.label}
          </div>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-accent hover:text-black transition-colors",
                      isActive && "text-black"
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
