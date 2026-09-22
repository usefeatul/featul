"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import { DrawerTrigger } from "@featul/ui/components/drawer";
import type { NavItem } from "../../types/nav";
import MoreIcon from "@featul/ui/icons/more";

/** Active nav item via exact href or prefix match. External items never match. */
function isItemActive(pathname: string, item: NavItem) {
  if (item.external) return false;
  const activePrefix = item.match || item.href;
  return (
    pathname === activePrefix ||
    (!item.exact && activePrefix !== "/" && pathname.startsWith(activePrefix))
  );
}

export default function MobileBottomBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname() || "";
  const visibleItems = items.slice(0, 4);
  const moreActive = !visibleItems.some((item) => isItemActive(pathname, item));

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 isolate border-t border-border/60 bg-background/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 dark:border-white/10 dark:shadow-[0_-10px_30px_rgba(0,0,0,0.24)]"
    >
      <div
        className="grid h-14 items-stretch px-2"
        style={{
          gridTemplateColumns: `repeat(${visibleItems.length + 1}, minmax(0, 1fr))`,
        }}
      >
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(pathname, item);
          return (
            <Link
              key={item.label}
              href={item.href}
              replace={item.replace}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                active ? "text-primary" : "text-accent",
              )}
            >
              <span className="flex h-7 min-w-11 items-center justify-center px-3">
                <Icon
                  className={cn(
                    "size-[18px] transition-[color,opacity,transform] duration-200 group-active:scale-90",
                    active
                      ? "text-primary opacity-100"
                      : "text-neutral-600 opacity-100 group-hover:text-primary dark:text-neutral-300",
                  )}
                />
              </span>
              <span
                className={cn(
                  "w-full truncate text-center text-[10px] leading-none tracking-[-0.01em] transition-colors",
                  "font-medium text-accent",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
        <DrawerTrigger asChild>
          <button
            type="button"
            aria-label="Open navigation menu"
            className={cn(
              "group relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1 text-accent outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
              moreActive && "text-primary",
            )}
          >
            <span className="flex h-7 min-w-11 items-center justify-center px-3">
              <MoreIcon
                className={cn(
                  "size-[18px] transition-[color,opacity,transform] duration-200 group-active:scale-90",
                  moreActive
                    ? "text-primary opacity-100"
                    : "text-neutral-600 opacity-100 group-hover:text-primary dark:text-neutral-300",
                )}
              />
            </span>
            <span
              className={cn(
                "w-full truncate text-center text-[10px] leading-none tracking-[-0.01em] transition-colors",
                "font-medium text-accent",
              )}
            >
              More
            </span>
          </button>
        </DrawerTrigger>
      </div>
    </nav>
  );
}
