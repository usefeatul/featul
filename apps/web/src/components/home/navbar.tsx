"use client";
import Link from "next/link";
import { APP_URL } from "@/config/auth";
import { navigationConfig } from "@/config/homeNav";
import { MarketingContainer } from "@/components/layout/container";
import { MenuIcon } from "@featul/ui/icons/menu";
import { cn } from "@featul/ui/lib/utils";
import { Separator } from "@featul/ui/components/separator";
import { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "@featul/ui/components/button";
import FeatulLogoIcon from "@featul/ui/icons/featul-logo";
import { edgeChromeInsetClass } from "@/components/layout/edge-pattern";
import { MobileMenu } from "./menu";

export default function Navbar() {
  const main = navigationConfig.main;
  const before = main.slice(0, 2);
  const after = main.slice(2);

  const [scrolled, setScrolled] = useState(false);
  const [canTransition, setCanTransition] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useLayoutEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 0;
      setScrolled(next);
      document.documentElement.toggleAttribute("data-scrolled", next);
    };
    onScroll();
    const frame = window.requestAnimationFrame(() => setCanTransition(true));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileOpen(false);
      }
    };

    media.addEventListener("change", handleChange);
    if (media.matches) {
      setMobileOpen(false);
    }

    return () => media.removeEventListener("change", handleChange);
  }, []);

  const linkTone =
    "font-light text-accent hover:text-foreground hover:bg-muted hover:ring-1 hover:ring-border";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-transparent",
          canTransition && "transition-colors",
        )}
        data-component="Navbar"
      >
        {scrolled ? (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 bg-background",
              edgeChromeInsetClass,
            )}
          />
        ) : null}
        <MarketingContainer className="relative">
          <div
            data-nav-bar
            className={cn(
              "mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-1 sm:px-6",
              !scrolled && "bg-background",
            )}
          >
            <Link
              href="/"
              aria-label="Go home"
              data-nav-brand
              className="inline-flex items-center gap-2"
            >
              <FeatulLogoIcon size={26} />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Featul
              </span>
            </Link>
            <nav className="hidden md:flex items-center text-sm gap-6 md:ml-auto">
              {before.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center rounded-md h-8 px-2 transition-all",
                    linkTone,
                  )}
                >
                  {item.name}
                </Link>
              ))}
              {after.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center rounded-md h-8 px-2 transition-all",
                    linkTone,
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="hidden md:flex items-center mx-2 h-4">
              <Separator orientation="vertical" className="h-full" />
            </div>

            <div className="hidden md:flex items-center gap-4">
              {navigationConfig.auth.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-label={item.name}
                  className={cn(
                    "text-sm inline-flex items-center rounded-md h-8 px-3 transition-all",
                    linkTone,
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <Button
                asChild
                size="sm"
                variant="nav"
                className="font-heading border-primary/80 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
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
              data-nav-menu
              className="md:hidden inline-flex items-center justify-center rounded-md bg-muted"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <MenuIcon className="size-5 text-accent" />
            </Button>
          </div>
        </MarketingContainer>
        {scrolled ? (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[0.5px] bg-border",
              edgeChromeInsetClass,
            )}
          />
        ) : null}
      </header>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
