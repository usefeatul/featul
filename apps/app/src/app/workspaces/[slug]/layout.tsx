import { Container } from "@/components/global/container";
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

export const revalidate = 30;

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
    <Container
      className="workspace-shell fixed inset-0 flex h-dvh overflow-hidden overscroll-none bg-background lg:gap-[2px] lg:bg-muted/45 dark:lg:bg-black/25"
      maxWidth="full"
      noPadding
    >
      <style>{`:root{--primary:${p};--ring:${p};--sidebar-primary:${p};--workspace-mobile-nav-height:calc(3.5rem + env(safe-area-inset-bottom));} html:has(.workspace-shell),body:has(.workspace-shell){overflow:hidden;overscroll-behavior:none;}`}</style>
      <BrandVarsEffect primary={p} />
      <WorkspaceEvents slug={slug} />
      <Sidebar
        initialCounts={counts}
        initialTimezone={timezone}
        initialServerNow={serverNow}
        initialWorkspace={ws || undefined}
        initialDomainInfo={domainInfo || undefined}
        initialWorkspaces={workspaceList}
        initialUser={session?.user}
        initialDeviceAccounts={deviceAccounts}
      />
      <main className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-background lg:border-l lg:border-border/60 dark:lg:border-white/10">
        <EditorHeaderProvider>
          <WorkspaceHeader workspaceName={ws?.name ?? slug} />
          <div
            data-workspace-scroll
            className="min-h-0 flex-1 overflow-y-auto overscroll-none px-4 pb-[var(--workspace-mobile-nav-height)] sm:px-8 lg:px-12 lg:pb-8 xl:px-16 has-[[data-changelog-editor]]:px-0 has-[[data-changelog-editor]]:pb-0 has-[[data-request-detail]]:overflow-hidden has-[[data-request-detail]]:pb-0 has-[[data-member-detail]]:overflow-hidden has-[[data-member-detail]]:pb-0"
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
  );
}
