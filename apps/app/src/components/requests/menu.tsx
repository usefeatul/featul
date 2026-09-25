"use client";

import { usePathname } from "next/navigation";
import { Copy, EllipsisVertical, ExternalLink } from "@/components/global/icons";
import { Button } from "@featul/ui/components/button";
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem, PopoverSeparator } from "@featul/ui/components/popover";
import { RequestShareAction } from "@/components/subdomain/request/actions/RequestShareAction";
import { toast } from "sonner";
import { DeletePostButton } from "./DeletePostButton";

const itemClass = "text-sm hover:bg-black/10 focus-visible:bg-black/10 dark:hover:bg-white/10 dark:focus-visible:bg-white/10";

type MenuProps = { postId: string; workspaceSlug: string; title: string; backHref: string; readonly?: boolean; className?: string };

export default function Menu({ postId, workspaceSlug, title, backHref, readonly, className }: MenuProps) {
  const pathname = usePathname();
  const postSlug = pathname.split("/").filter(Boolean).at(-1) || "";
  const publicUrl = `https://${workspaceSlug}.featul.com/board/p/${encodeURIComponent(decodeURIComponent(postSlug))}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy the link. Please try again.");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="plain" className={className} aria-label="More request actions" title="More request actions">
          <EllipsisVertical className="size-[18px]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" list className="w-fit">
        <PopoverList>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-3 py-2 ${itemClass}`}>
            <ExternalLink className="size-4" />Visit
          </a>
          <RequestShareAction url={publicUrl} title={title} className={itemClass} />
          <PopoverListItem onClick={copyLink} className={itemClass}>
            <Copy className="size-4" /><span>Copy</span>
          </PopoverListItem>
          {!readonly ? <>
            <PopoverSeparator />
            <DeletePostButton postId={postId} workspaceSlug={workspaceSlug} backHref={backHref} className={itemClass} menuItem />
          </> : null}
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}
