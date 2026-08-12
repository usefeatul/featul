"use client";

import * as React from "react";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import { Textarea } from "@featul/ui/components/textarea";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import type {
  Board,
  IdentifiedUser,
  SimilarPost,
  WidgetApiBase,
  WidgetPost,
} from "./types";
import { viewerPayload } from "./utils";

type Props = {
  apiBase: WidgetApiBase;
  boards: Board[];
  boardId: string;
  onBoardChange: (boardId: string) => void;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  primaryColor?: string;
  onCancel: () => void;
  onCreated: (post: WidgetPost) => void;
};

export function WidgetFeedbackCompose({
  apiBase,
  boards,
  boardId,
  onBoardChange,
  userId,
  identity,
  primaryColor = "#3b82f6",
  onCancel: _onCancel,
  onCreated,
}: Props) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [similar, setSimilar] = React.useState<SimilarPost[]>([]);

  const selectedBoard = boards.find((board) => board.id === boardId) || boards[0];
  const canSubmit = Boolean(boardId) && title.trim().length >= 3 && !submitting;

  React.useEffect(() => {
    const q = title.trim();
    if (q.length < 2) {
      setSimilar([]);
      return;
    }
    let canceled = false;
    const timer = window.setTimeout(async () => {
      try {
        const res = await client.widget.similar.$get({
          ...apiBase,
          title: q.slice(0, 128),
          boardId: boardId || undefined,
        });
        if (!res.ok || canceled) return;
        const data = await res.json();
        if (!canceled) setSimilar(Array.isArray(data.posts) ? data.posts : []);
      } catch {
        if (!canceled) setSimilar([]);
      }
    }, 300);
    return () => {
      canceled = true;
      window.clearTimeout(timer);
    };
  }, [apiBase, boardId, title]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setMessage("");
    try {
      const fingerprint =
        userId || identity?.email ? undefined : await getBrowserFingerprint();
      const res = await client.widget.create.$post({
        ...viewerPayload(apiBase, { userId, identity, fingerprint }),
        boardId,
        title: title.trim().slice(0, 120),
        content: (content.trim() || title.trim()).slice(0, 5000),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const created = data.post;
      onCreated({
        id: created.id,
        title: created.title,
        slug: created.slug,
        content: created.content,
        upvotes: created.upvotes ?? 1,
        commentCount: created.commentCount ?? 0,
        roadmapStatus: created.roadmapStatus ?? "pending",
        createdAt: created.createdAt ?? new Date().toISOString(),
        boardId,
        boardName: selectedBoard?.name || null,
        boardSlug: selectedBoard?.slug || null,
        isAnonymous: created.isAnonymous ?? !(userId || identity?.email),
        authorName: identity?.name || null,
        authorImage: identity?.avatar || null,
        hasVoted: true,
      });
      setTitle("");
      setContent("");
      setSimilar([]);
    } catch {
      setMessage(
        identity && !userId
          ? "Identification failed. Check the email passed to identify()."
          : "Could not submit feedback.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      {boards.length > 1 ? (
        <select
          value={boardId}
          onChange={(event) => onBoardChange(event.target.value)}
          className="mb-3 h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-white outline-none"
          aria-label="Board"
        >
          {boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.name}
            </option>
          ))}
        </select>
      ) : null}

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="What's on your mind?"
        maxLength={120}
        autoFocus
        className="mb-1 w-full border-0 bg-transparent px-0 py-2 text-lg font-semibold text-white outline-none placeholder:text-white/30"
      />

      <Textarea
        variant="plain"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Add more detail..."
        className="min-h-0 flex-1 resize-none px-0 py-2 text-[15px] leading-relaxed text-white/85 shadow-none placeholder:text-white/25 focus-visible:ring-0"
      />

      {similar.length ? (
        <div className="mt-2 rounded-md bg-white/[0.04] p-3">
          <p className="text-xs font-semibold" style={{ color: primaryColor || "#3b82f6" }}>
            Similar requests
          </p>
          <ul className="mt-2 space-y-1.5">
            {similar.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-white/70">{item.title}</span>
                <span className="shrink-0 text-white/40">{item.upvotes || 0} votes</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {message ? (
        <p className="mt-3 rounded-md bg-white/[0.05] px-3 py-2 text-sm text-white/85">{message}</p>
      ) : null}

      <div className="flex items-center justify-end pt-4">
        <Button
          type="submit"
          variant="plain"
          disabled={!canSubmit}
          className="h-10 cursor-pointer rounded-md bg-white px-5 text-sm font-semibold text-neutral-900 hover:opacity-90 disabled:bg-white/20 disabled:text-white/35"
        >
          {submitting ? "Posting..." : "Post"}
        </Button>
      </div>
    </form>
  );
}
