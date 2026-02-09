"use client";

import React from "react";
import type { CommentData } from "../../types/comment";
import PostSidebar from "./PostSidebar";
import { useDomainBranding } from "./DomainBrandingProvider";
import type { SubdomainRequestDetailData } from "../../types/subdomain";
import { RequestHeader } from "./request-detail/RequestHeader";
import { RequestContent } from "./request-detail/RequestContent";

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
    <section className="mt-4 md:mt-6 mb-12">
      <RequestHeader sidebarPosition={sidebarPosition} backLink={backLink} />

      {/* Main Content Grid */}
      <div
        className={
          sidebarPosition === "left"
            ? "grid md:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] gap-6"
            : "grid md:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)] gap-6"
        }
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
