"use client";

import * as React from "react";
import { Button } from "@featul/ui/components/button";
import { raisedSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { MoonIcon, SearchIcon, SunIcon } from "@/components/global/icons";
import { ShortcutKey } from "@/components/global/keys";
import { Container } from "@/components/global/container";
import { navLinkClass } from "@/components/subdomain/DomainHeader";
import { DomainBrandingProvider } from "@/components/subdomain/DomainBrandingProvider";
import { PortalDataProvider } from "@/components/subdomain/PortalDataProvider";
import { SubdomainListLayout } from "@/components/subdomain/SubdomainListLayout";
import { FeedbackListHeader } from "@/components/subdomain/FeedbackListHeader";
import { SubdomainListCard } from "@/components/subdomain/SubdomainListCard";
import { SubdomainListItems } from "@/components/subdomain/SubdomainListItems";
import { layoutMaxWidth } from "@/components/subdomain/SubdomainLayoutShell";
import PostCard from "@/components/subdomain/PostCard";
import type { SubdomainLayoutData } from "@/app/[subdomain]/data";
import type { RequestItemData } from "@/types/request";

/** Desktop width the portal is laid out at before being scaled into the frame. */
const PAGE_WIDTH = 1024;
/** Slice of the page that spans the frame; the rest (right rail) crops off. */
const VISIBLE_WIDTH = 860;
/** Skip part of the container's left gutter so the content starts near the edge. */
const OFFSET_X = 24;

/** Scale factor that fits VISIBLE_WIDTH of the page into the measured frame. */
function useFitScale(ref: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(entry.contentRect.width / VISIBLE_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return scale;
}

/** Static copy of the portal header: brand, section tabs, search, auth. */
function PortalHeader({
  name,
  logo,
  maxWidth,
  roadmapVisible,
  changelogVisible,
  helpVisible,
}: {
  name: string;
  logo?: string | null;
  maxWidth: ReturnType<typeof layoutMaxWidth>;
  roadmapVisible: boolean;
  changelogVisible: boolean;
  helpVisible: boolean;
}) {
  const navItems = [
    { label: "Feedback", visible: true },
    { label: "Roadmap", visible: roadmapVisible },
    { label: "Changelog", visible: changelogVisible },
    { label: "Help", visible: helpVisible },
  ].filter((item) => item.visible);

  return (
    <header className="border-b border-border/60 bg-background/85 dark:border-white/[0.07]">
      <Container
        maxWidth={maxWidth}
        className="flex h-14 w-full items-center gap-6"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {logo ? (
            <img src={logo} alt="" className="size-8 rounded-lg object-cover" />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate text-[15px] font-semibold tracking-tight">
            {name}
          </span>
        </span>
        <nav className="flex h-full items-center">
          {navItems.map((item, index) => (
            <span
              key={item.label}
              className={cn(
                navLinkClass,
                index === 0
                  ? "text-foreground after:opacity-100"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="card"
            size="icon-sm"
            className={cn(
              raisedSurfaceClass,
              "h-8.5 w-56 justify-start gap-2.5 px-3.5 text-sm font-normal text-muted-foreground",
            )}
          >
            <SearchIcon className="size-4" size={16} />
            <span className="min-w-0 truncate text-left">
              Search feedback…
            </span>
            <span className="ml-auto inline-flex shrink-0 items-center gap-1">
              <ShortcutKey>⌘</ShortcutKey>
              <ShortcutKey>K</ShortcutKey>
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground dark:bg-transparent"
          >
            <MoonIcon className="size-4 dark:hidden" />
            <SunIcon className="hidden size-4 dark:block" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground dark:bg-transparent"
          >
            Sign in
          </Button>
          <Button size="sm" className="px-3">
            Sign up
          </Button>
        </div>
      </Container>
    </header>
  );
}

/** Live, scaled-down replica of the public board built from the portal's own components. */
export default function BoardPreview({
  name,
  slug,
  logo,
  displayUrl,
  posts,
  portal,
}: {
  name: string;
  slug: string;
  logo?: string | null;
  displayUrl: string;
  posts: RequestItemData[];
  portal: SubdomainLayoutData | null;
}) {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const scale = useFitScale(frameRef);
  const branding = portal?.branding;
  const maxWidth = layoutMaxWidth(branding?.layoutStyle);
  const sidebarPosition = branding?.sidebarPosition ?? "right";
  const boards = portal?.boards ?? [];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-t-xl border border-b-0 border-black/10 bg-background shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.35)] dark:border-white/10">
      <div className="flex items-center gap-3 border-b border-border/50 px-3 py-2 dark:border-white/8">
        <span className="flex gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/25" />
          <span className="size-2 rounded-full bg-muted-foreground/25" />
          <span className="size-2 rounded-full bg-muted-foreground/25" />
        </span>
        <span className="mx-auto min-w-0 truncate rounded-md bg-muted/60 px-3 py-0.5 text-[10px] text-accent dark:bg-white/5">
          {displayUrl}
        </span>
        <span className="w-[2.375rem]" />
      </div>
      <div
        ref={frameRef}
        inert
        className="pointer-events-none relative min-h-0 flex-1 select-none overflow-hidden"
      >
        <div
          className={cn(
            "absolute left-0 top-0 origin-top-left bg-background text-foreground",
            scale === 0 && "invisible",
          )}
          style={{ width: PAGE_WIDTH, transform: `scale(${scale}) translateX(-${OFFSET_X}px)` }}
        >
          <DomainBrandingProvider
            hidePoweredBy={Boolean(branding?.hidePoweredBy)}
            sidebarPosition={sidebarPosition}
            subdomain={slug}
          >
            <PortalDataProvider
              value={{
                subdomain: slug,
                workspaceName: name,
                boards,
                statusCounts: portal?.statusCounts ?? {
                  pending: 0,
                  review: 0,
                  planned: 0,
                  progress: 0,
                  completed: 0,
                  closed: 0,
                },
                totalPosts: portal?.totalPosts ?? 0,
                changelogCount: portal?.changelogCount ?? 0,
                roadmapVisible: portal?.roadmapVisible ?? false,
                changelogVisible: portal?.changelogVisible ?? false,
                helpVisible: portal?.helpVisible ?? false,
              }}
            >
              <PortalHeader
                name={name}
                logo={logo}
                maxWidth={maxWidth}
                roadmapVisible={portal?.roadmapVisible ?? false}
                changelogVisible={portal?.changelogVisible ?? false}
                helpVisible={portal?.helpVisible ?? false}
              />
              <Container maxWidth={maxWidth} className="w-full py-8">
                <SubdomainListLayout
                  subdomain={slug}
                  slug={slug}
                  sidebarPosition={sidebarPosition}
                  initialBoards={boards}
                >
                  <div>
                    <FeedbackListHeader />
                    <SubdomainListCard className="border-t-0">
                      <SubdomainListItems>
                        {posts.map((post) => (
                          <PostCard
                            key={post.id}
                            item={{ ...post, hasVoted: false }}
                            hidePublicMemberIdentity={
                              boards.find((b) => b.slug === post.boardSlug)
                                ?.hidePublicMemberIdentity ?? false
                            }
                          />
                        ))}
                      </SubdomainListItems>
                    </SubdomainListCard>
                  </div>
                </SubdomainListLayout>
              </Container>
            </PortalDataProvider>
          </DomainBrandingProvider>
        </div>
      </div>
    </div>
  );
}
