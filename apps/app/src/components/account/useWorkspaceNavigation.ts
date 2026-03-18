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

  const resolveWorkspaceSlug = React.useCallback(async () => {
    if (currentSlug) return currentSlug;

    try {
      const workspaceSlugs = await getWorkspaceSlugs();
      return workspaceSlugs[0] || "";
    } catch {
      return "";
    }
  }, [currentSlug, getWorkspaceSlugs]);

  const pushWorkspaceRoute = React.useCallback(
    async (path: "account/profile" | "settings/branding") => {
      const targetSlug = await resolveWorkspaceSlug();

      if (targetSlug) {
        router.push(`/workspaces/${targetSlug}/${path}`);
      } else {
        router.push("/workspaces/new");
      }
    },
    [resolveWorkspaceSlug, router],
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
