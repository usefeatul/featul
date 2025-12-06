"use client";

import React, { useState, useTransition } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@feedgot/ui/components/avatar";
import { Textarea } from "@feedgot/ui/components/textarea";
import { client } from "@feedgot/api/client";
import { toast } from "sonner";
import PinnedBadge from "./PinnedBadge";
import { cn } from "@feedgot/ui/lib/utils";
import CommentForm from "./CommentForm";
import CommentImage from "./CommentImage";
import CommentActions from "./actions/CommentActions";
import CommentVote from "./CommentVote";
import CommentReplyButton from "./actions/CommentReplyAction";
import { useWorkspaceRole } from "@/hooks/useWorkspaceAccess";
import { relativeTime } from "@/lib/time";
import { getInitials } from "@/utils/user-utils";
import RoleBadge from "./RoleBadge";
import CommentCollapseToggle from "./CommentCollapseToggle";

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
  const isSavingRef = React.useRef(false);
  const saveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const { isOwner } = useWorkspaceRole(workspaceSlug || "");
  const isAuthor = currentUserId && comment.authorId === currentUserId;
  const canDelete = isAuthor || (workspaceSlug ? isOwner : false);
  const canReply = depth < 3; // Limit nesting to 3 levels

  const executeSave = () => {
    if (!editContent.trim()) {
        // If empty, revert changes (cancel) instead of getting stuck in limbo
        handleCancel();
        return;
    }
    
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
      } finally {
        isSavingRef.current = false;
      }
    });
  };

  const handleSave = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    isSavingRef.current = true;
    saveTimerRef.current = setTimeout(() => {
        executeSave();
    }, 300);
  };

  const handleCancel = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (isSavingRef.current) return;
    
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Tab") {
      // Allow default tab behavior (focus move) but trigger save
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    if (isSavingRef.current) return;
    handleCancel();
  };


  

  const initials = getInitials(comment.authorName);

  const renderContent = () => {
    const text = comment.content || ""
    const mentions = (comment.metadata?.mentions || []).map((m) => (m || "").toLowerCase())
    if (!text || mentions.length === 0) return text
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const pattern = new RegExp(`@(${mentions.map(esc).join("|")})\\b`, "gi")
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = pattern.exec(text))) {
      if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index))
      const matched = m[0]
      parts.push(
        <span key={`m-${m.index}`} className="text-primary font-medium">
          {matched}
        </span>
      )
      lastIndex = m.index + matched.length
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    return parts
  }

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
          <div className="flex items-start justify-between gap-2">
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
              {comment.isPinned && <PinnedBadge />}
              {hasReplies && onToggleCollapse && (
                <CommentCollapseToggle
                  isCollapsed={isCollapsed}
                  replyCount={comment.replyCount}
                  onToggle={onToggleCollapse!}
                  className="ml-auto sm:ml-0"
                />
              )}
            </div>

            {!isEditing && (
              <div>
                <CommentActions
                  commentId={comment.id}
                  postId={comment.postId}
                  isAuthor={!!isAuthor}
                  canDelete={canDelete}
                  canPin={!!isOwner}
                  isPinned={!!comment.isPinned}
                  onEdit={() => setIsEditing(true)}
                  onDeleteSuccess={onUpdate}
                />
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="min-h-[80px] resize-none text-sm bg-card border-border focus:border-primary transition-colors"
                disabled={isPending}
                autoFocus
                aria-label="Edit comment"
                aria-describedby="edit-instructions"
              />
              <div id="edit-instructions" className="text-xs text-accent mt-1">
                Press Enter/Tab to save, Press Esc to cancel
              </div>
            </div>
          ) : (
            <>
              {comment.content && (
                <div className="text-[15px] text-foreground/90 whitespace-pre-wrap break-words leading-7 font-normal">
                  {renderContent()}
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
          <div className="flex items-center justify-between mt-2">
            <CommentVote
              commentId={comment.id}
              postId={comment.postId}
              initialUpvotes={comment.upvotes}
              initialHasVoted={comment.hasVoted || false}
            />

            {canReply && (
              <CommentReplyButton
                onClick={() => setShowReplyForm(!showReplyForm)}
                isActive={showReplyForm}
                className={cn(
                  "rounded-full border border-border px-3 py-1 h-auto transition-all duration-200 bg-transparent",
                  showReplyForm
                    ? "text-destructive hover:text-destructive"
                    : "text-muted-foreground/70 hover:text-foreground"
                )}
              />
            )}
          </div>
        )}

        {showReplyForm && (
          <div className="mt-3 pt-2">
            <div className="pl-1">
              <CommentForm
                postId={comment.postId}
                parentId={comment.id}
                workspaceSlug={workspaceSlug}
                onSuccess={() => {
                  setShowReplyForm(false);
                  onReplySuccess?.();
                }}
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
