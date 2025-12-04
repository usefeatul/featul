"use client";

import React, { useState, useTransition } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@feedgot/ui/components/avatar";
import { Button } from "@feedgot/ui/components/button";
import { Textarea } from "@feedgot/ui/components/textarea";
import { client } from "@feedgot/api/client";
import { toast } from "sonner";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@feedgot/ui/lib/utils";
import CommentForm from "./CommentForm";
import CommentImage from "./CommentImage";
import CommentActions from "./actions/CommentActions";
import CommentVote from "./CommentVote";
import CommentReplyButton from "./actions/CommentReplyAction";
import { useWorkspaceRole } from "@/hooks/useWorkspaceAccess";
import { relativeTime } from "@/lib/time";
import RoleBadge from "./RoleBadge";

export type CommentData = {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  authorId: string | null;
  authorName: string;
  authorEmail: string | null;
  authorImage: string;
  isAnonymous: boolean | null;
  status: string;
  upvotes: number;
  replyCount: number;
  depth: number;
  isPinned: boolean | null;
  isEdited: boolean | null;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  hasVoted?: boolean;
  role?: "admin" | "member" | "viewer" | null;
  isOwner?: boolean;
  metadata?: {
    attachments?: { name: string; url: string; type: string }[];
    mentions?: string[];
    editHistory?: { content: string; editedAt: string }[];
  } | null;
};

interface CommentItemProps {
  comment: CommentData;
  currentUserId?: string | null;
  onReplySuccess?: () => void;
  onUpdate?: () => void;
  depth?: number;
  hasReplies?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  workspaceSlug?: string;
}

export default function CommentItem({
  comment,
  currentUserId,
  onReplySuccess,
  onUpdate,
  depth = 0,
  hasReplies = false,
  isCollapsed = false,
  onToggleCollapse,
  workspaceSlug,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isPending, startTransition] = useTransition();

  const { isOwner } = useWorkspaceRole(workspaceSlug || "");
  const isAuthor = currentUserId && comment.authorId === currentUserId;
  const canDelete = isAuthor || (workspaceSlug ? isOwner : false);
  const canReply = depth < 3; // Limit nesting to 3 levels
  const handleEdit = () => {
    if (!editContent.trim() || isPending) return;
    startTransition(async () => {
      try {
        const res = await client.comment.update.$post({
          commentId: comment.id,
          content: editContent.trim(),
        });
        if (res.ok) {
          setIsEditing(false);
          toast.success("Comment updated");
          onUpdate?.();
        } else {
          toast.error("Failed to update comment");
        }
      } catch (error) {
        console.error("Failed to update comment:", error);
        toast.error("Failed to update comment");
      }
    });
  };


  

  const initials = comment.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("flex gap-3 group", depth > 0 && "mt-2")}>
      <div className="relative flex-shrink-0">
        <Avatar className="size-8 relative overflow-visible">
          <AvatarImage src={comment.authorImage} alt={comment.authorName} />
          <AvatarFallback className="text-xs bg-muted text-muted-foreground">
            {initials}
          </AvatarFallback>
          <RoleBadge role={comment.role} isOwner={comment.isOwner} />
        </Avatar>
      </div>

      <div className="flex-1 min-w-0 pt-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap leading-none">
            <span className="text-sm font-semibold text-foreground">
              {comment.authorName}
            </span>
            <span className="text-xs text-muted-foreground/60">
              {relativeTime(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-muted-foreground/60">(edited)</span>
            )}
            {comment.isPinned && (
              <span className="text-xs text-primary font-medium">Pinned</span>
            )}
            {hasReplies && onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors ml-auto sm:ml-0"
                aria-label={isCollapsed ? "Expand replies" : "Collapse replies"}
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    <span className="font-medium">
                      {comment.replyCount} replies
                    </span>
                  </>
                ) : (
                  <ChevronUp className="h-3 w-3" />
                )}
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2 mt-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] resize-none text-sm bg-transparent border-muted focus:border-primary transition-colors"
                disabled={isPending}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={!editContent.trim() || isPending}
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  )}
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {comment.content && (
                <div className="text-[15px] text-foreground/90 whitespace-pre-wrap break-words leading-7 font-normal">
                  {comment.content}
                </div>
              )}
              {/* Display images from metadata */}
              {comment.metadata?.attachments &&
                comment.metadata.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {comment.metadata.attachments
                      .filter((att) => att.type.startsWith("image/"))
                      .map((att, idx) => (
                        <CommentImage
                          key={idx}
                          url={att.url}
                          alt={att.name}
                          className="max-w-[120px] max-h-20"
                        />
                      ))}
                  </div>
                )}
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-4 mt-2">
            <CommentVote
              commentId={comment.id}
              initialUpvotes={comment.upvotes}
              initialHasVoted={comment.hasVoted || false}
            />

            {canReply && (
              <CommentReplyButton
                onClick={() => setShowReplyForm(!showReplyForm)}
              />
            )}

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CommentActions
                commentId={comment.id}
                isAuthor={!!isAuthor}
                canDelete={canDelete}
                onEdit={() => setIsEditing(true)}
                onDeleteSuccess={onUpdate}
              />
            </div>
          </div>
        )}

        {showReplyForm && (
          <div className="mt-3 pt-2">
            <div className="pl-1">
              <CommentForm
                postId={comment.postId}
                parentId={comment.id}
                onSuccess={() => {
                  setShowReplyForm(false);
                  onReplySuccess?.();
                }}
                onCancel={() => setShowReplyForm(false)}
                placeholder="Write a reply..."
                autoFocus
                buttonText="Reply"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
