"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@featul/auth/client";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import { Plus } from "@/components/global/icons";
import { CreatePostModal } from "@/components/post/CreatePostModal";
import { getSlugFromPath } from "@/config/nav";
import FiltersAction from "./actions/FiltersAction";
import SearchAction from "./actions/SearchAction";

const actionButtonClass =
  "h-8 rounded-lg border-0 bg-black/5! bg-none text-accent shadow-none ring-0 before:hidden hover:bg-black/[0.08]! hover:text-foreground dark:bg-secondary! dark:hover:bg-muted!";

export default function HeaderActions({ className }: { className?: string }) {
  const pathname = usePathname();
  const workspaceSlug = getSlugFromPath(pathname);
  const { data: session, isPending } = useSession();
  const [createPostOpen, setCreatePostOpen] = useState(false);

  return (
    <div className={cn("ml-auto flex shrink-0 items-center gap-1", className)}>
      <SearchAction
        className={cn(
          actionButtonClass,
          "w-32 justify-start gap-2 border border-black/[0.03] px-2.5 text-xs dark:border-white/[0.03] sm:w-56 [&>span:last-child]:hidden sm:[&>span:last-child]:inline-flex [&_kbd]:rounded-[3px]",
        )}
      />
      <FiltersAction className={cn(actionButtonClass, "size-8 p-0")} />
      <Button
        type="button"
        variant="default"
        size="sm"
        className="h-8 gap-1.5 bg-primary px-2 text-primary-foreground"
        aria-label="Create post"
        title="Create post"
        aria-haspopup="dialog"
        disabled={isPending || !session?.user}
        onClick={() => setCreatePostOpen(true)}
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">Create post</span>
      </Button>
      {createPostOpen ? (
        <CreatePostModal
          open={createPostOpen}
          onOpenChange={setCreatePostOpen}
          workspaceSlug={workspaceSlug}
          user={session?.user}
        />
      ) : null}
    </div>
  );
}
