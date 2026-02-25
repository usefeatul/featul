"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import { MobileBoardsMenu } from "./MobileBoardsMenu";
import { HomeIcon } from "@featul/ui/icons/home";
import React from "react";
import SubdomainUserDropdown from "@/components/subdomain/SubdomainUserDropdown";
import { client } from "@featul/api/client";
import NotificationsBell from "./NotificationsBell";
import SubdomainAuthModal from "./SubdomainAuthModal";
import { useSession } from "@featul/auth/client";
import type { AuthUser } from "@/types/auth";
import { hasAuthUser } from "@/utils/auth";
import { useSubdomainAuthModal } from "@/hooks/useSubdomainAuthModal";
import { getWorkspaceDashboardUrl } from "@/utils/app-urls";

type WorkspaceInfo = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo: string | null;
};

export function DomainHeader({
  workspace,
  subdomain,
  changelogVisible: initialChangelogVisible = true,
  roadmapVisible: initialRoadmapVisible = true,
  initialUser,
}: {
  workspace: WorkspaceInfo;
  subdomain: string;
  changelogVisible?: boolean;
  roadmapVisible?: boolean;
  initialUser?: AuthUser | null;
}) {
  const pathname = usePathname() || "";
  const feedbackBase = `/`;
  const roadmapBase = `/roadmap`;
  const changelogBase = `/changelog`;
  const isFeedback = pathname === "/" || pathname.startsWith("/board") || pathname.startsWith("/p/");
  const isRoadmap = pathname.startsWith(roadmapBase);
  const isChangelog = pathname.startsWith(changelogBase);
  const { data: session } = useSession();
  const sessionUser = session?.user ?? null;
  const user: AuthUser | null = sessionUser ?? initialUser ?? null;
  const isSignedIn = hasAuthUser(user);
  const roadmapVisible = Boolean(initialRoadmapVisible);
  const [changelogVisible, setChangelogVisible] = React.useState(
    Boolean(initialChangelogVisible)
  );
  const {
    isOpen: isAuthOpen,
    mode: authMode,
    redirectTo: authRedirect,
    setOpen: setAuthOpen,
    setMode: setAuthMode,
    openAuth,
  } = useSubdomainAuthModal();
  const navItemCls = (active: boolean) =>
    cn(
      "relative px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "text-foreground"
        : "text-muted-foreground hover:text-foreground"
    );
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await client.changelog.visible.$get({ slug: subdomain });
        const d = (await res.json()) as { visible?: boolean } | null;
        if (active) setChangelogVisible(Boolean(d?.visible));
      } catch {
        if (active) setChangelogVisible(false);
      }

    })();
    return () => {
      active = false;
    };
  }, [subdomain]);
  const dashboardUrl = getWorkspaceDashboardUrl(workspace.slug);
  React.useEffect(() => {
    if (isSignedIn && isAuthOpen) setAuthOpen(false);
  }, [isSignedIn, isAuthOpen, setAuthOpen]);

  const navItems = [
    { href: feedbackBase, label: "Feedback", active: isFeedback, visible: true },
    { href: roadmapBase, label: "Roadmap", active: isRoadmap, visible: roadmapVisible },
    { href: changelogBase, label: "Changelog", active: isChangelog, visible: changelogVisible },
  ].filter((x) => x.visible);

  const BrandMark = React.useCallback(
    ({
      size = "md",
      showName = true,
    }: {
      size?: "sm" | "md";
      showName?: boolean;
    }) => {
      const imageSize = size === "sm" ? 32 : 36;
      const fallbackSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
      const nameCls = size === "sm" ? "text-sm font-medium" : "text-md font-medium";
      const nameWrapCls =
        size === "sm" ? "hidden sm:inline max-w-40 truncate" : "max-w-56 truncate";

      return (
        <span className="inline-flex items-center gap-2">
          {workspace.logo ? (
            <Image
              src={workspace.logo}
              alt={workspace.name}
              width={imageSize}
              height={imageSize}
              className="rounded-md object-cover"
            />
          ) : (
            <span
              className={cn(
                fallbackSize,
                "rounded-md bg-muted flex items-center justify-center text-md font-semibold"
              )}
              aria-hidden
            >
              {workspace.name?.[0]?.toUpperCase()}
            </span>
          )}
          {showName ? (
            <span className={cn(nameCls, nameWrapCls)}>{workspace.name}</span>
          ) : null}
        </span>
      );
    },
    [workspace.logo, workspace.name]
  );

  return (
    <header className={cn("py-3 sm:py-5")}>
      <div className="md:hidden flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2">
          <MobileBoardsMenu
            slug={workspace.slug}
            subdomain={subdomain}
            roadmapVisible={roadmapVisible}
            changelogVisible={changelogVisible}
          />
        </div>
        <Link
          href="/"
          aria-label="Home"
          className="min-w-0 flex-1 flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <BrandMark size="sm" showName />
        </Link>
        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <>
              <NotificationsBell />
              <Button asChild size="xs" variant="nav" aria-label="Dashboard">
                <Link
                  href={dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center"
                >
                  <HomeIcon
                    className={cn(
                      "opacity-90 text-accent rounded-md size-5.5 p-0.5 group-hover:bg-primary group-hover:text-primary-foreground"
                    )}
                  />
                </Link>
              </Button>
              <SubdomainUserDropdown subdomain={workspace.slug} initialUser={user || null} />
            </>
          ) : (
            <>
              <Button size="xs" variant="nav" onClick={() => openAuth("sign-in")}>
                Sign in
              </Button>
              <Button size="xs" onClick={() => openAuth("sign-up")}>
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="hidden md:flex items-center justify-between gap-4 w-full">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          aria-label="Home"
        >
          <BrandMark size="md" />
        </Link>

        <nav className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navItemCls(item.active)}
                aria-current={item.active ? "page" : undefined}
              >
                {item.label}
                {item.active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <NotificationsBell />
              <Button asChild size="xs" variant="nav">
                <Link href={dashboardUrl} target="_blank" rel="noopener noreferrer">
                  Dashboard
                </Link>
              </Button>
              <SubdomainUserDropdown subdomain={workspace.slug} initialUser={user || null} />
            </>
          ) : (
            <>
              <Button size="xs" variant="nav" onClick={() => openAuth("sign-in")}>
                Sign in
              </Button>
              <Button size="xs" onClick={() => openAuth("sign-up")}>
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
      <SubdomainAuthModal
        open={isAuthOpen}
        onOpenChange={setAuthOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        redirectTo={authRedirect}
      />
    </header>
  );
}
