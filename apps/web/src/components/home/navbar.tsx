"use client";

import { MenuIcon } from "@/components/global/icons";
import Link from "next/link";
import { APP_URL } from "@/config/auth";
import { navigationConfig } from "@/config/homeNav";
import { MarketingContainer } from "@/components/layout/container";
import { cn } from "@featul/ui/lib/utils";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Button } from "@featul/ui/components/button";
import FeatulLogoIcon from "@featul/ui/icons/featul-logo";
import {
  getCreateBandBounds,
  writeNavOverCreate,
} from "@/components/home/scroll-restoration";
import { MobileMenu } from "./menu";
import { DitherBackdrop } from "./backdrop";

const FALLBACK_NAV_HEIGHT = 64;
const HIDDEN_CLIP = "inset(100% 0 0 0)";

const createBandNavVars = {
  "--background": "var(--marketing-create-band)",
  "--foreground": "oklch(99.700% 0.00105 11.528)",
  "--accent": "color-mix(in oklab, white 82%, var(--marketing-create-band))",
  "--card": "color-mix(in oklab, white 14%, var(--marketing-create-band))",
  "--border": "color-mix(in oklab, white 22%, var(--marketing-create-band))",
  "--muted": "color-mix(in oklab, white 16%, var(--marketing-create-band))",
} as CSSProperties;

const linkTone =
  "font-light text-accent hover:text-foreground hover:bg-card hover:ring-1 hover:ring-border";

function clipCreateOverlap(
  navHeight: number,
  band: ReturnType<typeof getCreateBandBounds>,
) {
  if (!band) return HIDDEN_CLIP;
  if (band.bottom <= 0 || band.top >= navHeight) return HIDDEN_CLIP;
  const top = Math.max(0, Math.round(band.top));
  const bottom = Math.min(navHeight, Math.round(band.bottom));
  if (bottom <= 0 || top >= navHeight) return HIDDEN_CLIP;
  return `inset(${top}px 0 ${navHeight - bottom}px 0)`;
}

type NavbarFrameProps = {
  scrolled: boolean;
  decorative?: boolean;
  onMenuClick?: () => void;
};

function NavbarFrame({
  scrolled,
  decorative = false,
  onMenuClick,
}: NavbarFrameProps) {
  const main = navigationConfig.main;

  return (
    <>
      {scrolled && !decorative ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-background"
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
          {decorative ? (
            <div className="relative z-10 inline-flex shrink-0 items-center gap-2 text-foreground">
              <FeatulLogoIcon size={26} />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Featul
              </span>
            </div>
          ) : (
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
          )}

          <nav
            aria-label={decorative ? undefined : "Primary"}
            className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex"
          >
            <div
              className={cn(
                "flex items-center gap-6 text-sm",
                !decorative && "pointer-events-auto",
              )}
            >
              {main.map((item) =>
                decorative ? (
                  <span
                    key={item.name}
                    className="inline-flex h-8 items-center rounded-md px-2 font-light text-accent"
                  >
                    {item.name}
                  </span>
                ) : (
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
                ),
              )}
            </div>
          </nav>

          <div className="relative z-10 flex shrink-0 items-center">
            <div className="hidden items-center gap-4 md:flex">
              {navigationConfig.auth.map((item) =>
                decorative ? (
                  <span
                    key={item.name}
                    className="inline-flex h-8 items-center rounded-md px-3 text-sm font-light text-accent"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-label={item.name}
                    className={cn(
                      "inline-flex h-8 items-center rounded-md px-3 text-sm transition-[background-color,box-shadow] duration-150",
                      linkTone,
                    )}
                  >
                    {item.name}
                  </Link>
                ),
              )}
              <Button
                asChild
                size="sm"
                variant="default"
                className="font-heading"
              >
                {decorative ? (
                  <span>Start for free</span>
                ) : (
                  <Link
                    href={APP_URL}
                    data-sln-event="cta: start for free clicked"
                  >
                    Start for free
                  </Link>
                )}
              </Button>
            </div>

            {decorative ? (
              <Button
                asChild
                variant="nav"
                className="inline-flex items-center justify-center rounded-md bg-muted md:hidden"
              >
                <span>
                  <MenuIcon className="size-5 text-accent!" />
                </span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="nav"
                aria-label="Toggle menu"
                data-nav-menu
                className="inline-flex items-center justify-center rounded-md bg-muted md:hidden"
                onClick={onMenuClick}
              >
                <MenuIcon className="size-5 text-accent" />
              </Button>
            )}
          </div>
        </div>
      </MarketingContainer>
    </>
  );
}

export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const createMaskRef = useRef<HTMLDivElement>(null);
  const createBackdropRef = useRef<HTMLDivElement>(null);

  const [scrolled, setScrolled] = useState(false);
  const [overCreate, setOverCreate] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useLayoutEffect(() => {
    const html = document.documentElement;
    let ticking = false;
    let lastScrolled = false;
    let lastOverCreate = false;

    const sync = () => {
      ticking = false;
      const navHeight = headerRef.current?.offsetHeight ?? FALLBACK_NAV_HEIGHT;
      const band = getCreateBandBounds();
      const clip = clipCreateOverlap(navHeight, band);
      const mask = createMaskRef.current;
      const nextOverCreate = clip !== HIDDEN_CLIP;

      if (band && createBackdropRef.current) {
        // Match the section's canvas size and offset so the texture joins
        // seamlessly across the fixed header while the page scrolls.
        createBackdropRef.current.style.height = `${band.bottom - band.top}px`;
        createBackdropRef.current.style.transform = `translateY(${band.top}px)`;
      }

      if (mask) {
        mask.style.clipPath = clip;
        html.removeAttribute("data-over-create");
        writeNavOverCreate(nextOverCreate);
      }

      const nextScrolled = window.scrollY > 0;

      if (nextScrolled !== lastScrolled) {
        lastScrolled = nextScrolled;
        setScrolled(nextScrolled);
        html.toggleAttribute("data-scrolled", nextScrolled);
      }
      if (nextOverCreate !== lastOverCreate) {
        lastOverCreate = nextOverCreate;
        setOverCreate(nextOverCreate);
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pagehide", sync);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pagehide", sync);
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

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-transparent"
        data-component="Navbar"
      >
        <NavbarFrame
          scrolled={scrolled}
          onMenuClick={() => setMobileOpen((open) => !open)}
        />
        {scrolled ? (
          <div
            aria-hidden
            data-nav-rule
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[0.5px] bg-border",
              overCreate && "opacity-0",
            )}
          />
        ) : null}
        <div
          ref={createMaskRef}
          aria-hidden
          data-nav-create-mask
          className="pointer-events-none absolute inset-0 z-20 overflow-hidden [clip-path:inset(100%_0_0_0)] [transform:translateZ(0)]"
        >
          <div
            ref={createBackdropRef}
            className="pointer-events-none absolute inset-x-0 top-0 isolate h-16"
          >
            <DitherBackdrop tone="dark" />
          </div>
          <NavbarFrame scrolled decorative />
        </div>
      </header>
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        overCreate={overCreate}
        style={overCreate ? createBandNavVars : undefined}
      />
    </>
  );
}
