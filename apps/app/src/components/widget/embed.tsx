"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { FeatulWidgetApi } from "@featul/widget";
import { client } from "@featul/api/client";
import { useSession } from "@featul/auth/client";
import { parseIdentifiedUser } from "./load";
import { WidgetHostImageDialog } from "./lightbox";

/**
 * Local / staging QA helper. Prefers NEXT_PUBLIC_WIDGET_TEST_PROJECT_ID,
 * then NEXT_PUBLIC_FEATUL_WORKSPACE_ID. Empty disables the launcher.
 */
const TEST_WIDGET_PROJECT_ID =
  process.env.NEXT_PUBLIC_WIDGET_TEST_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FEATUL_WORKSPACE_ID ||
  "";

export default function WidgetTestEmbed() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const initializedRef = useRef(false);
  const refreshTimerRef = useRef<number | null>(null);

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
      script.src = `${window.location.origin}/widget/sdk/v1.js${
        process.env.NODE_ENV === "development" ? `?local=${Date.now()}` : ""
      }`;
      script.dataset.featulWidget = "true";
      document.head.appendChild(script);
    }

    if (!initializedRef.current) {
      window.featul?.init(TEST_WIDGET_PROJECT_ID, {
        widget: true,
        theme: "light",
        position: "right",
      });
      initializedRef.current = true;
    }
  }, [pathname]);

  useEffect(() => {
    if (!TEST_WIDGET_PROJECT_ID) return;
    if (pathname?.startsWith("/widget")) return;
    if (typeof window === "undefined") return;
    if (isPending) return;

    let canceled = false;

    const clearRefreshTimer = () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };

    const applyIdentity = (user: ReturnType<typeof parseIdentifiedUser>) => {
      window.featul?.identify(user);
    };

    const refreshIdentity = async () => {
      clearRefreshTimer();
      try {
        if (!session?.user) {
          applyIdentity(null);
          return;
        }

        const identityClient =
          process.env.NODE_ENV === "production"
            ? client.widget.sessionIdentity
            : client.widget.devIdentity;
        const response = await identityClient.$get({
          projectId: TEST_WIDGET_PROJECT_ID,
        });
        if (!response.ok) {
          applyIdentity(null);
          return;
        }

        const data = await response.json();
        if (canceled) return;

        const user = parseIdentifiedUser(
          data && typeof data === "object" && "user" in data ? data.user : null,
        );
        if (user) {
          applyIdentity(user);
          refreshTimerRef.current = window.setTimeout(
            refreshIdentity,
            Math.max(30_000, (user.expiresAt - 60) * 1000 - Date.now()),
          );
          return;
        }

        applyIdentity(null);
      } catch {
        if (!canceled) applyIdentity(null);
      }
    };

    const onReady = () => {
      void refreshIdentity();
    };

    window.featul?.on("ready", onReady);
    void refreshIdentity();

    return () => {
      canceled = true;
      clearRefreshTimer();
      window.featul?.off("ready", onReady);
    };
  }, [isPending, pathname, session?.user?.id]);

  if (pathname?.startsWith("/widget")) return null;

  return <WidgetHostImageDialog />;
}
