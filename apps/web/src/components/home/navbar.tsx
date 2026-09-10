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
// import { edgeChromeInsetClass } from "@/components/layout/edge-pattern";
import { MobileMenu } from "./menu";
import { DesktopNav } from "./nav-menu";

export default function Navbar() {
  const [canTransition, setCanTransition] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useLayoutEffect(() => {
    const onScroll = () => {
      document.documentElement.toggleAttribute("data-scrolled", window.scrollY > 0);
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
          "fixed top-0 left-0 right-0 z-50 border-b border-border bg-background",
          canTransition && "transition-colors",
        )}
        data-component="Navbar"
      >
        <MarketingContainer className="relative z-20">
          <div
            data-nav-bar
            className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-1 sm:px-6"
          >
            <Link
              href="/"
              aria-label="Go home"
              data-nav-brand
              className="relative z-10 inline-flex items-center gap-2"
            >
              <FeatulLogoIcon size={26} />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Featul
              </span>
            </Link>
            <DesktopNav />

            <div className="relative z-10 hidden items-center gap-4 md:flex">
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
      </header>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
