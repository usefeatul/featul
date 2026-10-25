import { Container } from "@/components/global/container";
import { ScaledBackground } from "@/components/global/ScaledBackground";
import BrandVarsEffect from "@/components/global/BrandVarsEffect";
import Sidebar from "@/components/sidebar/Sidebar";
import MobileSidebar from "@/components/sidebar/MobileSidebar";
import { WorkspaceEvents } from "@/components/global/WorkspaceEvents";
import WorkspaceShortcutsDrawer from "@/components/global/WorkspaceShortcutsDrawer";
import {
  getBrandingColorsBySlug,
  getWorkspaceStatusCounts,
  getWorkspaceTimezoneBySlug,
  getWorkspaceBySlug,
  listUserWorkspaces,
  getWorkspaceDomainInfoBySlug,
} from "@/lib/workspace";
import WorkspaceHeader from "@/components/global/WorkspaceHeader";
import {
  getServerSession,
  listServerDeviceAccounts,
} from "@featul/auth/session";
import { redirect } from "next/navigation";
import UnauthorizedWorkspace from "@/components/global/Unauthorized";
import { EditorHeaderProvider } from "@/components/changelog/EditorHeaderContext";
import { WelcomeTourGate } from "@/components/onboarding/WelcomeTourGate";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { parseSidebarPins, sidebarPinsCookieName } from "@/lib/sidebar/pins";

export const revalidate = 30;

/**
 * Desktop content panel: inset at the top and right, open at the bottom. Only
 * the top lip is ever visible, so depth comes from a lit top edge, not a drop
 * shadow.
 */
const workspacePanelClass = [
  "flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-background",
  "lg:relative lg:mt-1.5 lg:mr-1.5 lg:h-(--workspace-frame-height) lg:rounded-t-2xl lg:border lg:border-b-0",
  "lg:border-black/[0.07] lg:shadow-[0_0_0_0.5px_rgba(0,0,0,0.03),0_0_3px_rgba(0,0,0,0.05)]",
  "lg:before:pointer-events-none lg:before:absolute lg:before:inset-x-0 lg:before:top-0 lg:before:z-50 lg:before:h-6 lg:before:rounded-t-[inherit] lg:before:shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]",
  "dark:lg:border-white/[0.07] dark:lg:shadow-[0_0_0_0.5px_rgba(0,0,0,0.5),0_0_3px_rgba(0,0,0,0.35)] dark:lg:before:shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]",
].join(" ");

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const initialSidebarCollapsed =
    cookieStore.get("featul_sidebar_collapsed")?.value === "true";
  const initialSidebarPins = parseSidebarPins(
    cookieStore.get(sidebarPinsCookieName(slug))?.value,
  );
  const session = await getServerSession();
  const userId = session?.user?.id || null;
  if (!userId) {
    redirect(`/auth/signin?redirect=/workspaces/${slug}`);
  }
  const [
    branding,
    counts,
    timezone,
    ws,
    workspaceList,
    domainInfo,
    deviceAccounts,
  ] = await Promise.all([
    getBrandingColorsBySlug(slug),
    getWorkspaceStatusCounts(slug),
    getWorkspaceTimezoneBySlug(slug),
    getWorkspaceBySlug(slug),
    userId ? listUserWorkspaces(userId) : Promise.resolve([]),
    getWorkspaceDomainInfoBySlug(slug),
    listServerDeviceAccounts(),
  ]);
  const hasAccess = workspaceList.some((w) => w.slug === slug);
  const fallbackSlug = workspaceList[0]?.slug || null;
  if (!hasAccess) {
    return <UnauthorizedWorkspace slug={slug} fallbackSlug={fallbackSlug} />;
  }
  const { primary: p } = branding;
  const serverNow = Date.now();
  return (
    <ScaledBackground>
      <Container
        className="workspace-shell fixed inset-0 flex h-dvh overflow-hidden overscroll-none bg-background lg:bg-sidebar"
        maxWidth="full"
        noPadding
      >
        <style>{`:root{--primary:${p};--ring:${p};--sidebar-primary:${p};--workspace-mobile-nav-height:calc(3.5rem + env(safe-area-inset-bottom));--workspace-frame-height:100dvh;} @media (min-width:64rem){:root{--workspace-frame-height:calc(100dvh - 0.375rem);}} html:has(.workspace-shell),body:has(.workspace-shell){overflow:hidden;overscroll-behavior:none;}`}</style>
        <BrandVarsEffect primary={p} />
        <WorkspaceEvents slug={slug} />
        <Sidebar
          initialCollapsed={initialSidebarCollapsed}
          initialPins={initialSidebarPins}
          initialCounts={counts}
          initialTimezone={timezone}
          initialServerNow={serverNow}
          initialWorkspace={ws || undefined}
          initialDomainInfo={domainInfo || undefined}
          initialWorkspaces={workspaceList}
          initialUser={session?.user}
          initialDeviceAccounts={deviceAccounts}
        />
        <main className={workspacePanelClass}>
          <EditorHeaderProvider>
            <WorkspaceHeader />
            <div
              data-workspace-scroll
              className="min-h-0 flex-1 overflow-y-auto overscroll-none px-4 pb-[calc(var(--workspace-mobile-nav-height)+2rem)] sm:px-8 lg:px-12 lg:pb-8 xl:px-16 has-[[data-page-empty]]:flex has-[[data-page-empty]]:flex-col has-[[data-page-empty]]:lg:pb-0 [&>section:has([data-page-empty])]:flex [&>section:has([data-page-empty])]:flex-1 [&>section:has([data-page-empty])]:flex-col [&>section:has([data-page-empty])]:space-y-0 [&>section:has([data-page-empty])]:pb-36 has-[[data-changelog-editor]]:px-0 has-[[data-changelog-editor]]:pb-0 has-[[data-request-detail]]:overflow-hidden has-[[data-request-detail]]:pb-0 has-[[data-member-detail]]:overflow-hidden has-[[data-member-detail]]:pb-0 has-[[data-roadmap]]:flex has-[[data-roadmap]]:flex-col has-[[data-roadmap]]:overflow-hidden has-[[data-roadmap]]:lg:pb-0"
            >
              {children}
            </div>
          </EditorHeaderProvider>
        </main>
        <MobileSidebar
          initialCounts={counts}
          initialTimezone={timezone}
          initialServerNow={serverNow}
          initialWorkspace={ws || undefined}
          initialDomainInfo={domainInfo || undefined}
          initialWorkspaces={workspaceList}
          initialUser={session?.user}
          initialDeviceAccounts={deviceAccounts}
        />
        <WorkspaceShortcutsDrawer />
        {ws ? (
          <Suspense fallback={null}>
            <WelcomeTourGate
              userId={userId}
              workspaceName={ws?.name ?? slug}
              workspaceSlug={ws.slug}
            />
          </Suspense>
        ) : null}
      </Container>
    </ScaledBackground>
  );
}
