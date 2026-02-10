import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { SubdomainLayoutShell } from "@/components/subdomain/SubdomainLayoutShell";
import { loadSubdomainLayoutData } from "./data";
import { getServerSession } from "@featul/auth/session";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const data = await loadSubdomainLayoutData(subdomain);
  const session = await getServerSession();

  if (!data) notFound();

  return (
    <SubdomainLayoutShell
      subdomain={subdomain}
      workspace={data.workspace}
      branding={data.branding}
      changelogVisible={data.changelogVisible}
      roadmapVisible={data.roadmapVisible}
      initialUser={session?.user ?? null}
    >
      {children}
    </SubdomainLayoutShell>
  );
}
