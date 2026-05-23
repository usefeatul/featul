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
import FilterSummary from "@/components/requests/FilterSummary";
import {
  getServerSession,
  listServerDeviceAccounts,
} from "@featul/auth/session";
import { redirect } from "next/navigation";
import UnauthorizedWorkspace from "@/components/global/Unauthorized";
import { EditorHeaderProvider } from "@/components/changelog/EditorHeaderContext";

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
    redirect(`/auth/sign-in?redirect=/workspaces/${slug}`);
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
    <div className="workspace-shell min-h-screen w-full bg-background text-foreground lg:flex lg:gap-3 lg:px-2 lg:py-2">
      <style>{`:root{--primary:${p};--ring:${p};--sidebar-primary:${p};}`}</style>
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
      <main className="w-full min-w-0 pb-10 lg:flex-1 lg:pb-0">
        <EditorHeaderProvider>
          <div className="workspace-main min-h-[calc(100vh-1rem)] overflow-hidden rounded-none border border-border bg-card lg:rounded-lg">
            <div className="flex h-full min-h-[calc(100vh-1rem)] flex-col">
              <WorkspaceHeader />
              <div className="px-3 sm:px-5 lg:px-6">
                <FilterSummary />
              </div>
              <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-5 lg:px-6 lg:py-5">
                {children}
              </div>
            </div>
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
    </div>
  );
}
