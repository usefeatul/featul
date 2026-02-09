import React from "react";
import { notFound } from "next/navigation";
import { Container } from "@/components/global/container";
import { DomainHeader } from "@/components/subdomain/DomainHeader";
import BrandVarsEffect from "@/components/global/BrandVarsEffect";
import SubdomainThemeProvider from "@/components/subdomain/SubdomainThemeProvider";
import { DomainBrandingProvider } from "@/components/subdomain/DomainBrandingProvider";
import { PoweredBy } from "@/components/subdomain/PoweredBy";
import { loadSubdomainLayoutData } from "./data";
import { getServerSession } from "@featul/auth/session";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const data = await loadSubdomainLayoutData(subdomain);
  const session = await getServerSession();

  if (!data) notFound();

  const { workspace: ws, branding, changelogVisible, roadmapVisible } = data;
  const hidePoweredBy = Boolean(branding.hidePoweredBy);
  const p = branding.primary;
  return (
    <>
      <SubdomainThemeProvider theme={branding.theme}>
        <DomainBrandingProvider
          hidePoweredBy={hidePoweredBy}
          sidebarPosition={branding.sidebarPosition}
          subdomain={subdomain}
        >
          <style>{`:root{--primary:${p};--ring:${p};--sidebar-primary:${p};}`}</style>
          <BrandVarsEffect primary={p} />
          <div className="fixed inset-0 -z-10 flex flex-col">
            <div className="bg-background  dark:bg-background dark:border-background/60 border-b h-44 sm:h-56" />
            <div className="bg-card dark:bg-black/40 border-b flex-1 " />
          </div>
          {(() => {
            const maxW =
              branding.layoutStyle === "compact"
                ? "4xl"
                : branding.layoutStyle === "spacious"
                  ? "6xl"
                  : "5xl";
            return (
              <Container maxWidth={maxW}>
                <DomainHeader
                  workspace={ws}
                  subdomain={subdomain}
                  changelogVisible={changelogVisible}
                  roadmapVisible={roadmapVisible}
                  initialUser={session?.user ?? null}
                />
                <div className="mt-6 pb-10 md:pb-0">{children}</div>
                <div className="pb-12">
                  <PoweredBy />
                </div>
              </Container>
            );
          })()}
        </DomainBrandingProvider>
      </SubdomainThemeProvider>
    </>
  );
}
