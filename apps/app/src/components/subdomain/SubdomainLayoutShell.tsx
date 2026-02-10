import type { ReactNode } from "react";
import { Container } from "@/components/global/container";
import { DomainHeader } from "@/components/subdomain/DomainHeader";
import BrandVarsEffect from "@/components/global/BrandVarsEffect";
import SubdomainThemeProvider from "@/components/subdomain/SubdomainThemeProvider";
import { DomainBrandingProvider } from "@/components/subdomain/DomainBrandingProvider";
import { PoweredBy } from "@/components/subdomain/PoweredBy";
import { SubdomainBackground } from "./SubdomainBackground";
import type { AuthUser } from "@/types/auth";

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
  initialUser?: AuthUser | null;
};

function layoutMaxWidth(layoutStyle: BrandingInfo["layoutStyle"]) {
  if (layoutStyle === "compact") return "4xl";
  if (layoutStyle === "spacious") return "6xl";
  return "5xl";
}

function buildThemeVars(primary: string) {
  return `:root{--primary:${primary};--ring:${primary};--sidebar-primary:${primary};}`;
}

export function SubdomainLayoutShell({
  children,
  subdomain,
  workspace,
  branding,
  changelogVisible,
  roadmapVisible,
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
        <style>{themeVars}</style>
        <BrandVarsEffect primary={branding.primary} />
        <SubdomainBackground />
        <Container maxWidth={maxWidth} className="min-h-screen flex flex-col">
          <DomainHeader
            workspace={workspace}
            subdomain={subdomain}
            changelogVisible={changelogVisible}
            roadmapVisible={roadmapVisible}
            initialUser={initialUser ?? null}
          />
          <div className="mt-6 pb-10 md:pb-0 flex-1">{children}</div>
          <div className="pb-12 mt-6">
            <PoweredBy />
          </div>
        </Container>
      </DomainBrandingProvider>
    </SubdomainThemeProvider>
  );
}
