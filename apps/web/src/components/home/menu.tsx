"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Container } from "../global/container";
import FeatulLogoIcon from "@featul/ui/icons/featul-logo";
import { Button } from "@featul/ui/components/button";
import { MenuIcon } from "@featul/ui/icons/menu";
import { APP_URL } from "@/config/auth";
import { navigationConfig } from "@/config/homeNav";

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
      className="fixed inset-x-0 bottom-0 top-10 z-[70] overflow-y-auto overscroll-contain bg-background md:hidden"
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
            <Button
              asChild
              variant="nav"
              className="w-full font-semibold border-primary/80 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
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
      </Container>
    </div>,
    document.body
  );
}
