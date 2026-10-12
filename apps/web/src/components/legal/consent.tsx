"use client";

import type { ReactNode } from "react";
import { buttonVariants } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import { writeAnalyticsConsent } from "@featul/ui/lib/consent";
import {
  ConsentDialog,
  type ConsentManagerOptions,
  ConsentManagerProvider,
  ConsentBanner,
} from "@c15t/nextjs";

type MarketingConsentManagerProps = {
  children: ReactNode;
};

type ConsentTheme = NonNullable<NonNullable<ConsentManagerOptions["theme"]>["slots"]>;

const primaryButtonClassName = cn(
  buttonVariants({ variant: "default", size: "lg" }),
  "min-h-10 px-4 py-2",
);

const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50";

const consentTheme: ConsentTheme = {
  consentBanner: "fixed inset-x-0 bottom-0 z-[70] px-3 pb-3 sm:px-6 sm:pb-6",
  consentBannerCard: "mx-auto max-w-4xl rounded-2xl border border-border bg-background text-foreground shadow-xl",
  consentDialogCard: "rounded-2xl border border-border bg-background text-foreground shadow-xl",
  buttonPrimary: primaryButtonClassName,
  buttonSecondary: secondaryButtonClassName,
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
        mode: "hosted",
        backendURL: "/api/c15t",
        consentCategories: ["necessary", "measurement", "marketing"],
        callbacks: {
          onConsentSet: ({ preferences }) => {
            if (preferences.measurement !== true) writeAnalyticsConsent("denied");
          },
          // Only explicit saves count; initialization/region defaults cannot opt users in.
          onConsentChanged: ({ preferences }) => writeAnalyticsConsent(preferences.measurement === true ? "granted" : "denied"),
        },
        overrides: process.env.NODE_ENV !== "production" ? { country: "GB" } : undefined,
        theme: { slots: consentTheme },
      }}
    >
      {children}
      <ConsentBanner />
      <ConsentDialog />
    </ConsentManagerProvider>
  );
}
