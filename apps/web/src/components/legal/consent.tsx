"use client";

import { useMemo, type ReactNode } from "react";
import { buttonVariants } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import { scripts } from "@/lib/scripts";
import {
  ConsentDialog,
  ConsentDialogLink,
  type ConsentProviderOptions,
  ConsentProvider as Provider,
  ConsentBanner,
  useConsents,
  useExplicitChoice,
} from "c15t/next";
import { hosted } from "c15t/react";
import { useScriptLoader } from "c15t/react/module-hooks/script-loader";

type ConsentProviderProps = {
  children: ReactNode;
};

type ConsentTheme = NonNullable<
  NonNullable<ConsentProviderOptions["theme"]>["slots"]
>;

const primaryButtonClassName = cn(
  buttonVariants({ variant: "default", size: "lg" }),
  "min-h-10 px-4 py-2",
);

const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50";

const consentTheme: ConsentTheme = {
  consentBanner: "fixed inset-x-0 bottom-0 z-[70] px-3 pb-3 sm:px-6 sm:pb-6",
  consentBannerCard:
    "mx-auto max-w-4xl rounded-2xl border border-border bg-background text-foreground shadow-xl",
  consentDialogCard:
    "rounded-2xl border border-border bg-background text-foreground shadow-xl",
  buttonPrimary: primaryButtonClassName,
  buttonSecondary: secondaryButtonClassName,
};

// A regional opt-out policy can permit a category without a recorded choice.
// Featul still waits for an explicit grant; c15t remains the only script loader.
function ConsentScripts() {
  const choices = useExplicitChoice();
  const permissions = useConsents();
  const allowedScripts = useMemo(
    () =>
      scripts.filter(
        ({ category }) =>
          permissions[category] &&
          choices?.categories[category]?.value === true,
      ),
    [choices, permissions],
  );
  useScriptLoader(allowedScripts);
  return null;
}

export default function ConsentProvider({ children }: ConsentProviderProps) {
  return (
    <Provider
      options={{
        mode: hosted({
          backendURL:
            process.env.NEXT_PUBLIC_C15T_URL ||
            "https://featul-daly-jean-111nte1o.inth.app/",
        }),
        consentCategories: ["necessary", "measurement", "functionality"],
        reloadOnConsentRevoked: true,
        i18n: {
          messages: {
            en: {
              cookieBanner: {
                title: "Your privacy choices",
                description:
                  "Choose whether to allow Seline analytics and Google preferred-source features. Optional services stay off until you allow them. We store your choice so you can change it later.",
              },
              consentTypes: {
                measurement: {
                  title: "Analytics",
                  description:
                    "Allow Seline to measure visits and help us improve Featul.",
                },
                functionality: {
                  title: "Google preferred source",
                  description:
                    "Allow Google's publisher tools so you can make Featul a preferred source on Google.",
                },
              },
            },
          },
        },
        legalLinks: {
          privacyPolicy: { href: "/privacy", label: "Privacy policy" },
        },
        theme: { slots: consentTheme },
      }}
    >
      <ConsentScripts />
      {children}
      <ConsentBanner />
      <ConsentDialog />
      <ConsentDialogLink className="fixed bottom-3 left-3 z-50 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground shadow-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        Privacy choices
      </ConsentDialogLink>
    </Provider>
  );
}
