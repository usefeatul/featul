"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Container } from "../global/container";
import FeatulLogoIcon from "@featul/ui/icons/featul-logo";
import { Button } from "@featul/ui/components/button";
import { MenuIcon } from "@featul/ui/icons/menu";
import { navigationConfig } from "@/config/homeNav";
import { useIsMobile } from "@featul/ui/hooks/use-mobile";

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
    <div
      className="fixed inset-x-0 bottom-0 top-10 z-60 overflow-y-auto bg-background md:hidden"
      data-component="MobileMenu"
    >
      {/* Sheet header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-10 lg:px-12 xl:px-14">
        <span className="inline-flex items-center gap-2">
          <FeatulLogoIcon />
          <span className="text-base font-semibold tracking-tight text-foreground">
            Featul
          </span>
        </span>
        <Button
          type="button"
          variant="nav"
          aria-label="Close menu"
          className="inline-flex items-center justify-center rounded-md  bg-muted"
          onClick={onClose}
        >
          <MenuIcon className="text-accent size-5" />
        </Button>
      </div>
      <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
        <nav className="py-4 grid gap-2">
          {navigationConfig.main.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-md  px-2 py-2 text-lg text-accent hover:text-foreground hover:bg-muted"
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
                className="block rounded-md  px-3 py-2.5 mb-4 text-lg font-medium text-accent hover:text-foreground hover:bg-muted min-h-[36px]"
                onClick={onClose}
              >
                {item.name}
              </Link>
            ))}
            <Button asChild className="font-semibold w-full">
              <Link
                href="https://app.featul.com/auth/sign-up"
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
