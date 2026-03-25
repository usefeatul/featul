"use client";

import type { ReactNode } from "react";
import {
  ConsentManagerDialog,
  type ConsentManagerOptions,
  ConsentManagerProvider,
  CookieBanner,
} from "@c15t/nextjs/client";

type MarketingConsentManagerProps = {
  children: ReactNode;
};

type ConsentTheme = NonNullable<NonNullable<ConsentManagerOptions["react"]>["theme"]>;

const primaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50";

const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50";

const consentTheme: ConsentTheme = {
  "banner.root": "fixed inset-x-0 bottom-0 z-[70] px-3 pb-3 sm:px-6 sm:pb-6",
  "banner.card":
    "mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-background/95 text-foreground shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/88",
  "banner.header.root": "space-y-2 px-5 pt-5 sm:px-6 sm:pt-6",
  "banner.header.title": "font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl",
  "banner.header.description": "max-w-3xl text-sm leading-6 text-accent",
  "banner.header.legal-links": "flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs sm:text-sm",
  "banner.header.legal-links.link": "text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary",
  "banner.footer":
    "flex flex-col gap-3 border-t border-border/70 bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
  "banner.footer.sub-group": "flex flex-1 flex-wrap gap-2",
  "banner.footer.reject-button": secondaryButtonClassName,
  "banner.footer.customize-button": secondaryButtonClassName,
  "banner.footer.accept-button": primaryButtonClassName,
  "banner.overlay": "bg-black/30 backdrop-blur-[2px]",
  "dialog.root": "fixed inset-0 z-[80] grid items-end p-0 sm:place-items-center sm:p-6",
  "dialog.card":
    "w-full max-w-3xl overflow-hidden rounded-t-[1.75rem] border border-border bg-background text-foreground shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:rounded-2xl",
  "dialog.header": "space-y-2 border-b border-border/70 px-5 py-5 sm:px-6",
  "dialog.title": "font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl",
  "dialog.description": "max-w-2xl text-sm leading-6 text-accent",
  "dialog.content": "px-5 py-5 sm:px-6",
  "dialog.footer":
    "flex flex-col gap-3 border-t border-border/70 bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
  "dialog.legal-links": "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm",
  "dialog.legal-links.link": "text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary",
  "dialog.overlay": "bg-black/45 backdrop-blur-sm",
  "widget.root": "space-y-4 text-foreground",
  "widget.footer": "flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between",
  "widget.footer.sub-group": "flex flex-1 flex-wrap gap-2",
  "widget.footer.reject-button": secondaryButtonClassName,
  "widget.footer.accept-button": primaryButtonClassName,
  "widget.footer.customize-button": secondaryButtonClassName,
  "widget.footer.save-button": primaryButtonClassName,
  "widget.accordion": "space-y-3",
  "widget.accordion.item": "overflow-hidden rounded-xl border border-border bg-card/70",
  "widget.accordion.trigger":
    "w-full px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
  "widget.accordion.trigger-inner": "flex items-start justify-between gap-3",
  "widget.accordion.icon": "text-primary",
  "widget.accordion.arrow.open": "text-primary",
  "widget.accordion.arrow.close": "text-accent",
  "widget.accordion.content": "border-t border-border/70",
  "widget.accordion.content-inner": "space-y-3 px-4 py-4 text-sm leading-6 text-accent",
  "widget.switch": "data-[state=checked]:text-primary-foreground",
  "widget.switch.track":
    "h-6 w-11 rounded-full border border-border bg-muted transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary",
  "widget.switch.thumb":
    "block size-5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-5",
  "widget.legal-links": "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm",
  "widget.legal-links.link": "text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary",
};

export default function MarketingConsentManager({
  children,
}: MarketingConsentManagerProps) {
  if (!process.env.NEXT_PUBLIC_C15T_URL) {
    return <>{children}</>;
  }

  return (
    <ConsentManagerProvider
      options={{
        mode: "c15t",
        backendURL: "/api/c15t",
        consentCategories: ["necessary", "marketing"],
        ignoreGeoLocation: process.env.NODE_ENV !== "production",
        react: {
          theme: consentTheme,
        },
      }}
    >
      {children}
      <CookieBanner />
      <ConsentManagerDialog />
    </ConsentManagerProvider>
  );
}
