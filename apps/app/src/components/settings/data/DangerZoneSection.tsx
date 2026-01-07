"use client";

import React from "react";
import { Input } from "@featul/ui/components/input";
import { Button } from "@featul/ui/components/button";
import { AlertDialogShell } from "@/components/global/AlertDialogShell";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@featul/ui/components/alert-dialog";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type Props = {
  slug: string;
  workspaceName?: string;
};

export default function DangerZoneSection({ slug, workspaceName }: Props) {
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
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Danger Zone</h3>
        <p className="text-sm text-accent mt-1">
          Delete this workspace permanently. This action cannot be undone.
        </p>
      </div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={isPending || !slug}
        className="h-8 gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete Workspace
      </Button>

      <AlertDialogShell
        open={open}
        onOpenChange={(next) => {
          if (isPending) return;
          setOpen(next);
          if (!next) setConfirmName("");
        }}
        title="Are you absolutely sure?"
      >
        <div className="space-y-3 text-sm text-muted-foreground mb-2">
          <span className="block">
            This will permanently delete{" "}
            <span className="font-semibold text-red-500">
              {workspaceName || slug}
            </span>{" "}
            and{" "}
            <span className="font-semibold">
              all content within this workspace
            </span>
            .
          </span>
          {expectedName ? (
            <span className="block">
              To confirm, type the workspace name{" "}
              <span className="font-mono text-red-500">{expectedName}</span>{" "}
              below.
            </span>
          ) : (
            <span className="block">
              To confirm, type the workspace name below.
            </span>
          )}
        </div>
        <div className="mt-3">
          <Input
            autoFocus
            placeholder={expectedName || "Workspace name"}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            disabled={isPending}
            className="h-10"
          />
        </div>
        <AlertDialogFooter className="flex justify-end gap-2 mt-2">
          <AlertDialogCancel
            disabled={isPending}
            className="h-8 px-3 text-sm"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (!disableConfirm) handleDelete();
            }}
            disabled={disableConfirm}
            className="h-8 px-4 text-sm bg-red-500 hover:bg-red-600 text-white"
          >
            {isPending ? "Deleting..." : "Delete workspace"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogShell>
    </div>
  );
}
