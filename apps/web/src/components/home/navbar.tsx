"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_URL } from "@/config/auth";
import { navigationConfig } from "@/config/homeNav";
import { Container } from "../global/container";
import { MenuIcon } from "@featul/ui/icons/menu";
import { cn } from "@featul/ui/lib/utils";
import { Separator } from "@featul/ui/components/separator";
import { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "@featul/ui/components/button";
import FeatulLogoIcon from "@featul/ui/icons/featul-logo";
import { MobileMenu } from "./menu";
import { isSkyPath } from "@/lib/sky";

export default function Navbar() {
  const main = navigationConfig.main;
  const before = main.slice(0, 2);
  const after = main.slice(2);

  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useLayoutEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 0;
      setScrolled(next);
      document.documentElement.toggleAttribute("data-scrolled", next);
    };
    onScroll();
    setNavReady(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  // Over sky-backed pages the navbar is painted the same deep azure as the top
  // of the sky image so the bar visually merges with the hero below it.
  const overSky = isSkyPath(pathname) && !scrolled;
  const linkTone = overSky
    ? "text-white/90 hover:text-white hover:bg-white/10 hover:ring-1 hover:ring-white/25"
    : "text-accent hover:text-foreground hover:bg-muted hover:ring-1 hover:ring-border";

  return (
    <>
      <header
      className={cn(
        "fixed top-10 left-0 right-0 z-50",
        navReady && "transition-colors",
        scrolled
          ? "backdrop-blur-lg bg-background/70"
          : overSky
            ? "bg-[#0063d2]"
            : "bg-background"
      )}
      data-component="Navbar"
    >

      <Container maxWidth="6xl" className="relative px-4 sm:px-10 lg:px-12 xl:px-14">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-1 sm:px-6">
            <Link
            href="/"
            aria-label="Go home"
            className="inline-flex items-center gap-2"
            data-nav-brand=""
          >
            <FeatulLogoIcon
              size={26}
              className={overSky ? "text-white" : "text-foreground"}
            />
            <span
              className={cn(
                "text-lg font-semibold tracking-tight",
                overSky ? "text-white" : "text-foreground"
              )}
            >
              Featul
            </span>
          </Link>
          <nav className="hidden md:flex items-center font-medium text-sm gap-6 md:ml-auto">
            {before.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "inline-flex items-center rounded-md h-8 px-2 transition-all",
                  linkTone
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
                  linkTone
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center mx-2 h-4">
            <Separator
              orientation="vertical"
              className={cn("h-full", overSky && "bg-white/40")}
            />
          </div>

          {/* Auth + CTA */}
          <div className="hidden md:flex items-center gap-4">
            {navigationConfig.auth.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-label={item.name}
                className={cn(
                  "text-sm font-medium inline-flex items-center rounded-md h-8 px-3 transition-all",
                  linkTone
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
            className={cn(
              "md:hidden inline-flex items-center justify-center rounded-md",
              overSky
                ? "bg-white/15 text-white hover:bg-white/25"
                : "bg-muted"
            )}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <MenuIcon
              className={cn("size-5", overSky ? "text-white" : "text-accent")}
            />
          </Button>
        </div>
      </Container>

      </header>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
