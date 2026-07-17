"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  WorkspaceSearchAction,
  type WorkspaceSearchResult,
} from "@/components/global/WorkspaceSearchAction";
import { buildRequestsUrl } from "@/utils/request";
import { getSlugFromPath } from "@/config/nav";

export default function SearchAction({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const sp = useSearchParams();
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);

  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname]);
  const currentSearch = sp.get("search") || "";

  const runSearch = (value: string) => {
    setPendingHref(buildRequestsUrl(slug, sp, { search: value }));
  };

  React.useEffect(() => {
    if (!pendingHref) return;
    router.push(pendingHref);
    setPendingHref(null);
  }, [pendingHref, router]);

  return (
    <WorkspaceSearchAction
      workspaceSlug={slug}
      currentSearch={currentSearch}
      className={className}
      buttonVariant="card"
      showNoResults
      onSearchSubmit={runSearch}
      onResultSelect={(result: WorkspaceSearchResult) => {
        setPendingHref(`/workspaces/${slug}/requests/${result.slug}`);
      }}
    />
  );
}
