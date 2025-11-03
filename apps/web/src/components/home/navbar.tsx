"use client";
import Link from "next/link";
import { navigationConfig } from "@/config/homeNav";
import { Container } from "../global/container";
import { ArrowIcon } from "@feedgot/ui/icons/arrow";
import { MenuIcon } from "@feedgot/ui/icons/menu";
import { cn } from "@feedgot/ui/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@feedgot/ui/components/button";
import { Logo } from "../global/logo";
import { MobileMenu } from "./mobile-menu";

export default function Navbar() {
  const main = navigationConfig.main;
  const before = main.slice(0, 2);
  const after = main.slice(2);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background",
        scrolled && "border-b border-border"
      )}
    >
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            aria-label="Go home"
            className="inline-flex items-center gap-2"
          >
            <Logo />
            <span className="text-md font-medium">Feedgot</span>
          </Link>
          <nav className="hidden md:flex items-center font-medium text-sm gap-6 md:ml-auto">
            {before.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="inline-flex items-center  text-zinc-500 hover:text-foreground transition-colors rounded-md px-2 py-2 hover:bg-accent"
              >
                {item.name}
              </Link>
            ))}
            {after.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="inline-flex items-center  text-zinc-500  hover:text-foreground transition-colors rounded-md px-2 py-2 hover:bg-accent"
              >
                {item.name}
                {item.name === "Docs" && (
                  <ArrowIcon
                    aria-hidden
                    className="ml-1 h-4 w-4 align-middle"
                  />
                )}
              </Link>
            ))}
          </nav>
          <span className="hidden md:inline-block mx-2 text-accent">|</span>

          {/* Auth + CTA */}
          <div className="hidden md:flex items-center gap-4 ml-2">
            {navigationConfig.auth.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-label={item.name}
                className="text-sm font-medium text-zinc-500 hover:text-foreground transition-colors hover:bg-accent rounded-md px-2 py-2"
              >
                {item.name}
              </Link>
            ))}
            <Button asChild className="font-semibold">
              <Link href="/signup" data-sln-event="cta: start for free clicked">
                Start for free
              </Link>
            </Button>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            className="md:hidden inline-flex items-center justify-center rounded-lg p-1 bg-muted "
            onClick={() => setMobileOpen((o) => !o)}
          >
            <MenuIcon width={22} height={22} className="text-foreground" />
          </button>
        </div>
      </Container>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
