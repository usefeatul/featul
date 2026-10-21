"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import { MobileBoardsMenu } from "./MobileBoardsMenu";
import React from "react";
import SubdomainUserDropdown from "@/components/subdomain/SubdomainUserDropdown";
import { client } from "@featul/api/client";
import NotificationsBell from "./NotificationsBell";
import SubdomainAuthModal from "./SubdomainAuthModal";
import { SearchAction } from "./SearchAction";
import { ThemeToggle } from "./ThemeToggle";
import { useSession } from "@featul/auth/client";
import type { AuthUser } from "@/types/auth";
import { hasAuthUser } from "@/utils/auth";
import { useSubdomainAuthModal } from "@/hooks/useSubdomainAuthModal";
import { getWorkspaceDashboardUrl } from "@/utils/urls";
import { Container } from "@/components/global/container";
import type { PortalMaxWidth } from "./SubdomainLayoutShell";

type WorkspaceInfo = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo: string | null;
};

export const navLinkClass =
  "relative inline-flex h-full items-center px-3 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity hover:text-foreground";

export function DomainHeader({
  workspace,
  subdomain,
  changelogVisible: initialChangelogVisible = true,
  roadmapVisible: initialRoadmapVisible = true,
  helpVisible = false,
  initialUser,
  maxWidth = "7xl",
}: {
  workspace: WorkspaceInfo;
  subdomain: string;
  changelogVisible?: boolean;
  roadmapVisible?: boolean;
  helpVisible?: boolean;
  initialUser?: AuthUser | null;
  maxWidth?: PortalMaxWidth;
}) {
  const pathname = usePathname() || "";
  const isRoadmap = pathname.startsWith("/roadmap");
  const isChangelog = pathname.startsWith("/changelog");
  const isHelp = pathname === "/help" || pathname.startsWith("/help/");
  const isFeedback = !isRoadmap && !isChangelog && !isHelp;
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
    { href: "/", label: "Feedback", active: isFeedback, visible: true },
    { href: "/roadmap", label: "Roadmap", active: isRoadmap, visible: roadmapVisible },
    { href: "/changelog", label: "Changelog", active: isChangelog, visible: changelogVisible },
    { href: "/help", label: "Help", active: isHelp, visible: helpVisible },
  ].filter((x) => x.visible);

  const brand = (
    <Link
      href="/"
      aria-label="Home"
      className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-90"
    >
      {workspace.logo ? (
        <Image
          src={workspace.logo}
          alt={workspace.name}
          width={32}
          height={32}
          className="size-8 rounded-lg object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
        >
          {workspace.name?.[0]?.toUpperCase()}
        </span>
      )}
      <span className="truncate text-[15px] font-semibold tracking-tight">
        {workspace.name}
      </span>
    </Link>
  );

  const mobileAuthActions = isSignedIn ? (
    <>
      <NotificationsBell
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-foreground dark:bg-transparent"
      />
      <SubdomainUserDropdown subdomain={workspace.slug} initialUser={user || null} />
    </>
  ) : (
    <Button size="sm" className="px-3" onClick={() => openAuth("sign-in")}>
      Sign in
    </Button>
  );

  const authActions = isSignedIn ? (
    <>
      <NotificationsBell
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-foreground dark:bg-transparent"
      />
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="hidden text-muted-foreground hover:text-foreground md:inline-flex dark:bg-transparent"
      >
        <Link href={dashboardUrl} target="_blank" rel="noopener noreferrer">
          Dashboard
        </Link>
      </Button>
      <SubdomainUserDropdown subdomain={workspace.slug} initialUser={user || null} />
    </>
  ) : (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="text-muted-foreground hover:text-foreground dark:bg-transparent"
        onClick={() => openAuth("sign-in")}
      >
        Sign in
      </Button>
      <Button size="sm" className="px-3" onClick={() => openAuth("sign-up")}>
        Sign up
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md dark:border-white/[0.07]">
      <Container maxWidth={maxWidth} className="flex h-14 w-full items-center gap-3">
        {/* Mobile: menu, brand, actions */}
        <div className="flex w-full items-center gap-2 md:hidden">
          <MobileBoardsMenu
            slug={workspace.slug}
            subdomain={subdomain}
            roadmapVisible={roadmapVisible}
            changelogVisible={changelogVisible}
            helpVisible={helpVisible}
          />
          <div className="min-w-0 flex-1">{brand}</div>
          <SearchAction slug={workspace.slug} appearance="toolbar" className="rounded-lg px-2" />
          <ThemeToggle />
          {mobileAuthActions}
        </div>

        {/* Desktop */}
        <div className="hidden h-full w-full items-center gap-6 md:flex">
          {brand}
          <nav className="flex h-full items-center" aria-label="Portal">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  navLinkClass,
                  item.active
                    ? "text-foreground after:opacity-100"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="hidden w-56 lg:block">
              <SearchAction slug={workspace.slug} appearance="field" className="h-8.5" />
            </div>
            <SearchAction slug={workspace.slug} appearance="toolbar" className="rounded-lg px-2 lg:hidden" />
            <ThemeToggle />
            {authActions}
          </div>
        </div>
      </Container>
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
