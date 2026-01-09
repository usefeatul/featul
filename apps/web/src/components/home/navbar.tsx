"use client";
import Link from "next/link";
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
import { useIsMobile } from "@featul/ui/hooks/use-mobile";
import { LinearSeparator } from "@/components/linear-separator";

export default function Navbar() {
  const main = navigationConfig.main;
  const before = main.slice(0, 2);
  const after = main.slice(2);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [isMobile, mobileOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors",
        scrolled
          ? "backdrop-blur-lg bg-background/70"
          : "bg-background"
      )}
      data-component="Navbar"
    >

      <Container maxWidth="6xl" className="relative px-4 sm:px-12 lg:px-16 xl:px-18">
        <LinearSeparator className="absolute bottom-0 left-0 right-0 my-0" />
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6 flex items-center justify-between h-18">
          <Link
            href="/"
            aria-label="Go home"
            className="inline-flex items-center gap-2"
          >
            <FeatulLogoIcon size={26} />
            {/* <span className="text-lg font-medium">featul</span> */}
          </Link>
          <nav className="hidden md:flex items-center font-medium text-sm gap-6 md:ml-auto">
            {before.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="inline-flex items-center rounded-md  h-8 px-2 text-accent hover:text-foreground transition-all hover:bg-muted hover:ring-1 hover:ring-border"
              >
                {item.name}
              </Link>
            ))}
            {after.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="inline-flex items-center rounded-md  h-8 px-2 text-accent hover:text-foreground transition-all hover:bg-muted hover:ring-1 hover:ring-border"
              >
                {item.name}
                {item.name === "Docs" && (
                  <ArrowIcon
                    aria-hidden
                    className="ml-1 size-4 align-middle"
                  />
                )}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center mx-2 h-4">
            <Separator orientation="vertical" className="h-full" />
          </div>

          {/* Auth + CTA */}
          <div className="hidden md:flex items-center gap-4">
            {navigationConfig.auth.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-label={item.name}
                className="text-sm font-medium inline-flex items-center rounded-md  h-8 px-3 text-accent hover:text-foreground transition-all hover:bg-muted hover:ring-1 hover:ring-border"
              >
                {item.name}
              </Link>
            ))}
            <Button asChild size="sm" className="font-light ">
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
            className="md:hidden inline-flex items-center justify-center rounded-md  bg-muted"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <MenuIcon className="text-accent size-5" />
          </Button>
        </div>
      </Container>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
