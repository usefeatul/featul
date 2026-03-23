"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@featul/ui/components/table";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import { LoadingButton } from "@/components/global/loading-button";
import PlanNotice from "../global/PlanNotice";
import ModalCreateBoard from "../feedback/ModalCreateBoard";
import { MoreVertical } from "lucide-react";
import {
  assertBoardMutationOk,
  setFeedbackBoardsCache,
  useFeedbackBoardsSettings,
  type FeedbackBoardSettings,
} from "@/hooks/feedback-board-settings";
import { getPlanLimits, normalizePlan } from "@/lib/plan";

export default function ManageBoards({
  slug,
  plan,
  initialBoards,
}: {
  slug: string;
  plan?: string;
  initialBoards?: FeedbackBoardSettings[];
}) {
  const queryClient = useQueryClient();
  const {
    data: boards = [],
    isLoading,
    refetch,
  } = useFeedbackBoardsSettings(slug, initialBoards);

  const otherBoards = React.useMemo(
    () =>
      (boards || []).filter(
        (b) => b.slug !== "roadmap" && b.slug !== "changelog",
      ),
    [boards],
  );
  const limits = React.useMemo(
    () => getPlanLimits(normalizePlan(plan || "free")),
    [plan],
  );
  const boardLimit = limits.maxNonSystemBoards;
  const hasReachedBoardLimit =
    typeof boardLimit === "number" && otherBoards.length >= boardLimit;
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [actionOpenId, setActionOpenId] = React.useState<string | null>(null);

  const setVisibility = async (boardSlug: string, isPublic: boolean) => {
    try {
      setFeedbackBoardsCache(queryClient, slug, (boards) =>
        boards.map((it) => (it.slug === boardSlug ? { ...it, isPublic } : it)),
      );
    } catch {
      //
    }
    try {
      const res = await client.board.updateSettings.$post({
        slug,
        boardSlug,
        patch: { isPublic },
      });
      await assertBoardMutationOk(res, "Update failed");
      await refetch();
      toast.success(isPublic ? "Board set to Public" : "Board set to Private");
    } catch (e: unknown) {
      await refetch();
      toast.error((e as { message?: string })?.message || "Failed to update");
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">Manage Boards</div>
      <div className="text-sm text-accent">
        Boards are the main way to organize your feedback. They are buckets that
        contain all of the feedback for a specific product or feature.
      </div>
      <div className="rounded-md  border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Board</TableHead>
              <TableHead className="px-4 w-36 text-center">Type</TableHead>
              <TableHead className="px-2 w-10 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(otherBoards || []).length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="px-4 py-6 text-accent">
                  No boards
                </TableCell>
              </TableRow>
            ) : (
              (otherBoards || []).map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="px-4 text-sm">{b.name}</TableCell>
                  <TableCell className="px-4 text-center">
                    <Popover
                      open={menuOpenId === b.id}
                      onOpenChange={(v) =>
                        setMenuOpenId(v ? String(b.id) : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <LoadingButton
                          type="button"
                          variant="nav"
                          size="sm"
                          aria-label="Board Type"
                        >
                          <span className="text-sm">
                            {b.isPublic ? "Public" : "Private"}
                          </span>
                        </LoadingButton>
                      </PopoverTrigger>
                      <PopoverContent list className="min-w-0 w-fit">
                        <PopoverList>
                          <PopoverListItem
                            role="menuitemradio"
                            aria-checked={b.isPublic}
                            onClick={() => {
                              setMenuOpenId(null);
                              setVisibility(String(b.slug), true);
                            }}
                          >
                            Public
                          </PopoverListItem>
                          <PopoverListItem
                            role="menuitemradio"
                            aria-checked={!b.isPublic}
                            onClick={() => {
                              setMenuOpenId(null);
                              setVisibility(String(b.slug), false);
                            }}
                          >
                            Private
                          </PopoverListItem>
                        </PopoverList>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell className="px-2 text-center">
                    <Popover
                      open={actionOpenId === b.id}
                      onOpenChange={(v) =>
                        setActionOpenId(v ? String(b.id) : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <LoadingButton
                          type="button"
                          variant="nav"
                          size="sm"
                          aria-label="More"
                          className="px-2"
                        >
                          <MoreVertical className="size-4 opacity-70" />
                        </LoadingButton>
                      </PopoverTrigger>
                      <PopoverContent list className="min-w-0 w-fit">
                        <PopoverList>
                          <PopoverListItem
                            role="menuitem"
                            onClick={async () => {
                              setActionOpenId(null);
                              try {
                                const res = await client.board.delete.$post({
                                  slug,
                                  boardSlug: String(b.slug),
                                });
                                await assertBoardMutationOk(
                                  res,
                                  "Delete failed",
                                );
                                toast.success("Board deleted");
                                await refetch();
                              } catch (e: unknown) {
                                toast.error(
                                  (e as { message?: string })?.message ||
                                    "Failed to delete board",
                                );
                              }
                            }}
                          >
                            <span className="text-sm text-red-500">Delete</span>
                          </PopoverListItem>
                        </PopoverList>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <PlanNotice
        slug={slug}
        feature="boards"
        plan={plan}
        boardsCount={(otherBoards || []).length}
      />
      <div className="mt-2 flex items-center justify-start">
        <LoadingButton
          type="button"
          variant="quiet"
          onClick={() => setCreateOpen(true)}
        >
          Create board
        </LoadingButton>
      </div>
      <ModalCreateBoard
        open={createOpen}
        onOpenChange={setCreateOpen}
        saving={creating}
        onSave={async ({ name, slug: boardSlug }) => {
          if (hasReachedBoardLimit) {
            toast.error(
              typeof boardLimit === "number"
                ? `Boards limit reached (${boardLimit})`
                : "Boards limit reached",
            );
            return;
          }

          const n = String(name || "").trim();
          const s = String(boardSlug || "").trim();
          if (!n) return;
          try {
            setCreating(true);
            const res = await client.board.create.$post({
              slug,
              name: n,
              boardSlug: s || undefined,
            });
            await assertBoardMutationOk(res, "Create failed");
            toast.success("Board created");
            setCreateOpen(false);
            await refetch();
          } catch (e: unknown) {
            toast.error(
              (e as { message?: string })?.message || "Failed to create board",
            );
          } finally {
            setCreating(false);
          }
        }}
      />
    </div>
  );
}
