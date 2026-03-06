"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { fetchUserWorkspaces } from "@/lib/workspace-client";

function mapWorkspaceSlugs(slugs: Array<string | undefined>): string[] {
  return slugs
    .map((slug) => String(slug || "").trim())
    .filter(Boolean);
}

export function useWorkspaceNavigation(currentSlug: string) {
  const router = useRouter();

  const getWorkspaceSlugs = React.useCallback(async () => {
    const workspaces = await fetchUserWorkspaces();
    return mapWorkspaceSlugs(workspaces.map((workspace) => workspace.slug));
  }, []);

  const pushWorkspaceRoute = React.useCallback(
    async (path: "account/profile" | "settings/branding") => {
      if (currentSlug) {
        router.push(`/workspaces/${currentSlug}/${path}`);
        return;
      }

      try {
        const workspaceSlugs = await getWorkspaceSlugs();
        const firstSlug = workspaceSlugs[0] || "";

        if (firstSlug) {
          router.push(`/workspaces/${firstSlug}/${path}`);
        } else {
          router.push("/workspaces/new");
        }
      } catch {
        router.push("/workspaces/new");
      }
    },
    [currentSlug, getWorkspaceSlugs, router],
  );

  const navigateToAccountProfile = React.useCallback(async () => {
    await pushWorkspaceRoute("account/profile");
  }, [pushWorkspaceRoute]);

  const navigateToBrandingSettings = React.useCallback(async () => {
    await pushWorkspaceRoute("settings/branding");
  }, [pushWorkspaceRoute]);

  const navigateAfterSwitch = React.useCallback(async () => {
    const accessibleSlugs = await getWorkspaceSlugs();
    const targetSlug = accessibleSlugs.includes(currentSlug)
      ? currentSlug
      : accessibleSlugs[0] || "";

    if (targetSlug) {
      router.push(`/workspaces/${targetSlug}`);
    } else {
      router.push("/workspaces/new");
    }
  }, [currentSlug, getWorkspaceSlugs, router]);

  return {
    navigateAfterSwitch,
    navigateToAccountProfile,
    navigateToBrandingSettings,
  };
}
