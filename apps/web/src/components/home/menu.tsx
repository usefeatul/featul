"use client";
import { MarketingContainer } from "@/components/layout/container";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
// import { edgeChromeInsetClass } from "@/components/layout/edge-pattern";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import { APP_URL } from "@/config/auth";
import {
  isExternalHref,
  isNavDropdown,
  navigationConfig,
} from "@/config/homeNav";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 top-16 z-[40] overflow-y-auto overscroll-contain bg-background md:hidden",
        // edgeChromeInsetClass,
      )}
      data-component="MobileMenu"
    >
      <MarketingContainer>
        <nav className="grid gap-6 py-4">
          {navigationConfig.main.map((item) => {
            if (!isNavDropdown(item)) {
              return (
                <Link
                  key={item.name}
                  href={item.href ?? "/"}
                  className="block rounded-md px-2 py-2 text-lg text-accent hover:bg-muted hover:text-foreground"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              );
            }

            return (
              <div key={item.name} className="grid gap-2">
                <p className="px-2 text-xs font-medium uppercase tracking-[0.08em] text-primary">
                  {item.name}
                </p>
                {item.columns.flatMap((column) =>
                  column.items.map((link) => {
                    const external = isExternalHref(link);
                    return (
                      <Link
                        key={`${item.name}-${link.name}`}
                        href={link.href}
                        {...(external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : undefined)}
                        className="block rounded-md px-2 py-2 text-lg text-accent hover:bg-muted hover:text-foreground"
                        onClick={onClose}
                      >
                        {link.name}
                      </Link>
                    );
                  }),
                )}
              </div>
            );
          })}
          <div className="grid gap-2">
            {navigationConfig.auth.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-label={item.name}
                className="mb-4 block min-h-[36px] rounded-md px-3 py-2.5 text-lg font-medium text-accent hover:bg-muted hover:text-foreground"
                onClick={onClose}
              >
                {item.name}
              </Link>
            ))}
            <Button
              asChild
              variant="nav"
              className="w-full border-primary/80 bg-primary font-semibold text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            >
              <Link
                href={APP_URL}
                data-sln-event="cta: start for free clicked"
                onClick={onClose}
              >
                Start for free
              </Link>
            </Button>
          </div>
        </nav>
      </MarketingContainer>
    </div>,
    document.body,
  );
}
