"use client";
import Link from "next/link";
import { APP_URL } from "@/config/auth";
import { navigationConfig } from "@/config/homeNav";
import { MarketingContainer } from "@/components/layout/container";
import { MenuIcon } from "@featul/ui/icons/menu";
import { cn } from "@featul/ui/lib/utils";
import { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "@featul/ui/components/button";
import FeatulLogoIcon from "@featul/ui/icons/featul-logo";
import { edgeChromeInsetClass } from "@/components/layout/edge-pattern";
import { MobileMenu } from "./menu";

export default function Navbar() {
  const main = navigationConfig.main;

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
    "font-light text-accent hover:text-foreground hover:bg-card hover:ring-1 hover:ring-border";

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
                {main.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex h-8 items-center rounded-md px-2 transition-all",
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
                    aria-label={item.name}
                    className={cn(
                      "inline-flex h-8 items-center rounded-md px-3 text-sm transition-all",
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
                className="inline-flex items-center justify-center rounded-md bg-muted md:hidden"
                onClick={() => setMobileOpen((o) => !o)}
              >
                <MenuIcon className="size-5 text-accent" />
              </Button>
            </div>
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
