"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@feedgot/api/client";
import CommentForm from "./CommentForm";
import CommentThread from "./CommentThread";
import { useSession } from "@feedgot/auth/client";
import type { CommentData } from "./CommentItem";

interface CommentListProps {
  postId: string;
  initialCount?: number;
  workspaceSlug?: string;
  initialComments?: CommentData[];
}

export default function CommentList({
  postId,
  initialCount = 0,
  workspaceSlug,
  initialComments,
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
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    initialData: initialComments ? { comments: initialComments } : undefined,
  });

  const comments = commentsData?.comments || [];
  const commentCount = comments.length;

  const handleCommentSuccess = () => {

    refetch()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card p-3.5">
        <CommentForm postId={postId} onSuccess={handleCommentSuccess} />
      </div>
      {commentCount === 0 && !isLoading ? (
        <div className="rounded-md border bg-card p-6 text-center">
          <p className="text-sm text-accent">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative">
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
