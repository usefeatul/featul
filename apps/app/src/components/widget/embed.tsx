"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { FeatulWidgetApi } from "@featul/widget";
import { client } from "@featul/api/client";
import { useSession } from "@featul/auth/client";
import { WidgetHostImageDialog } from "./lightbox";

/**
 * Local QA helper for testing the embed in this app.
 * Override with NEXT_PUBLIC_WIDGET_TEST_PROJECT_ID if needed.
 */
const TEST_WIDGET_PROJECT_ID =
  process.env.NEXT_PUBLIC_WIDGET_TEST_PROJECT_ID ||
  "fll7aoyb3a8wpq77rcvzs0qcmu";

export default function WidgetTestEmbed() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!TEST_WIDGET_PROJECT_ID) return;
    if (pathname?.startsWith("/widget")) return;
    if (typeof window === "undefined") return;

    window.$featulq = window.$featulq || [];
    window.featul =
      window.featul ||
      (new Proxy(
        {},
        {
          get:
            (_target, method) =>
            (...args: unknown[]) =>
              window.$featulq?.push([method, ...args]),
        },
      ) as FeatulWidgetApi);

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-featul-widget="true"]',
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `${window.location.origin}/widget/sdk/v1.js`;
      script.dataset.featulWidget = "true";
      document.head.appendChild(script);
    }

    window.featul?.destroy?.();
    window.featul?.init(TEST_WIDGET_PROJECT_ID, {
      widget: true,
      theme: "auto",
      position: "right",
    });

    if (isPending) return;
    if (!session?.user) {
      window.featul?.identify(null);
      return;
    }

    let canceled = false;
    void client.widget.sessionIdentity
      .$get({ projectId: TEST_WIDGET_PROJECT_ID })
      .then((response) => response.json())
      .then((data) => {
        if (canceled || !data || typeof data !== "object" || !("user" in data)) return;
        const user = data.user;
        if (user && typeof user === "object" && "id" in user && "email" in user) {
          window.featul?.identify(user as Parameters<FeatulWidgetApi["identify"]>[0]);
        }
      })
      .catch(() => {
        if (!canceled) window.featul?.identify(null);
      });

    return () => {
      canceled = true;
    };
  }, [isPending, pathname, session?.user]);

  if (pathname?.startsWith("/widget")) return null;

  return <WidgetHostImageDialog />;
}
