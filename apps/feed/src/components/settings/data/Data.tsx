"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import { Input } from "@oreilla/ui/components/input";
import { Button } from "@oreilla/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@oreilla/ui/components/alert-dialog";
import { client } from "@oreilla/api/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  slug: string;
  workspaceName?: string;
};

export default function DataSection({ slug, workspaceName }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [confirmName, setConfirmName] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  const handleDelete = React.useCallback(() => {
    if (!slug) return;
    startTransition(async () => {
      try {
        const res = await client.workspace.delete.$post({
          slug,
          confirmName: confirmName.trim(),
        });
        const data = await res.json().catch(() => ({} as any));
        if (!res.ok || !data?.ok) {
          const message =
            (data as any)?.message || "Failed to delete workspace";
          toast.error(message);
          return;
        }

        toast.success("Workspace deleted");

        // After delete, try to move the user to another workspace if they have one.
        let nextSlug: string | null = null;
        try {
          const listRes = await client.workspace.listMine.$get();
          const listData = await listRes.json().catch(() => ({} as any));
          const workspaces = ((listData as any).workspaces ||
            []) as { slug: string }[];
          const remaining = workspaces.filter((w) => w.slug !== slug);
          nextSlug = remaining[0]?.slug || null;
        } catch {
          nextSlug = null;
        }

        if (nextSlug) {
          router.push(`/workspaces/${nextSlug}`);
        } else {
          router.push("/start");
        }
        router.refresh();
      } catch (error) {
        console.error("Failed to delete workspace", error);
        toast.error("Failed to delete workspace");
      } finally {
        setOpen(false);
        setConfirmName("");
      }
    });
  }, [slug, confirmName, router]);

  const expectedName = String(workspaceName || "").trim();
  const disableConfirm =
    isPending ||
    !expectedName ||
    !confirmName.trim() ||
    confirmName.trim() !== expectedName;

  return (
    <SectionCard
      title="Danger zone"
      description="Delete this workspace and all of its data."
    >
      <div className="space-y-4">
        <p className="text-sm text-accent">
          Deleting a workspace is permanent and cannot be undone. All boards,
          posts, tags, members, and settings will be removed.
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={() => setOpen(true)}
          disabled={isPending || !slug}
        >
          Delete workspace
        </Button>

        <AlertDialog
          open={open}
          onOpenChange={(next) => {
            if (isPending) return;
            setOpen(next);
            if (!next) setConfirmName("");
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3 text-sm text-accent">
                <span className="block">
                  This will permanently delete{" "}
                  <span className="font-semibold text-red-500">
                    {workspaceName || slug}
                  </span>{" "}
                  and <span className="font-semibold">all content within this workspace</span>.
                </span>
                <span className="block font-medium text-red-500">
                  This action cannot be undone.
                </span>
                {expectedName ? (
                  <span className="block">
                    To confirm, type the workspace name{" "}
                    <span className="font-mono text-foreground/80">
                      {expectedName}
                    </span>{" "}
                    below.
                  </span>
                ) : (
                  <span className="block">
                    To confirm, type the workspace name below.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-3">
              <Input
                autoFocus
                placeholder={expectedName || "Workspace name"}
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  if (!disableConfirm) handleDelete();
                }}
                disabled={disableConfirm}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {isPending ? "Deleting..." : "Delete workspace"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SectionCard>
  );
}
