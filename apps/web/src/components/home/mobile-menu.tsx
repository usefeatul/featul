"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Container } from "../global/container";
import { Logo } from "../global/logo";
import { Button } from "@feedgot/ui/components/button";
import { MenuIcon } from "@feedgot/ui/icons/menu";
import { navigationConfig } from "@/config/homeNav";
import { useIsMobile } from "@feedgot/ui/hooks/use-mobile";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [open, isMobile]);
  // Only render on mobile when open
  if (!open || !isMobile) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[60] bg-background" data-component="MobileMenu">
      {/* Sheet header */}
      <div className="flex items-center justify-between h-14  px-4 sm:px-12 lg:px-16 xl:px-18">
        <span className="inline-flex items-center gap-2">
          <Logo />
          <span className="text-md font-medium">Feedgot</span>
        </span>
        <button
          type="button"
          aria-label="Close menu"
          className="inline-flex items-center justify-center rounded-lg p-2 bg-muted"
          onClick={onClose}
        >
          <MenuIcon width={22} height={22} className="text-foreground" />
        </button>
      </div>
      {/* Sheet body */}
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
        <nav className="py-4 grid gap-2">
          {navigationConfig.main.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-md px-2 py-2 text-lg text-accent hover:text-foreground hover:bg-muted"
              onClick={onClose}
            >
              {item.name}
            </Link>
          ))}
          <div className="mt-4 grid gap-2">
            {navigationConfig.auth.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-label={item.name}
                className="block rounded-md px-3 py-2.5 mb-4 text-lg font-medium text-accent hover:text-foreground hover:bg-muted min-h-[36px]"
                onClick={onClose}
              >
                {item.name}
              </Link>
            ))}
            <Button asChild className="font-semibold w-full">
              <Link
                href="/signup"
                data-sln-event="cta: start for free clicked"
                onClick={onClose}
              >
                Start for free
              </Link>
            </Button>
          </div>
        </nav>
      </Container>
    </div>
  );
}
