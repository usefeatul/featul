"use client";

import React from "react";
import type { CommentData } from "../comments/CommentItem";
import PostSidebar from "./PostSidebar";
import { useDomainBranding } from "./DomainBrandingProvider";
import { SubdomainRequestDetailData } from "./request-detail/types";
import { RequestHeader } from "./request-detail/RequestHeader";
import { RequestContent } from "./request-detail/RequestContent";

export default function SubdomainRequestDetail({
  post,
  workspaceSlug,
  initialComments,
  initialCollapsedIds,
  navigation,
}: {
  post: SubdomainRequestDetailData;
  workspaceSlug: string;
  initialComments?: CommentData[];
  initialCollapsedIds?: string[];
  navigation?: {
    prev: { slug: string; title: string } | null;
    next: { slug: string; title: string } | null;
  };
}) {
  const { sidebarPosition = "right" } = useDomainBranding();

  return (
    <section className="mt-4 md:mt-6 mb-8">
      <RequestHeader sidebarPosition={sidebarPosition} />

      {/* Main Content Grid */}
      <div
        className={
          sidebarPosition === "left"
            ? "grid md:grid-cols-[0.3fr_0.7fr] gap-6"
            : "grid md:grid-cols-[0.7fr_0.3fr] gap-6"
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
