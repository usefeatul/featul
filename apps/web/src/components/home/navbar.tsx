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
import { motion } from "framer-motion";

const navTransition = { type: "spring" as const, stiffness: 420, damping: 30, mass: 0.85 };

const floatShadow =
  "0 8px 32px -8px rgb(0 0 0 / 0.12), 0 0 0 1px rgb(0 0 0 / 0.06)";

const NAV_FULL_WIDTH = 1152;
const NAV_FLOAT_WIDTH = 800;

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const main = navigationConfig.main;
  const before = main.slice(0, 2);
  const after = main.slice(2);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHomeOverlay = isHome && !scrolled;
  const isFloated = scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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
    "inline-flex items-center rounded-md h-8 px-2 transition-colors",
    isHomeOverlay
      ? "text-white/90 hover:bg-white/10 hover:text-white"
      : "text-accent hover:bg-muted hover:text-foreground hover:ring-1 hover:ring-border"
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50" data-component="Navbar">
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 origin-top bg-background"
        initial={false}
        animate={{
          scaleY: !isHome && !isFloated ? 1 : 0,
          opacity: !isHome && !isFloated ? 1 : 0,
        }}
        transition={navTransition}
        style={{ height: 64 }}
        aria-hidden
      />

      <Container maxWidth="6xl" className="relative px-4 sm:px-10 lg:px-12 xl:px-14">
        {!isHome && !isFloated && (
          <LinearSeparator
            variant="line"
            className="absolute bottom-0 left-0 right-0 my-0"
          />
        )}

        <motion.div
          className="mx-auto w-full"
          initial={false}
          animate={{
            marginTop: isFloated ? 12 : 0,
            maxWidth: isFloated ? NAV_FLOAT_WIDTH : NAV_FULL_WIDTH,
          }}
          transition={navTransition}
        >
          <motion.div
            className={cn(
              "relative flex w-full items-center justify-between",
              isFloated ? "px-4 sm:px-5" : "px-3 sm:px-6"
            )}
            initial={false}
            animate={{ height: isFloated ? 56 : 64 }}
            transition={navTransition}
          >
            <motion.div
              className="pointer-events-none absolute inset-0 -z-10 bg-white"
              style={{ transformOrigin: "50% 0%" }}
              initial={false}
              animate={{
                scaleX: isFloated ? 1 : 0.72,
                scaleY: isFloated ? 1 : 0,
                opacity: isFloated ? 1 : 0,
                borderRadius: isFloated ? 16 : 12,
                boxShadow: isFloated ? floatShadow : "0 0 0 0 transparent",
              }}
              transition={navTransition}
              aria-hidden
            />
            <Link
              href="/"
              aria-label="Go home"
              className={cn(
                "inline-flex items-center gap-2",
                isHomeOverlay ? "text-white" : "text-foreground"
              )}
            >
              <FeatulLogoIcon size={26} />
              <span className="text-lg font-semibold tracking-tight">Featul</span>
            </Link>

            <nav
              className={cn(
                "hidden items-center text-sm font-medium md:ml-auto md:flex",
                isFloated ? "gap-4" : "gap-6"
              )}
            >
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
                className={cn("h-full", isHomeOverlay && "bg-white/25")}
              />
            </div>

            <div className="hidden items-center gap-4 md:flex">
              {navigationConfig.auth.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-label={item.name}
                  className={cn(
                    "inline-flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors",
                    isHomeOverlay
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
                isHomeOverlay
                  ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
                  : "bg-muted"
              )}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <MenuIcon
                className={cn("size-5", isHomeOverlay ? "text-current" : "text-accent")}
              />
            </Button>
          </motion.div>
        </motion.div>
      </Container>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
