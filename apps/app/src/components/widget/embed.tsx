"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { FeatulWidgetApi } from "@featul/widget";

const TEST_WIDGET_PROJECT_ID = "flq2ec9qzax2btep9hc2eopynd";

export default function WidgetTestEmbed() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/widget")) return;
    if (typeof window === "undefined") return;

    window.$featulq = window.$featulq || [];
    window.featul =
      window.featul ||
      new Proxy(
        {},
        {
          get:
            (_target, method) =>
            (...args: unknown[]) =>
              window.$featulq?.push([method, ...args]),
        },
      ) as FeatulWidgetApi;

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-featul-widget="true"]',
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `${window.location.origin}/widget/sdk.js`;
      script.dataset.featulWidget = "true";
      document.head.appendChild(script);
    }

    window.featul.init(TEST_WIDGET_PROJECT_ID, {
      widget: true,
      theme: "auto",
      position: "right",
    });
  }, [pathname]);

  return null;
}
