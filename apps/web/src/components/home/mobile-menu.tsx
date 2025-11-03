"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Container } from "../global/container";
import { Logo } from "../global/logo";
import { Button } from "@feedgot/ui/components/button";
import { MenuIcon } from "@feedgot/ui/icons/menu";
import { navigationConfig } from "@/config/homeNav";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[60] bg-background">
      {/* Sheet header */}
      <div className="flex items-center justify-between h-14  px-4 sm:px-16 lg:px-20 xl:px-24">
        <span className="inline-flex items-center gap-2">
          <Logo />
          <span className="text-md font-medium">Feedgot</span>
        </span>
        <button
          type="button"
          aria-label="Close menu"
          className="inline-flex items-center justify-center rounded-md p-2 bg-gray-100 hover:bg-gray-200"
          onClick={onClose}
        >
          <MenuIcon width={22} height={22} className="text-foreground" />
        </button>
      </div>
      {/* Sheet body */}
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <nav className="py-4 grid gap-2">
          {navigationConfig.main.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-md px-2 py-2 text-lg text-zinc-500 hover:text-foreground hover:bg-accent"
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
                className="block rounded-md px-2 py-2 mb-4 text-lg font-medium text-zinc-500 hover:text-foreground hover:bg-accent"
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