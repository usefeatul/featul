"use client";

import type { InitialActivity } from "@/types/activity";

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
  initialActivity,
  initialCollapsedIds,
  backLink,
}: {
  post: SubdomainRequestDetailData;
  workspaceSlug: string;
  initialComments?: CommentData[];
  initialActivity?: InitialActivity;
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
      <div className={subdomainColumns(sidebarPosition)}>
        {/* Left Sidebar */}
        {sidebarPosition === "left" ? (
          <PostSidebar post={post} workspaceSlug={workspaceSlug} />
        ) : null}

        <div className="flex min-w-0 flex-col">
          <RequestHeader backLink={backLink} />
          <RequestContent
            post={post}
            workspaceSlug={workspaceSlug}
            initialComments={initialComments}
            initialActivity={initialActivity}
            initialCollapsedIds={initialCollapsedIds}
          />
        </div>

        {/* Right Sidebar */}
        {sidebarPosition === "right" ? (
          <PostSidebar post={post} workspaceSlug={workspaceSlug} />
        ) : null}
      </div>
    </section>
  );
}
