"use client";

import { useEffect } from "react";
import { useConsent, useExplicitChoice, useSetActiveUI } from "c15t/next";
import { Button } from "@featul/ui/components/button";
import { GoogleIcon } from "@featul/ui/icons/google";
import { cn } from "@featul/ui/lib/utils";

import {
  addPreferredSource,
  getPreferredSourceLang,
  getPreferredSourceTheme,
  initPreferredSource,
} from "@/lib/preferred-source";

export const PREFERRED_SOURCE_BUTTON_LABEL = "Make us preferred on Google";

type PreferredSourceButtonProps = {
  className?: string;
};

export function PreferredSourceButton({
  className,
}: PreferredSourceButtonProps) {
  const permission = useConsent("functionality");
  const choice = useExplicitChoice();
  const allowed =
    permission && choice?.categories.functionality?.value === true;
  const setActiveUI = useSetActiveUI();

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
      variant="card"
      size="sm"
      className={cn("font-heading text-xs", className)}
      onClick={() => (allowed ? addPreferredSource() : setActiveUI("dialog"))}
    >
      <GoogleIcon className="size-3.5 grayscale" />
      {PREFERRED_SOURCE_BUTTON_LABEL}
    </Button>
  );
}
