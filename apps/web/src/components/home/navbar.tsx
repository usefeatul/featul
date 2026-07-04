"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationConfig } from "@/config/homeNav";
import { Container } from "../global/container";
import { ArrowIcon } from "@featul/ui/icons/arrow";
import { MenuIcon } from "@featul/ui/icons/menu";
import { cn } from "@featul/ui/lib/utils";
import { Separator } from "@featul/ui/components/separator";
import { useEffect, useState } from "react";
import { Button } from "@featul/ui/components/button";
import FeatulLogoIcon from "@featul/ui/icons/featul-logo";
import { MobileMenu } from "./mobile-menu";
import { LinearSeparator } from "@/components/linear-separator";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const main = navigationConfig.main;
  const before = main.slice(0, 2);
  const after = main.slice(2);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHomeOverlay = isHome && !scrolled;
  const isHomeScrolled = isHome && scrolled;
  const isHomeStyled = isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
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

  const navLinkClass = cn(
    "inline-flex items-center rounded-md h-8 px-2 transition-all",
    isHomeStyled
      ? "text-white/90 hover:bg-white/10 hover:text-white"
      : "text-accent hover:bg-muted hover:text-foreground hover:ring-1 hover:ring-border"
  );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors",
        isHomeOverlay
          ? "bg-transparent"
          : isHomeScrolled
            ? "bg-[var(--hero-sky-nav)]"
            : scrolled
              ? "bg-background/70 backdrop-blur-lg"
              : "bg-background"
      )}
      data-component="Navbar"
    >
      <Container maxWidth="6xl" className="relative px-4 sm:px-10 lg:px-12 xl:px-14">
        {!isHomeStyled && (
          <LinearSeparator
            variant="line"
            className="absolute bottom-0 left-0 right-0 my-0"
          />
        )}
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-1 sm:px-6">
          <Link
            href="/"
            aria-label="Go home"
            className={cn(
              "inline-flex items-center gap-2",
              isHomeStyled ? "text-white" : "text-foreground"
            )}
          >
            <FeatulLogoIcon size={26} />
            <span className="text-lg font-semibold tracking-tight">Featul</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:ml-auto md:flex">
            {before.map((item) => (
              <Link key={item.name} href={item.href} className={navLinkClass}>
                {item.name}
              </Link>
            ))}
            {after.map((item) => (
              <Link key={item.name} href={item.href} className={navLinkClass}>
                {item.name}
                {item.name === "Docs" && (
                  <ArrowIcon aria-hidden className="ml-1 size-4 align-middle" />
                )}
              </Link>
            ))}
          </nav>
          <div className="mx-2 hidden h-4 items-center md:flex">
            <Separator
              orientation="vertical"
              className={cn("h-full", isHomeStyled && "bg-white/25")}
            />
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {navigationConfig.auth.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-label={item.name}
                className={cn(
                  "inline-flex h-8 items-center rounded-md px-3 text-sm font-medium transition-all",
                  isHomeStyled
                    ? "text-white/90 hover:bg-white/10 hover:text-white"
                    : "text-accent hover:bg-muted hover:text-foreground hover:ring-1 hover:ring-border"
                )}
              >
                {item.name}
              </Link>
            ))}
            <Button asChild size="sm" className="font-heading">
              <Link
                href="https://app.featul.com"
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
              "inline-flex items-center justify-center rounded-md md:hidden",
              isHomeStyled
                ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
                : "bg-muted"
            )}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <MenuIcon className={cn("size-5", isHomeStyled ? "text-current" : "text-accent")} />
          </Button>
        </div>
      </Container>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
