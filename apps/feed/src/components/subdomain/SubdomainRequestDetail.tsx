"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { UpvoteButton } from "../global/UpvoteButton";
import CommentList from "../comments/CommentList";
import type { CommentData } from "../comments/CommentItem";
import PostSidebar from "./PostSidebar";
import StatusIcon from "@/components/requests/StatusIcon";
import { statusLabel } from "@/lib/roadmap";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@feedgot/ui/components/avatar";
import { getInitials, getDisplayUser } from "@/utils/user-utils";
import { randomAvatarUrl } from "@/utils/avatar";
import { useDomainBranding } from "./DomainBrandingProvider";

export type SubdomainRequestDetailData = {
  id: string;
  title: string;
  content: string | null;
  image: string | null;
  upvotes: number;
  commentCount: number;
  roadmapStatus: string | null;
  isFeatured?: boolean;
  isLocked?: boolean;
  isPinned?: boolean;
  publishedAt: string | null;
  createdAt: string;
  boardName: string;
  boardSlug: string;
  hasVoted?: boolean;
  author?: {
    name: string | null;
    image: string | null;
    email: string | null;
  } | null;
};

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
  const displayAuthor = getDisplayUser(
    post.author
      ? {
          name: post.author.name ?? undefined,
          image: post.author.image ?? undefined,
          email: post.author.email ?? undefined,
        }
      : undefined
  );
  const { sidebarPosition = "right" } = useDomainBranding();

  return (
    <section className="mt-4 md:mt-6">
      {/* Header Grid Row */}
      <div
        className={
          sidebarPosition === "left"
            ? "grid md:grid-cols-[0.3fr_0.7fr] gap-6 mb-6"
            : "grid md:grid-cols-[0.7fr_0.3fr] gap-6 mb-6"
        }
      >
        {/* Left Spacer for Sidebar */}
        {sidebarPosition === "left" ? <div className="hidden md:block" /> : null}

        {/* Header Content */}
        <div className={`flex items-center gap-3 ${sidebarPosition === "left" ? "justify-end" : ""}`}>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border bg-card text-foreground border-muted hover:bg-muted hover:text-accent-foreground hover:border-accent/20 dark:bg-black/40 dark:hover:bg-black/50 p-2 transition-colors"
            aria-label="Back to board"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Submission</h1>
        </div>

        {/* Right Spacer for Sidebar */}
        {sidebarPosition === "right" ? <div className="hidden md:block" /> : null}
      </div>

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

        {/* Main Content Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {/* Status */}
          <div className="inline-flex items-center gap-2 mb-4">
            <StatusIcon
              status={post.roadmapStatus || undefined}
              className="size-5 text-foreground/80"
            />
            <span className="text-sm text-accent">
              {statusLabel(String(post.roadmapStatus || "pending"))}
            </span>
          </div>

          {/* Post Title */}
          <h1 className="text-xl font-semibold text-foreground mb-4">
            {post.title}
          </h1>

          {/* Image */}
          {post.image ? (
            <img
              src={post.image}
              alt=""
              className="w-48 h-36 rounded-md object-cover border mb-4"
            />
          ) : null}

          {/* Content */}
          {post.content ? (
            <div className="prose dark:prose-invert text-sm text-accent mb-6">
              {post.content}
            </div>
          ) : null}

          {/* Footer: Author & Upvotes */}
          <div className="flex items-center justify-between pt-2">
            <div className="inline-flex items-center gap-2">
              <Avatar className="size-6 bg-background border border-border rounded-full relative overflow-visible">
                <AvatarImage
                  src={displayAuthor.image || randomAvatarUrl(post.id)}
                  alt={displayAuthor.name}
                />
                <AvatarFallback>{getInitials(displayAuthor.name)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-accent whitespace-nowrap mt-2 max-w-[180px] truncate">
                {displayAuthor.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-accent">
              <UpvoteButton
                postId={post.id}
                upvotes={post.upvotes}
                hasVoted={post.hasVoted}
                className="text-xs hover:text-red-500/80"
                activeBg
              />
            </div>
          </div>

          {/* Comments */}
          <div className="mt-6 pt-6 border-t">
            <CommentList
              postId={post.id}
              initialCount={post.commentCount}
              workspaceSlug={workspaceSlug}
              initialComments={initialComments}
              initialCollapsedIds={initialCollapsedIds}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        {sidebarPosition === "right" ? (
          <PostSidebar post={post} workspaceSlug={workspaceSlug} />
        ) : null}
      </div>
    </section>
  );
}
