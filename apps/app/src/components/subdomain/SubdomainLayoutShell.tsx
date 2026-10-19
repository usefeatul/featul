import type { ReactNode } from "react";
import { DomainHeader } from "@/components/subdomain/DomainHeader";
import BrandVarsEffect from "@/components/global/BrandVarsEffect";
import SubdomainThemeProvider from "@/components/subdomain/SubdomainThemeProvider";
import { DomainBrandingProvider } from "@/components/subdomain/DomainBrandingProvider";
import { PortalDataProvider } from "@/components/subdomain/PortalDataProvider";
import { Container } from "@/components/global/container";
import type { AuthUser } from "@/types/auth";
import type { PortalBoard, PortalStatusCounts } from "@/app/[subdomain]/data";

type BrandingInfo = {
  primary: string;
  theme: "light" | "dark" | "system";
  sidebarPosition?: "left" | "right";
  layoutStyle?: "compact" | "comfortable" | "spacious";
  hidePoweredBy?: boolean;
};

type WorkspaceInfo = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo: string | null;
};

type SubdomainLayoutShellProps = {
  children: ReactNode;
  subdomain: string;
  workspace: WorkspaceInfo;
  branding: BrandingInfo;
  changelogVisible: boolean;
  roadmapVisible: boolean;
  helpVisible: boolean;
  boards: PortalBoard[];
  statusCounts: PortalStatusCounts;
  totalPosts: number;
  changelogCount: number;
  initialUser?: AuthUser | null;
};

export type PortalMaxWidth = "5xl" | "6xl" | "7xl";

/** Container max-width token from compact / comfortable / spacious. */
export function layoutMaxWidth(layoutStyle: BrandingInfo["layoutStyle"]): PortalMaxWidth {
  if (layoutStyle === "compact") return "5xl";
  if (layoutStyle === "spacious") return "7xl";
  return "6xl";
}

/** Inject workspace primary into --primary, --ring, and --sidebar-primary; pin the page so it never rubber-bands. */
function buildThemeVars(primary: string) {
  return `:root{--primary:${primary};--ring:${primary};--sidebar-primary:${primary};}html,body{overscroll-behavior:none;}`;
}

export function SubdomainLayoutShell({
  children,
  subdomain,
  workspace,
  branding,
  changelogVisible,
  roadmapVisible,
  helpVisible,
  boards,
  statusCounts,
  totalPosts,
  changelogCount,
  initialUser,
}: SubdomainLayoutShellProps) {
  const hidePoweredBy = Boolean(branding.hidePoweredBy);
  const maxWidth = layoutMaxWidth(branding.layoutStyle);
  const themeVars = buildThemeVars(branding.primary);

  return (
    <SubdomainThemeProvider theme={branding.theme}>
      <DomainBrandingProvider
        hidePoweredBy={hidePoweredBy}
        sidebarPosition={branding.sidebarPosition}
        subdomain={subdomain}
      >
        <PortalDataProvider
          value={{
            subdomain,
            workspaceName: workspace.name,
            boards,
            statusCounts,
            totalPosts,
            changelogCount,
            roadmapVisible,
            changelogVisible,
            helpVisible,
          }}
        >
          <style>{themeVars}</style>
          <BrandVarsEffect primary={branding.primary} />
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <DomainHeader
              workspace={workspace}
              subdomain={subdomain}
              changelogVisible={changelogVisible}
              roadmapVisible={roadmapVisible}
              helpVisible={helpVisible}
              initialUser={initialUser ?? null}
              maxWidth={maxWidth}
            />
            <main className="flex flex-1 flex-col">
              <Container
                maxWidth={maxWidth}
                className="flex w-full flex-1 flex-col py-6 sm:py-8 has-[[data-page-empty]]:flex has-[[data-page-empty]]:flex-col"
              >
                {children}
              </Container>
            </main>
          </div>
        </PortalDataProvider>
      </DomainBrandingProvider>
    </SubdomainThemeProvider>
  );
}
