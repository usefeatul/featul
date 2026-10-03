"use client";

import { MenuIcon } from "@/components/global/icons";
import Link from "next/link";
import { APP_URL } from "@/config/auth";
import { navigationConfig } from "@/config/homeNav";
import { MarketingContainer } from "@/components/layout/container";
import { cn } from "@featul/ui/lib/utils";
import { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "@featul/ui/components/button";
import FeatulLogoIcon from "@featul/ui/icons/featul-logo";
import { MobileMenu } from "./menu";

const linkTone =
  "font-light text-accent hover:text-foreground hover:bg-card hover:ring-1 hover:ring-border";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useLayoutEffect(() => {
    let frame = 0;
    const sync = () => {
      frame = 0;
      const nextScrolled = window.scrollY > 0;
      setScrolled(nextScrolled);
      document.documentElement.toggleAttribute("data-scrolled", nextScrolled);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };
    media.addEventListener("change", handleChange);
    if (media.matches) setMobileOpen(false);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      <header
        className="fixed top-10 left-0 right-0 z-50 bg-transparent"
        data-component="Navbar"
      >
        {scrolled && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-background"
          />
        )}
        <MarketingContainer className="relative">
          <div
            data-nav-bar
            className={cn(
              "relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-1 sm:px-6",
              !scrolled && "bg-background",
            )}
          >
            <Link
              href="/"
              aria-label="Go home"
              data-nav-brand
              className="relative z-10 inline-flex shrink-0 items-center gap-2"
            >
              <FeatulLogoIcon size={26} />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Featul
              </span>
            </Link>
            <nav
              aria-label="Primary"
              className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex"
            >
              <div className="pointer-events-auto flex items-center gap-6 text-sm">
                {navigationConfig.main.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex h-8 items-center rounded-md px-2 transition-[background-color,box-shadow] duration-150",
                      linkTone,
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
            <div className="relative z-10 flex shrink-0 items-center">
              <div className="hidden items-center gap-4 md:flex">
                {navigationConfig.auth.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex h-8 items-center rounded-md px-3 text-sm transition-[background-color,box-shadow] duration-150",
                      linkTone,
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                <Button
                  asChild
                  size="sm"
                  variant="default"
                  className="font-heading"
                >
                  <Link
                    href={APP_URL}
                    data-sln-event="cta: start for free clicked"
                  >
                    Start for free
                  </Link>
                </Button>
              </div>
              <Button
                type="button"
                variant="nav"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                data-nav-menu
                className="inline-flex items-center justify-center rounded-md bg-muted md:hidden"
                onClick={() => setMobileOpen((open) => !open)}
              >
                <MenuIcon className="size-5 text-accent" />
              </Button>
            </div>
          </div>
        </MarketingContainer>
        {scrolled && (
          <div
            aria-hidden
            data-nav-rule
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[0.5px] bg-border"
          />
        )}
      </header>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
