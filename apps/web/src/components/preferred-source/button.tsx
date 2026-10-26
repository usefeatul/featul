"use client";

import { useEffect } from "react";
import { Button } from "@featul/ui/components/button";
import { GoogleIcon } from "@featul/ui/icons/google";
import { cn } from "@featul/ui/lib/utils";

import {
  addPreferredSource,
  getPreferredSourceLang,
  getPreferredSourceTheme,
  initPreferredSource,
} from "@/lib/preferred-source";
import {
  openConsentDialog,
  useFunctionalityAllowed,
} from "@/components/legal/consent-state";

export const PREFERRED_SOURCE_BUTTON_LABEL = "Make us preferred on Google";

type PreferredSourceButtonProps = {
  className?: string;
};

export function PreferredSourceButton({
  className,
}: PreferredSourceButtonProps) {
  const allowed = useFunctionalityAllowed();

  useEffect(() => {
    if (!allowed) return;

    let lastTheme: string | null = null;
    let lastLang: string | null = null;

    const sync = () => {
      const theme = getPreferredSourceTheme(document.documentElement);
      const lang = getPreferredSourceLang(document.documentElement);
      if (theme === lastTheme && lang === lastLang) return;
      lastTheme = theme;
      lastLang = lang;
      initPreferredSource({ theme, lang });
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "lang"],
    });

    return () => observer.disconnect();
  }, [allowed]);

  return (
    <Button
      type="button"
      variant="default"
      size="sm"
      className={cn("font-heading text-xs", className)}
      onClick={() => (allowed ? addPreferredSource() : openConsentDialog())}
    >
      {/* White chip keeps the blue segment of the logo visible on bg-primary. */}
      <span className="flex size-4.5 shrink-0 items-center justify-center rounded-[5px] bg-white">
        <GoogleIcon className="size-3.5" />
      </span>
      {PREFERRED_SOURCE_BUTTON_LABEL}
    </Button>
  );
}
