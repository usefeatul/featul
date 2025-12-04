"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@feedgot/api/client";
import CommentForm from "./CommentForm";
import CommentThread from "./CommentThread";
import { useSession } from "@feedgot/auth/client";

interface CommentListProps {
  postId: string;
  initialCount?: number;
  workspaceSlug?: string;
}

export default function CommentList({
  postId,
  initialCount = 0,
  workspaceSlug,
}: CommentListProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession() as any;
  const currentUserId = session?.user?.id || null;

  const queryKey = ["comments", postId];

  const {
    data: commentsData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await client.comment.list.$get({ postId });
      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }
      return await res.json();
    },
    staleTime: 30_000,
    gcTime: 300_000,
    placeholderData: (previousData) => previousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const comments = commentsData?.comments || [];
  const commentCount = comments.length;

  const handleCommentSuccess = () => {
    // Optimistically refetch in background without showing loading state
    // The query will update with placeholderData keeping old data visible
    refetch()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">
          Comments {commentCount > 0 && `(${commentCount})`}
        </h2>
      </div>

      {/* Comment Form */}
      <div className="rounded-md border bg-card p-3.5">
        <CommentForm postId={postId} onSuccess={handleCommentSuccess} />
      </div>

      {/* Comments List */}
      {commentCount === 0 && !isLoading ? (
        <div className="rounded-md border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative">
          {isFetching && comments.length > 0 && (
            <div className="absolute top-0 right-0">
              <div className="h-1 w-1 rounded-full bg-muted-foreground/30 animate-pulse" />
            </div>
          )}
          {comments.length > 0 && (
            <CommentThread
              comments={comments}
              currentUserId={currentUserId}
              onUpdate={handleCommentSuccess}
              workspaceSlug={workspaceSlug}
            />
          )}
        </div>
      )}
    </div>
  );
}
