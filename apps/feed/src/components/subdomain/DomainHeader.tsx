"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@oreilla/ui/components/button";
import { cn } from "@oreilla/ui/lib/utils";
import { MobileBoardsMenu } from "./MobileBoardsMenu";
import { HomeIcon } from "@oreilla/ui/icons/home";
import React from "react";
import SubdomainUserDropdown from "@/components/subdomain/SubdomainUserDropdown";
import { client } from "@oreilla/api/client";
import NotificationsBell from "./NotificationsBell";

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
  initialUser?: { name?: string; email?: string; image?: string | null } | null;
}) {
  const pathname = usePathname() || "";
  const feedbackBase = `/`;
  const roadmapBase = `/roadmap`;
  const changelogBase = `/changelog`;
  const isFeedback = pathname === "/" || pathname.startsWith("/board") || pathname.startsWith("/p/");
  const isRoadmap = pathname.startsWith(roadmapBase);
  const isChangelog = pathname.startsWith(changelogBase);
  const [user] = React.useState<{
    name?: string;
    email?: string;
    image?: string | null;
  } | null>(initialUser ?? null);
  const roadmapVisible = Boolean(initialRoadmapVisible);
  const [changelogVisible, setChangelogVisible] = React.useState(
    Boolean(initialChangelogVisible)
  );
  const itemCls = (active: boolean) =>
    cn(
      "rounded-md border px-3 py-2 group",
      active
        ? "bg-background/50 border-accent/20"
        : "border-transparent hover:bg-muted"
    );
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await client.changelog.visible.$get({ slug: subdomain });
        const d = await res.json();
        if (active) setChangelogVisible(Boolean((d as any)?.visible));
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, []);
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/start`;
  return (
    <header className={cn("py-3 sm:py-5")}>
      <div className="md:hidden grid grid-cols-[1fr_auto_1fr] items-center w-full">
        <div className="justify-self-start">
          <MobileBoardsMenu
            slug={workspace.slug}
            subdomain={subdomain}
            roadmapVisible={roadmapVisible}
            changelogVisible={changelogVisible}
          />
        </div>
        <div className="inline-flex items-center justify-center justify-self-center">
          <Link href="/" aria-label="Home">
            {workspace.logo ? (
              <Image
                src={workspace.logo}
                alt={workspace.name}
                width={32}
                height={32}
                className="rounded-sm object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-sm bg-muted flex items-center justify-center text-md font-semibold">
                {workspace.name?.[0]?.toUpperCase()}
              </div>
            )}
          </Link>
        </div>
        <div className="flex items-center gap-2 justify-self-end">
          <NotificationsBell  />
          <Button asChild size="xs" variant="nav" aria-label="Dashboard">
            <Link href={dashboardUrl} className="group inline-flex items-center">
              <HomeIcon
                className={cn(
                  "opacity-90 text-accent rounded-sm size-5.5 p-0.5 group-hover:bg-primary group-hover:text-primary-foreground"
                )}
              />
            </Link>
          </Button>
          <SubdomainUserDropdown subdomain={subdomain} initialUser={user || null} />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-1 w-full">
        <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <Image
            src={workspace.logo || ""}
            alt={workspace.name}
            width={32}
            height={32}
            className="rounded-sm object-cover"
          />
          <div className="text-md font-medium">{workspace.name}</div>
        </Link>
        <span className="mx-2 text-accent" aria-hidden>
          |
        </span>

        <nav className="flex-1">
          <ul className="flex items-center gap-3 text-sm">
            <li>
              <Link
                href={feedbackBase}
                className={itemCls(isFeedback)}
                aria-current={isFeedback ? "page" : undefined}
              >
                Feedback
              </Link>
            </li>
            <li>
              {roadmapVisible ? (
                <Link
                  href={roadmapBase}
                  className={itemCls(isRoadmap)}
                  aria-current={isRoadmap ? "page" : undefined}
                >
                  Roadmap
                </Link>
              ) : null}
            </li>
            <li>
              {changelogVisible ? (
                <Link
                  href={changelogBase}
                  className={itemCls(isChangelog)}
                  aria-current={isChangelog ? "page" : undefined}
                >
                  Changelog
                </Link>
              ) : null}
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <NotificationsBell />
          <Button asChild size="xs" variant="nav">
            <Link href={dashboardUrl}>Dashboard</Link>
          </Button>
          <SubdomainUserDropdown subdomain={subdomain} initialUser={user || null} />
        </div>
      </div>
    </header>
  );
}
