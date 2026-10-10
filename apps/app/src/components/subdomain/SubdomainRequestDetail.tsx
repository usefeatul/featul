"use client";

import React from "react";
import type { CommentData } from "../../types/comment";
import PostSidebar from "./PostSidebar";
import { useDomainBranding } from "./DomainBrandingProvider";
import type { SubdomainRequestDetailData } from "../../types/subdomain";
import { RequestHeader } from "./request/RequestHeader";
import { RequestContent } from "./request/RequestContent";
import { subdomainColumns } from "./layout";

export default function SubdomainRequestDetail({
  post,
  workspaceSlug,
  initialComments,
  initialCollapsedIds,
  backLink,
}: {
  post: SubdomainRequestDetailData;
  workspaceSlug: string;
  initialComments?: CommentData[];
  initialCollapsedIds?: string[];
  navigation?: {
    prev: { slug: string; title: string } | null;
    next: { slug: string; title: string } | null;
  };
  backLink?: string;
}) {
  const { sidebarPosition = "right" } = useDomainBranding();

  return (
    <section className="min-w-0 mb-12">
      <RequestHeader sidebarPosition={sidebarPosition} backLink={backLink} />

      {/* Main Content Grid */}
      <div
        className={subdomainColumns(sidebarPosition)}
      >
        {/* Left Sidebar */}
        {sidebarPosition === "left" ? (
          <PostSidebar post={post} workspaceSlug={workspaceSlug} />
        ) : null}

        <RequestContent
          post={post}
          workspaceSlug={workspaceSlug}
          initialComments={initialComments}
          initialCollapsedIds={initialCollapsedIds}
        />

        {/* Right Sidebar */}
        {sidebarPosition === "right" ? (
          <PostSidebar post={post} workspaceSlug={workspaceSlug} />
        ) : null}
      </div>
    </section>
  );
}
